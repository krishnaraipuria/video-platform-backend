const BASE = (import.meta.env.VITE_API_URL || "https://video-platform-backend-z1p6.onrender.com/api/v1").replace(/\/$/, "");

export const tokens = {
  get access() { return localStorage.getItem("accesstoken"); },
  get refresh() { return localStorage.getItem("refreshtoken"); },
  set({ accesstoken, refreshtoken }) {
    if (accesstoken) localStorage.setItem("accesstoken", accesstoken);
    if (refreshtoken) localStorage.setItem("refreshtoken", refreshtoken);
  },
  clear() {
    ["accesstoken", "refreshtoken", "user"].forEach((k) => localStorage.removeItem(k));
  },
};


const directory = new Map();
export const remember = (u) => {
  if (u && u._id) directory.set(String(u._id), { ...directory.get(String(u._id)), ...u });
  return u;
};
export const lookup = (id) => (id ? directory.get(String(typeof id === "object" ? id._id : id)) : undefined);

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

const FALLBACK = {
  400: "Please check the details and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "That already exists.",
  500: "The server had a problem. Please try again.",
};

async function parse(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { // HTML error page}
  const m = text.match(/Error:\s*([^<\n]+)/);
  return { message: m ? m[1].trim() : "" };
}

let refreshing = null;
async function refreshTokens() {
  if (!tokens.refresh) return false;
  refreshing ??= fetch(`${BASE}/users/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshtoken: tokens.refresh }),
  })
    .then(async (r) => {
      if (!r.ok) return false;
      tokens.set((await r.json()).data);
      return true;
    })
    .catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
}

async function request(path, { method = "GET", body, form, retry = true } = {}) {
  const headers = {};
  if (tokens.access) headers.Authorization = `Bearer ${tokens.access}`;
  let payload;
  if (form) payload = form;
  else if (body) { headers["Content-Type"] = "application/json"; payload = JSON.stringify(body); }

  let res;
  try {
    const init = payload ? { method, headers, body: payload } : { method, headers };
    res = await fetch(`${BASE}${path}`, init);
  } catch {
    throw new ApiError("Can't reach the server. It may be waking up — wait a minute and retry.", 0);
  }
  if (res.status === 401 && retry && !path.startsWith("/users/login") && !path.includes("refresh-token")) {
    if (await refreshTokens()) return request(path, { method, body, form, retry: false });
    tokens.clear();
    window.dispatchEvent(new Event("auth:expired"));
  }
  const json = await parse(res);
  if (!res.ok) throw new ApiError(json.message || FALLBACK[res.status] || "Something went wrong.", res.status);
  return json.data;
}


function upload(path, method, form, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${BASE}${path}`);
    if (tokens.access) xhr.setRequestHeader("Authorization", `Bearer ${tokens.access}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onerror = () => reject(new ApiError("Upload failed. Check your connection and try again.", 0));
    xhr.onload = () => {
      let json = {};
      try { json = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(json.data);
      else reject(new ApiError(json.message || FALLBACK[xhr.status] || "Upload failed.", xhr.status));
    };
    xhr.send(form);
  });
}

const qs = (o = {}) => {
  const s = new URLSearchParams(Object.entries(o).filter(([, v]) => v !== undefined && v !== "" && v !== null)).toString();
  return s ? `?${s}` : "";
};

export const api = {

  login: (b) => request("/users/login", { method: "POST", body: b }),
  register: (form) => request("/users/register", { method: "POST", form }),
  logout: () => request("/users/logout", { method: "POST" }),
  changePassword: (b) => request("/users/change-password", { method: "POST", body: b }),
  updateAccount: (b) => request("/users/update-account", { method: "PATCH", body: b }),
  updateAvatar: (form) => request("/users/update-avatar", { method: "PATCH", form }),
  updateCover: (form) => request("/users/cover-image", { method: "PATCH", form }),
  channel: async (username) => remember(await request(`/users/c/${encodeURIComponent(username)}`)),
  history: async () => {
    const d = await request("/users/history");
    d.forEach((v) => remember(v.owner));
    return d;
  },

  // videos
  videos: async (params) => {
    const d = await request(`/videos${qs(params)}`);
    d.docs?.forEach((v) => remember(v.ownerDetails));
    return d;
  },
  video: (id) => request(`/videos/${id}`),
  publishVideo: (form, onProgress) => upload("/videos/", "POST", form, onProgress),
  updateVideo: (id, b) => request(`/videos/${id}`, { method: "PATCH", body: b }),
  deleteVideo: (id) => request(`/videos/${id}`, { method: "DELETE" }),
  togglePublish: (id) => request(`/videos/toggle/publish/${id}`, { method: "PATCH" }),

  // comments
  comments: (videoId) => request(`/comments/${videoId}`),
  addComment: (videoId, content) => request(`/comments/${videoId}`, { method: "POST", body: { content } }),
  updateComment: (id, content) => request(`/comments/c/${id}`, { method: "PATCH", body: { content } }),
  deleteComment: (id) => request(`/comments/c/${id}`, { method: "DELETE" }),

  // likes
  likeVideo: (id) => request(`/likes/toggle/v/${id}`, { method: "POST" }),
  likeComment: (id) => request(`/likes/toggle/c/${id}`, { method: "POST" }),
  likeTweet: (id) => request(`/likes/toggle/t/${id}`, { method: "POST" }),
  likedVideos: () => request("/likes/videos"),

  // subscriptions (the backend's route names are swapped; these wrappers hide that)
  toggleSubscribe: (channelId) => request(`/subscriptions/c/${channelId}`, { method: "POST" }),
  subscribedTo: async (userId) => {
    const d = await request(`/subscriptions/c/${userId}`);
    d.forEach((s) => remember(s.channel));
    return d;
  },
  subscribersOf: (channelId) => request(`/subscriptions/u/${channelId}`),

  // playlists
  playlists: (userId) => request(`/playlist/user/${userId}`),
  playlist: (id) => request(`/playlist/${id}`),
  createPlaylist: (b) => request("/playlist", { method: "POST", body: b }),
  updatePlaylist: (id, b) => request(`/playlist/${id}`, { method: "PATCH", body: b }),
  deletePlaylist: (id) => request(`/playlist/${id}`, { method: "DELETE" }),
  addToPlaylist: (videoId, playlistId) => request(`/playlist/add/${videoId}/${playlistId}`, { method: "PATCH" }),
  removeFromPlaylist: (videoId, playlistId) => request(`/playlist/remove/${videoId}/${playlistId}`, { method: "PATCH" }),

  // tweets
  tweets: (userId) => request(`/tweets/user/${userId}`),
  createTweet: (content) => request("/tweets", { method: "POST", body: { content } }),
  updateTweet: (id, content) => request(`/tweets/${id}`, { method: "PATCH", body: { content } }),
  deleteTweet: (id) => request(`/tweets/${id}`, { method: "DELETE" }),

  // dashboard
  stats: () => request("/dashboard/stats"),
  myVideos: () => request("/dashboard/videos"),
};

// Look up user info for ids we haven't seen. Works for anyone with a published video.
export async function resolveUsers(ids) {
  const missing = [...new Set(ids.filter(Boolean).map((i) => String(typeof i === "object" ? i._id : i)))].filter((i) => !directory.has(i));
  await Promise.all(
    missing.slice(0, 15).map((id) => api.videos({ userId: id, limit: 1 }).catch(() => null))
  );
}
