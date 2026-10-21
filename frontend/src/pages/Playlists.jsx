import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import VideoCard from "../components/VideoCard.jsx";
import { Empty, ErrorBox, Modal, PageTitle, Spinner } from "../components/ui.jsx";
import Icon from "../components/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.js";
import { PlaylistGrid } from "./Channel.jsx";

function PlaylistForm({ initial = {}, onSubmit, onClose, title, cta }) {
  const [name, setName] = useState(initial.name || "");
  const [description, setDescription] = useState(initial.description || "");
  const [busy, setBusy] = useState(false);
  const go = async (e) => { e.preventDefault(); setBusy(true); await onSubmit({ name: name.trim(), description: description.trim() }); setBusy(false); };
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={go} className="space-y-3">
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required aria-label="Playlist name" />
        <textarea className="input" rows={3} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required aria-label="Playlist description" />
        <div className="text-right"><button disabled={busy} className="btn btn-white">{cta}</button></div>
      </form>
    </Modal>
  );
}

export function Playlists() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.playlists(user._id), [user._id]);
  const [creating, setCreating] = useState(false);
  const create = async (b) => {
    try { await api.createPlaylist(b); setCreating(false); toast("Playlist created"); reload(); } catch (e) { toast(e.message); }
  };
  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle right={<button onClick={() => setCreating(true)} className="btn btn-white">New playlist</button>}>Library</PageTitle>
      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && !data.length && <Empty icon="library" title="No playlists yet" hint="Create a playlist, then use Save on any video to add it." />}
      {data?.length > 0 && <PlaylistGrid list={data} />}
      {creating && <PlaylistForm title="New playlist" cta="Create" onSubmit={create} onClose={() => setCreating(false)} />}
    </div>
  );
}

export function PlaylistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);
  // The playlist API returns video ids only, so match them against the public video list.
  const { data, loading, error, reload, setData } = useFetch(async () => {
    const p = await api.playlist(id);
    const all = p.videos.length ? (await api.videos({ limit: 100 })).docs : [];
    return { ...p, items: p.videos.map((vid) => all.find((v) => v._id === vid)).filter(Boolean) };
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const mine = data.owner === user._id;

  const remove = async (v) => {
    try { await api.removeFromPlaylist(v._id, id); setData((d) => ({ ...d, items: d.items.filter((x) => x._id !== v._id) })); toast("Removed from playlist"); } catch (e) { toast(e.message); }
  };
  const del = async () => {
    if (!confirm(`Delete “${data.name}”?`)) return;
    try { await api.deletePlaylist(id); toast("Playlist deleted"); nav("/playlists"); } catch (e) { toast(e.message); }
  };
  const update = async (b) => {
    try { await api.updatePlaylist(id, b); setEditing(false); reload(); } catch (e) { toast(e.message); }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle right={mine && (
        <div className="flex gap-2">
          <button className="btn" onClick={() => setEditing(true)}><Icon name="edit" size={18} />Edit</button>
          <button className="btn" onClick={del}><Icon name="trash" size={18} />Delete</button>
        </div>
      )}>{data.name}</PageTitle>
      <p className="mb-6 text-yt-sub">{data.description} • {data.items.length} videos</p>
      {!data.items.length && <Empty icon="library" title="This playlist is empty" hint="Use Save on a video to add it here."><Link to="/" className="btn btn-white mt-3">Find videos</Link></Empty>}
      <div className="space-y-4">
        {data.items.map((v) => (
          <VideoCard key={v._id} video={v} row actions={mine && <button onClick={() => remove(v)} className="mt-1 text-xs text-yt-sub hover:text-white">Remove</button>} />
        ))}
      </div>
      {editing && <PlaylistForm title="Edit playlist" cta="Save" initial={data} onSubmit={update} onClose={() => setEditing(false)} />}
    </div>
  );
}
