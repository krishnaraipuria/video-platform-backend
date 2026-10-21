import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTitle } from "../components/ui.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../lib/api.js";

export default function Upload() {
  const nav = useNavigate();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [thumb, setThumb] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = useMemo(() => (thumb ? URL.createObjectURL(thumb) : ""), [thumb]);

  const submit = async (e) => {
    e.preventDefault();
    if (!video || !thumb) return setError("Choose both a video file and a thumbnail.");
    setBusy(true); setError(""); setProgress(0);
    const form = new FormData();
    form.append("title", title.trim());
    form.append("description", description.trim());
    form.append("videoFile", video);
    form.append("thumbnail", thumb);
    try {
      const v = await api.publishVideo(form, setProgress);
      toast("Video published");
      nav(`/watch/${v._id}`);
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle>Upload video</PageTitle>
      <form onSubmit={submit} className="space-y-5 rounded-xl bg-yt-panel p-6">
        <label className="block text-sm"><span className="mb-1 block text-yt-sub">Title</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} /></label>
        <label className="block text-sm"><span className="mb-1 block text-yt-sub">Description</span>
          <textarea className="input" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required /></label>
        <label className="block text-sm"><span className="mb-1 block text-yt-sub">Video file</span>
          <input className="input" type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} required /></label>
        <label className="block text-sm"><span className="mb-1 block text-yt-sub">Thumbnail</span>
          <input className="input" type="file" accept="image/*" onChange={(e) => setThumb(e.target.files[0])} required /></label>
        {preview && <img src={preview} alt="Thumbnail preview" className="aspect-video w-64 rounded-lg object-cover" />}
        {busy && (
          <div role="progressbar" aria-valuenow={progress} className="space-y-1">
            <div className="h-2 overflow-hidden rounded bg-yt-hover"><div className="h-full bg-yt-red transition-all" style={{ width: `${progress}%` }} /></div>
            <p className="text-xs text-yt-sub">{progress < 100 ? `Uploading… ${progress}%` : "Processing on the server — large videos can take a minute."}</p>
          </div>
        )}
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button disabled={busy} className="btn btn-red">{busy ? "Publishing…" : "Publish"}</button>
      </form>
    </div>
  );
}
