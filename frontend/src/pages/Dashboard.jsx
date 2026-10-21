import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { Empty, ErrorBox, Modal, PageTitle, Spinner } from "../components/ui.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.js";
import { formatViews, secure, timeAgo } from "../lib/utils.js";

export default function Dashboard() {
  const toast = useToast();
  const stats = useFetch(() => api.stats(), []);
  const vids = useFetch(() => api.myVideos(), []);
  const [edit, setEdit] = useState(null);

  const toggle = async (v) => {
    try { const u = await api.togglePublish(v._id); vids.setData((d) => d.map((x) => (x._id === v._id ? u : x))); toast(u.isPublished ? "Published" : "Unpublished"); } catch (e) { toast(e.message); }
  };
  const del = async (v) => {
    if (!confirm(`Delete “${v.title}”? This can't be undone.`)) return;
    try { await api.deleteVideo(v._id); vids.setData((d) => d.filter((x) => x._id !== v._id)); toast("Video deleted"); } catch (e) { toast(e.message); }
  };
  const save = async (e) => {
    e.preventDefault();
    try { const u = await api.updateVideo(edit._id, { title: edit.title, description: edit.description }); vids.setData((d) => d.map((x) => (x._id === u._id ? u : x))); setEdit(null); toast("Changes saved"); } catch (err) { toast(err.message); }
  };

  const s = stats.data;
  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle right={<Link to="/upload" className="btn btn-white">Upload video</Link>}>Channel dashboard</PageTitle>
      {stats.error && <ErrorBox message={stats.error} onRetry={stats.reload} />}
      {s && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[["Subscribers", s.totalSubcribers], ["Videos", s.totalVideos], ["Views", s.totalViews], ["Likes", s.totalLikes]].map(([l, n]) => (
            <div key={l} className="rounded-xl bg-yt-panel p-4"><p className="text-3xl font-medium">{formatViews(n)}</p><p className="text-sm text-yt-sub">{l}</p></div>
          ))}
        </div>
      )}
      <h2 className="mb-3 text-lg font-medium">Your videos</h2>
      {vids.loading && <Spinner />}
      {vids.error && <ErrorBox message={vids.error} onRetry={vids.reload} />}
      {vids.data && !vids.data.length && <Empty title="You haven't uploaded anything" hint="Publish your first video to see it here."><Link to="/upload" className="btn btn-white mt-3">Upload video</Link></Empty>}
      <ul className="divide-y divide-yt-line">
        {vids.data?.map((v) => (
          <li key={v._id} className="flex flex-wrap items-center gap-4 py-3">
            <Link to={`/watch/${v._id}`}><img src={secure(v.thumbnail)} alt="" className="aspect-video w-36 rounded-lg object-cover" /></Link>
            <div className="min-w-0 flex-1">
              <Link to={`/watch/${v._id}`} className="line-clamp-2 font-medium">{v.title}</Link>
              <p className="text-sm text-yt-sub">{formatViews(v.views)} views • {timeAgo(v.createdAt)}</p>
            </div>
            <button onClick={() => toggle(v)} className={`btn ${v.isPublished ? "" : "text-yellow-400"}`} aria-pressed={v.isPublished}><Icon name="eye" size={18} />{v.isPublished ? "Published" : "Private"}</button>
            <button onClick={() => setEdit(v)} className="btn" aria-label={`Edit ${v.title}`}><Icon name="edit" size={18} /></button>
            <button onClick={() => del(v)} className="btn" aria-label={`Delete ${v.title}`}><Icon name="trash" size={18} /></button>
          </li>
        ))}
      </ul>
      {edit && (
        <Modal title="Edit video details" onClose={() => setEdit(null)}>
          <form onSubmit={save} className="space-y-3">
            <input className="input" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} required aria-label="Title" />
            <textarea className="input" rows={5} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} required aria-label="Description" />
            <div className="text-right"><button className="btn btn-white">Save changes</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
