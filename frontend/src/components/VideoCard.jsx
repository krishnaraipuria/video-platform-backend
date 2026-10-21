import { Link } from "react-router-dom";
import { lookup } from "../lib/api.js";
import { formatDuration, formatViews, secure, timeAgo } from "../lib/utils.js";
import { Avatar } from "./ui.jsx";

// Works with list items (ownerDetails), history items (owner object) and bare owner ids.
export const ownerOf = (v) => v.ownerDetails || (v.owner && typeof v.owner === "object" ? v.owner : lookup(v.owner));

export default function VideoCard({ video, row = false, hideOwner = false, actions }) {
  const o = ownerOf(video);
  const thumb = (
    <Link to={`/watch/${video._id}`} className={`relative block shrink-0 overflow-hidden rounded-xl bg-yt-panel ${row ? "w-40 sm:w-44" : "w-full"}`}>
      <img src={secure(video.thumbnail)} alt="" loading="lazy" className="aspect-video w-full object-cover" />
      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-xs font-medium">{formatDuration(video.duration)}</span>
    </Link>
  );
  const meta = `${formatViews(video.views)} views • ${timeAgo(video.createdAt)}`;

  if (row)
    return (
      <div className="flex gap-3">
        {thumb}
        <div className="min-w-0 flex-1">
          <Link to={`/watch/${video._id}`} className="line-clamp-2 text-sm font-medium">{video.title}</Link>
          {!hideOwner && o && <Link to={`/channel/${o.username}`} className="mt-1 block truncate text-xs text-yt-sub hover:text-white">{o.fullname || o.username}</Link>}
          <p className="text-xs text-yt-sub">{meta}</p>
          {actions}
        </div>
      </div>
    );

  return (
    <div>
      {thumb}
      <div className="mt-3 flex gap-3">
        {!hideOwner && o && <Link to={`/channel/${o.username}`}><Avatar user={o} size={36} /></Link>}
        <div className="min-w-0 flex-1">
          <Link to={`/watch/${video._id}`} className="line-clamp-2 font-medium leading-snug">{video.title}</Link>
          {!hideOwner && o && <Link to={`/channel/${o.username}`} className="mt-1 block truncate text-sm text-yt-sub hover:text-white">{o.fullname || o.username}</Link>}
          <p className="text-sm text-yt-sub">{meta}</p>
          {actions}
        </div>
      </div>
    </div>
  );
}

export const VideoGrid = ({ children }) => (
  <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>
);
