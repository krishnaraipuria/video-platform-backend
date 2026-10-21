import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { useFetch } from "../lib/hooks.js";
import Icon from "./Icon.jsx";
import { Avatar } from "./ui.jsx";

const main = [["/", "home", "Home"], ["/explore", "explore", "Explore"], ["/subscriptions", "subs", "Subscriptions"]];
const lib = [["/playlists", "library", "Library"], ["/history", "history", "History"], ["/dashboard", "video", "Your Videos"], ["/playlists", "clock", "Watch Later"], ["/liked", "like", "Liked Videos"]];

const Item = ({ to, icon, label, end }) => (
  <NavLink to={to} end={end}
    className={({ isActive }) => `flex items-center gap-5 rounded-lg px-3 py-2 text-sm ${isActive && label !== "Watch Later" ? "bg-yt-hover font-medium" : "hover:bg-yt-hover"}`}>
    <Icon name={icon} size={22} />{label}
  </NavLink>
);

const Heading = ({ children }) => <h3 className="px-3 pb-1 pt-3 text-sm font-medium text-yt-sub">{children}</h3>;

export default function Sidebar() {
  const { user } = useAuth();
  const [all, setAll] = useState(false);
  const { data } = useFetch(() => api.subscribedTo(user._id), [user._id]);
  const channels = (data || []).map((s) => s.channel).filter(Boolean);
  const shown = all ? channels : channels.slice(0, 7);

  return (
    <nav aria-label="Main" className="h-full w-60 overflow-y-auto bg-yt-panel px-3 pb-8 pt-3">
      <div>{main.map(([to, icon, label]) => <Item key={label} to={to} icon={icon} label={label} end={to === "/"} />)}</div>
      <hr className="my-3 border-yt-line" />
      <div>{lib.map(([to, icon, label]) => <Item key={label} to={to} icon={icon} label={label} />)}</div>
      <hr className="my-3 border-yt-line" />
      <Heading>Subscriptions</Heading>
      {channels.length === 0 && <p className="px-3 py-2 text-sm text-yt-sub">Channels you subscribe to appear here.</p>}
      {shown.map((c) => (
        <Link key={c._id} to={`/channel/${c.username}`} className="flex items-center gap-5 rounded-lg px-3 py-2 text-sm hover:bg-yt-hover">
          <Avatar user={c} size={24} /><span className="truncate">{c.fullname || c.username}</span>
        </Link>
      ))}
      {channels.length > 7 && (
        <button onClick={() => setAll(!all)} className="flex w-full items-center gap-5 rounded-lg px-3 py-2 text-sm hover:bg-yt-hover">
          <Icon name="down" size={22} className={all ? "rotate-180" : ""} />{all ? "Show less" : `Show ${channels.length - 7} more`}
        </button>
      )}
      <hr className="my-3 border-yt-line" />
      <Item to="/settings" icon="settings" label="Settings" />
    </nav>
  );
}
