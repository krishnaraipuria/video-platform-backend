import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../components/Header.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";

function Shell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-yt-panel p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="mt-3 text-2xl font-medium">{title}</h1>
          <p className="text-sm text-yt-sub">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, ...p }) => (
  <label className="block text-sm">
    <span className="mb-1 block text-yt-sub">{label}</span>
    <input className="input" {...p} />
  </label>
);

export function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await login(id.includes("@") ? { email: id.trim(), password } : { username: id.trim().toLowerCase(), password });
      nav(state?.from || "/", { replace: true });
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <Shell title="Sign in" subtitle="to continue to VideoTube">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Username or email" value={id} onChange={(e) => setId(e.target.value)} required autoFocus autoComplete="username" />
        <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        {busy && <p className="text-xs text-yt-sub">The server may take up to a minute to wake up on the first request.</p>}
        <button disabled={busy} className="btn btn-white w-full justify-center">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-yt-sub">New here? <Link to="/register" className="text-[#3ea6ff]">Create an account</Link></p>
    </Shell>
  );
}

export function Register() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ fullname: "", username: "", email: "", password: "" });
  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!avatar) return setError("Choose an avatar image to continue.");
    setBusy(true); setError("");
    try {
      const form = new FormData();
      Object.entries(f).forEach(([k, v]) => form.append(k, v));
      form.append("avatar", avatar);
      if (cover) form.append("coverImage", cover);
      await api.register(form);
      await login({ username: f.username.toLowerCase(), password: f.password });
      nav("/", { replace: true });
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <Shell title="Create your account" subtitle="Upload videos, subscribe and comment">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" value={f.fullname} onChange={set("fullname")} required />
        <Field label="Username" value={f.username} onChange={set("username")} required autoComplete="username" />
        <Field label="Email" type="email" value={f.email} onChange={set("email")} required autoComplete="email" />
        <Field label="Password" type="password" value={f.password} onChange={set("password")} required autoComplete="new-password" />
        <Field label="Avatar (required)" type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
        <Field label="Cover image (optional)" type="file" accept="image/*" onChange={(e) => setCover(e.target.files[0])} />
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button disabled={busy} className="btn btn-white w-full justify-center">{busy ? "Creating account…" : "Create account"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-yt-sub">Already registered? <Link to="/login" className="text-[#3ea6ff]">Sign in</Link></p>
    </Shell>
  );
}
