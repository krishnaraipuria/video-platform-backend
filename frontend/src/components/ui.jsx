import { secure } from "../lib/utils.js";
import Icon from "./Icon.jsx";

export function Avatar({ user, size = 36, className = "" }) {
  const name = user?.fullname || user?.username || "?";
  return user?.avatar ? (
    <img src={secure(user.avatar)} alt="" width={size} height={size} style={{ width: size, height: size }}
      className={`shrink-0 rounded-full object-cover bg-yt-hover ${className}`} />
  ) : (
    <span style={{ width: size, height: size, fontSize: size * 0.42 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-yt-hover font-medium uppercase ${className}`}>
      {name[0]}
    </span>
  );
}

export const Spinner = ({ label = "Loading…" }) => (
  <div className="flex items-center justify-center gap-3 p-10 text-yt-sub" role="status">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-yt-line border-t-white" />
    {label}
  </div>
);

export const ErrorBox = ({ message, onRetry }) => (
  <div className="m-6 rounded bg-yt-panel p-6 text-center">
    <p className="text-yt-sub">{message}</p>
    {onRetry && <button className="btn btn-white mt-4" onClick={onRetry}>Try again</button>}
  </div>
);

export const Empty = ({ icon = "video", title, hint, children }) => (
  <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
    <Icon name={icon} size={64} className="text-yt-line" />
    <h2 className="text-lg font-medium">{title}</h2>
    {hint && <p className="max-w-sm text-sm text-yt-sub">{hint}</p>}
    {children}
  </div>
);

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label={title} className="w-full max-w-md rounded-xl bg-yt-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-yt-hover"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const PageTitle = ({ children, right }) => (
  <div className="mb-5 flex items-center justify-between gap-3">
    <h1 className="text-2xl font-medium">{children}</h1>
    {right}
  </div>
);
