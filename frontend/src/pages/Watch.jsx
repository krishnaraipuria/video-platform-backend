import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { Avatar, ErrorBox, Modal, Spinner } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api, lookup, resolveUsers } from "../lib/api.js";
import { useFetch } from "../lib/hooks.js";
import { formatDate, formatViews, secure, timeAgo } from "../lib/utils.js";

// React StrictMode runs effects twice in dev; share one request so views aren't counted twice.
const inflight = new Map();
const fetchVideoOnce = (id) => {
  if (!inflight.has(id)) inflight.set(id, api.video(id).finally(() => setTimeout(() => inflight.delete(id), 1500)));
  return inflight.get(id);
};

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let off = false;
    setVideo(null); setChannel(null); setError(""); setExpanded(false);
    window.scrollTo(0, 0);
    (async () => {
      try {
        const v = await fetchVideoOnce(id);
        if (off) return;
        setVideo(v);
        const [likes] = await Promise.all([api.likedVideos().catch(() => []), resolveUsers([v.owner])]);
        if (off) return;
        setLiked(likes.some((l) => l.video?._id === id));
        const o = lookup(v.owner);
        if (o) setChannel(await api.channel(o.username));
      } catch (e) { if (!off) setError(e.message); }
    })();
    return () => { off = true; };
  }, [id]);

  if (error) return <ErrorBox message={error} />;
  if (!video) return <Spinner label="Loading video…" />;

  const isOwner = channel && channel._id === user._id;
  const toggleLike = async () => {
    setLiked((l) => !l);
    try { await api.likeVideo(id); } catch (e) { setLiked((l) => !l); toast(e.message); }
  };
  const toggleSub = async () => {
    try {
      await api.toggleSubscribe(channel._id);
      setChannel((c) => ({ ...c, isSubsribed: !c.isSubsribed, subcriberscount: c.subcriberscount + (c.isSubsribed ? -1 : 1) }));
    } catch (e) { toast(e.message); }
  };
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast("Link copied to clipboard"); }
    catch { toast("Couldn't copy the link."); }
  };

  const long = video.description?.length > 200;
  return (
    <div className="mx-auto flex max-w-[1700px] flex-col gap-6 xl:flex-row">
      <div className="min-w-0 flex-1">
        <video key={video._id} src={secure(video.videoFile)} poster={secure(video.thumbnail)} controls autoPlay playsInline
          className="aspect-video w-full rounded-xl bg-black" />
        <h1 className="mt-3 text-xl font-medium">{video.title}</h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {channel && (
              <>
                <Link to={`/channel/${channel.username}`}><Avatar user={channel} size={40} /></Link>
                <div className="min-w-0">
                  <Link to={`/channel/${channel.username}`} className="block truncate font-medium">{channel.fullname}</Link>
                  <p className="text-xs text-yt-sub">{formatViews(channel.subcriberscount)} subscribers</p>
                </div>
                {isOwner ? (
                  <Link to="/dashboard" className="btn btn-white ml-3">Manage video</Link>
                ) : (
                  <button onClick={toggleSub} className={`btn ml-3 ${channel.isSubsribed ? "" : "btn-white"}`}>
                    {channel.isSubsribed ? "Subscribed" : "Subscribe"}
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={toggleLike} aria-pressed={liked} className={`btn ${liked ? "text-[#3ea6ff]" : ""}`}><Icon name="like" size={20} />{liked ? "Liked" : "Like"}</button>
            <button onClick={share} className="btn"><Icon name="share" size={20} />Share</button>
            <button onClick={() => setSaving(true)} className="btn"><Icon name="save" size={20} />Save</button>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-yt-panel p-3 text-sm">
          <p className="font-medium">{formatViews(video.views)} views • {formatDate(video.createdAt)} ({timeAgo(video.createdAt)})</p>
          <p className="mt-2 whitespace-pre-wrap">{expanded || !long ? video.description : `${video.description.slice(0, 200)}…`}</p>
          {long && <button onClick={() => setExpanded(!expanded)} className="mt-2 font-medium text-yt-sub">{expanded ? "SHOW LESS" : "SHOW MORE"}</button>}
        </div>

        <Comments videoId={id} />
      </div>

      <Related currentId={id} owner={channel} />
      {saving && <SaveModal videoId={id} onClose={() => setSaving(false)} />}
    </div>
  );
}

function Related({ currentId, owner }) {
  const [only, setOnly] = useState(false);
  const { data, loading } = useFetch(() => api.videos({ limit: 30 }), []);
  const list = (data?.docs || []).filter((v) => v._id !== currentId && (!only || v.ownerDetails?._id === owner?._id));
  return (
    <aside className="w-full shrink-0 xl:w-[402px]">
      <div className="mb-4 flex gap-3">
        <button onClick={() => setOnly(false)} className={`rounded-lg px-3 py-1.5 text-sm ${!only ? "bg-white text-black" : "bg-yt-hover"}`}>All</button>
        {owner && <button onClick={() => setOnly(true)} className={`rounded-lg px-3 py-1.5 text-sm ${only ? "bg-white text-black" : "bg-yt-hover"}`}>From {owner.fullname}</button>}
      </div>
      {loading && <Spinner />}
      <div className="space-y-3">{list.map((v) => <VideoCard key={v._id} video={v} row />)}</div>
      {!loading && list.length === 0 && <p className="text-sm text-yt-sub">No other videos to show.</p>}
    </aside>
  );
}

function Comments({ videoId }) {
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState(null);
  const [text, setText] = useState("");
  const [, bump] = useState(0);
  const [likes, setLikes] = useState({});
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const loaded = useRef("");

  const load = async () => {
    try {
      const c = await api.comments(videoId);
      setList(c);
      await resolveUsers(c.map((x) => x.owner));
      bump((n) => n + 1);
    } catch (e) { toast(e.message); setList([]); }
  };
  useEffect(() => { if (loaded.current !== videoId) { loaded.current = videoId; setList(null); load(); } /* eslint-disable-next-line */ }, [videoId]);

  const add = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const c = await api.addComment(videoId, text.trim());
      setList((l) => [c, ...l]);
      setText("");
    } catch (err) { toast(err.message); }
  };
  const remove = async (c) => {
    try { await api.deleteComment(c._id); setList((l) => l.filter((x) => x._id !== c._id)); toast("Comment deleted"); }
    catch (e) { toast(e.message); }
  };
  const saveEdit = async (c) => {
    try { await api.updateComment(c._id, draft); setList((l) => l.map((x) => (x._id === c._id ? { ...x, content: draft.trim() } : x))); setEditing(null); }
    catch (e) { toast(e.message); }
  };
  const like = async (c) => {
    setLikes((l) => ({ ...l, [c._id]: !l[c._id] }));
    try { await api.likeComment(c._id); } catch (e) { setLikes((l) => ({ ...l, [c._id]: !l[c._id] })); toast(e.message); }
  };

  return (
    <section className="mt-6" aria-label="Comments">
      <h2 className="mb-4 text-lg font-medium">{list ? list.length : "…"} Comments</h2>
      <form onSubmit={add} className="mb-6 flex gap-3">
        <Avatar user={user} size={40} />
        <div className="flex-1">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a public comment…" aria-label="Add a comment"
            className="w-full border-b border-yt-line bg-transparent pb-1 focus:border-white focus:outline-none" />
          {text && (
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className="btn" onClick={() => setText("")}>Cancel</button>
              <button className="btn btn-white">Comment</button>
            </div>
          )}
        </div>
      </form>
      {list === null && <Spinner />}
      <div className="space-y-5">
        {list?.map((c) => {
          const o = (c.owner && typeof c.owner === "object" ? c.owner : lookup(c.owner)) || (c.owner === user._id ? user : null);
          const mine = String(c.owner?._id || c.owner) === user._id;
          return (
            <div key={c._id} className="flex gap-3">
              {o?.username ? <Link to={`/channel/${o.username}`}><Avatar user={o} size={40} /></Link> : <Avatar user={{ fullname: "?" }} size={40} />}
              <div className="min-w-0 flex-1">
                <p className="text-sm"><span className="font-medium">{o ? o.fullname || o.username : "Viewer"}</span> <span className="text-xs text-yt-sub">{timeAgo(c.createdAt)}</span></p>
                {editing === c._id ? (
                  <div className="mt-1">
                    <input value={draft} onChange={(e) => setDraft(e.target.value)} className="w-full border-b border-white bg-transparent pb-1 focus:outline-none" aria-label="Edit comment" autoFocus />
                    <div className="mt-2 flex justify-end gap-2"><button className="btn" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-white" onClick={() => saveEdit(c)}>Save</button></div>
                  </div>
                ) : <p className="whitespace-pre-wrap break-words text-sm">{c.content}</p>}
                <div className="mt-1 flex items-center gap-3 text-xs text-yt-sub">
                  <button onClick={() => like(c)} aria-pressed={!!likes[c._id]} className={`flex items-center gap-1 rounded-full p-1 hover:bg-yt-hover ${likes[c._id] ? "text-[#3ea6ff]" : ""}`}><Icon name="like" size={16} />{likes[c._id] ? "Liked" : "Like"}</button>
                  {mine && editing !== c._id && (
                    <>
                      <button onClick={() => { setEditing(c._id); setDraft(c.content); }} className="hover:text-white">Edit</button>
                      <button onClick={() => remove(c)} className="hover:text-white">Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {list?.length === 0 && <p className="text-sm text-yt-sub">No comments yet. Start the conversation.</p>}
    </section>
  );
}

function SaveModal({ videoId, onClose }) {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, setData } = useFetch(() => api.playlists(user._id), []);
  const [name, setName] = useState("");

  const toggle = async (p) => {
    const has = p.videos.includes(videoId);
    try {
      const updated = has ? await api.removeFromPlaylist(videoId, p._id) : await api.addToPlaylist(videoId, p._id);
      setData((d) => d.map((x) => (x._id === p._id ? updated : x)));
      toast(has ? `Removed from ${p.name}` : `Saved to ${p.name}`);
    } catch (e) { toast(e.message); }
  };
  const create = async (e) => {
    e.preventDefault();
    try {
      const p = await api.createPlaylist({ name: name.trim(), description: "Saved videos" });
      const updated = await api.addToPlaylist(videoId, p._id);
      setData((d) => [...(d || []), updated]);
      setName(""); toast(`Saved to ${p.name}`);
    } catch (e2) { toast(e2.message); }
  };

  return (
    <Modal title="Save to playlist" onClose={onClose}>
      {loading && <Spinner />}
      <ul className="max-h-60 space-y-1 overflow-y-auto">
        {data?.map((p) => (
          <li key={p._id}>
            <label className="flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-yt-hover">
              <input type="checkbox" checked={p.videos.includes(videoId)} onChange={() => toggle(p)} className="h-4 w-4" />{p.name}
            </label>
          </li>
        ))}
      </ul>
      {data?.length === 0 && <p className="mb-3 text-sm text-yt-sub">You don't have any playlists yet.</p>}
      <form onSubmit={create} className="mt-4 flex gap-2">
        <input className="input" placeholder="New playlist name" value={name} onChange={(e) => setName(e.target.value)} required />
        <button className="btn btn-white">Create</button>
      </form>
    </Modal>
  );
}
