import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import VideoCard, { VideoGrid } from "../components/VideoCard.jsx";
import { Avatar, Empty, ErrorBox, Spinner } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.js";
import { formatViews, secure, timeAgo } from "../lib/utils.js";

export default function Channel() {
  const { username } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("videos");
  const { data: ch, loading, error, setData, reload } = useFetch(() => api.channel(username), [username]);

  if (loading) return <Spinner label="Loading channel…" />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const mine = ch._id === user._id;

  const toggleSub = async () => {
    try {
      await api.toggleSubscribe(ch._id);
      setData((c) => ({ ...c, isSubsribed: !c.isSubsribed, subcriberscount: c.subcriberscount + (c.isSubsribed ? -1 : 1) }));
    } catch (e) { toast(e.message); }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {ch.coverImage ? <img src={secure(ch.coverImage)} alt="" className="h-32 w-full rounded-xl object-cover sm:h-48" /> : <div className="h-32 w-full rounded-xl bg-yt-panel sm:h-48" />}
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <Avatar user={ch} size={96} />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-medium">{ch.fullname}</h1>
          <p className="text-sm text-yt-sub">@{ch.username} • {formatViews(ch.subcriberscount)} subscribers</p>
          <div className="mt-3">
            {mine ? (
              <div className="flex gap-2"><Link to="/settings" className="btn">Customize channel</Link><Link to="/dashboard" className="btn">Manage videos</Link></div>
            ) : (
              <button onClick={toggleSub} className={`btn ${ch.isSubsribed ? "" : "btn-white"}`}>{ch.isSubsribed ? "Subscribed" : "Subscribe"}</button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-6 border-b border-yt-line" role="tablist">
        {[["videos", "Videos"], ["tweets", "Posts"], ["playlists", "Playlists"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`-mb-px border-b-2 py-3 text-sm font-medium ${tab === k ? "border-white" : "border-transparent text-yt-sub hover:text-white"}`}>{l}</button>
        ))}
      </div>
      <div className="pt-6">
        {tab === "videos" && <ChannelVideos id={ch._id} mine={mine} />}
        {tab === "tweets" && <Tweets id={ch._id} mine={mine} owner={ch} />}
        {tab === "playlists" && <ChannelPlaylists id={ch._id} />}
      </div>
    </div>
  );
}

function ChannelVideos({ id, mine }) {
  const { data, loading, error } = useFetch(() => api.videos({ userId: id, limit: 50 }), [id]);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  if (!data.docs.length) return <Empty title="No videos yet" hint={mine ? "Upload your first video to get started." : "This channel hasn't published anything."}>{mine && <Link to="/upload" className="btn btn-white mt-3">Upload video</Link>}</Empty>;
  return <VideoGrid>{data.docs.map((v) => <VideoCard key={v._id} video={v} hideOwner />)}</VideoGrid>;
}

function ChannelPlaylists({ id }) {
  const { data, loading, error } = useFetch(() => api.playlists(id), [id]);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  if (!data.length) return <Empty icon="library" title="No playlists" />;
  return <PlaylistGrid list={data} />;
}

export function PlaylistGrid({ list }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => (
        <Link key={p._id} to={`/playlist/${p._id}`} className="rounded-xl bg-yt-panel p-4 hover:bg-yt-hover">
          <div className="flex items-center gap-3"><Icon name="library" size={28} className="text-yt-sub" />
            <div className="min-w-0"><p className="truncate font-medium">{p.name}</p><p className="text-sm text-yt-sub">{p.videos.length} videos • updated {timeAgo(p.updatedAt)}</p></div>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-yt-sub">{p.description}</p>
        </Link>
      ))}
    </div>
  );
}

function Tweets({ id, mine, owner }) {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useFetch(() => api.tweets(id), [id]);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState({});

  const post = async (e) => {
    e.preventDefault();
    try { const t = await api.createTweet(text.trim()); setData((d) => [t, ...d]); setText(""); } catch (err) { toast(err.message); }
  };
  const save = async (t) => {
    try { await api.updateTweet(t._id, draft.trim()); setEditing(null); reload(); } catch (e) { toast(e.message); }
  };
  const del = async (t) => {
    try { await api.deleteTweet(t._id); setData((d) => d.filter((x) => x._id !== t._id)); } catch (e) { toast(e.message); }
  };
  const like = async (t) => {
    setLiked((l) => ({ ...l, [t._id]: !l[t._id] }));
    try { await api.likeTweet(t._id); } catch (e) { setLiked((l) => ({ ...l, [t._id]: !l[t._id] })); toast(e.message); }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  return (
    <div className="mx-auto max-w-2xl">
      {mine && (
        <form onSubmit={post} className="mb-6 rounded-xl bg-yt-panel p-4">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Share an update with your subscribers" aria-label="New post" className="input resize-none" />
          <div className="mt-2 text-right"><button disabled={!text.trim()} className="btn btn-white">Post</button></div>
        </form>
      )}
      {!data.length && <Empty icon="chat" title="No posts yet" />}
      <div className="space-y-4">
        {data.map((t) => (
          <article key={t._id} className="flex gap-3 rounded-xl bg-yt-panel p-4">
            <Avatar user={owner} size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-sm"><span className="font-medium">{owner.fullname}</span> <span className="text-xs text-yt-sub">{timeAgo(t.createdAt)}</span></p>
              {editing === t._id ? (
                <>
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} className="input mt-1" aria-label="Edit post" />
                  <div className="mt-2 flex justify-end gap-2"><button className="btn" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-white" onClick={() => save(t)}>Save</button></div>
                </>
              ) : <p className="mt-1 whitespace-pre-wrap break-words">{t.content}</p>}
              <div className="mt-2 flex items-center gap-3 text-xs text-yt-sub">
                <button onClick={() => like(t)} aria-pressed={!!liked[t._id]} className={`flex items-center gap-1 ${liked[t._id] ? "text-[#3ea6ff]" : "hover:text-white"}`}><Icon name="like" size={16} />{liked[t._id] ? "Liked" : "Like"}</button>
                {mine && editing !== t._id && (<><button className="hover:text-white" onClick={() => { setEditing(t._id); setDraft(t.content); }}>Edit</button><button className="hover:text-white" onClick={() => del(t)}>Delete</button></>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
