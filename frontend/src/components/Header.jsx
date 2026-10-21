import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Icon from "./Icon.jsx";
import { Avatar } from "./ui.jsx";

export const Logo = () => (
  <Link to="/" className="flex items-center gap-1 text-xl font-bold tracking-tight" aria-label="VideoTube home">
    <svg viewBox="0 0 28 20" width="30" height="21" aria-hidden="true"><rect width="28" height="20" rx="5" fill="#f00" /><path d="M11 5.5v9l8-4.5z" fill="#fff" /></svg>
    VideoTube
  </Link>
);

export default function Header({ onMenu }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => setQ(params.get("q") || ""), [params]);
  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const search = (e) => {
    e.preventDefault();
    nav(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/");
  };

  const voice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return toast("Voice search isn't supported in this browser.");
    const r = new SR();
    r.lang = "en-US";
    r.onresult = (e) => nav(`/?q=${encodeURIComponent(e.results[0][0].transcript)}`);
    r.onerror = () => toast("Couldn't hear anything. Try again.");
    r.start();
    toast("Listening…");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-2 bg-yt-panel px-3 sm:px-4">
      <div className="flex items-center gap-3 sm:gap-5">
        <button onClick={onMenu} aria-label="Toggle menu" className="rounded-full p-2 hover:bg-yt-hover"><Icon name="menu" /></button>
        <Logo />
      </div>

      <form onSubmit={search} className="hidden max-w-xl flex-1 items-center gap-3 sm:flex" role="search">
        <div className="flex flex-1">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search videos"
            className="w-full rounded-l-full border border-yt-line bg-[#121212] px-4 py-2 focus:border-[#3ea6ff] focus:outline-none" />
          <button aria-label="Search" className="rounded-r-full border border-l-0 border-yt-line bg-yt-hover px-5"><Icon name="search" size={22} /></button>
        </div>
        <button type="button" onClick={voice} aria-label="Search with your voice" className="rounded-full bg-yt-hover p-2.5 hover:bg-yt-line"><Icon name="mic" size={22} /></button>
      </form>

      <div className="flex items-center gap-1 sm:gap-2">
        <Link to="/?q=" aria-label="Search" className="rounded-full p-2 hover:bg-yt-hover sm:hidden"><Icon name="search" /></Link>
        <Link to="/upload" aria-label="Upload video" className="rounded-full p-2 hover:bg-yt-hover"><Icon name="upload" /></Link>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setOpen(!open)} aria-label="Account menu" aria-expanded={open}><Avatar user={user} size={32} /></button>
          {open && (
            <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl bg-yt-panel py-2 shadow-xl ring-1 ring-yt-line" onClick={() => setOpen(false)}>
              <div className="flex items-center gap-3 border-b border-yt-line px-4 pb-3">
                <Avatar user={user} size={40} />
                <div className="min-w-0"><p className="truncate font-medium">{user?.fullname}</p><p className="truncate text-sm text-yt-sub">@{user?.username}</p></div>
              </div>
              {[["/channel/" + user?.username, "video", "Your channel"], ["/dashboard", "library", "Studio"], ["/settings", "settings", "Settings"]].map(([to, icon, label]) => (
                <Link key={to} to={to} className="flex items-center gap-4 px-4 py-2 hover:bg-yt-hover"><Icon name={icon} size={22} />{label}</Link>
              ))}
              <button onClick={logout} className="flex w-full items-center gap-4 px-4 py-2 hover:bg-yt-hover"><Icon name="logout" size={22} />Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
