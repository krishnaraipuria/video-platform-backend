import { useState } from "react";
import { Avatar, PageTitle } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../lib/api.js";
import { secure } from "../lib/utils.js";

const Card = ({ title, children }) => (
  <section className="mb-6 rounded-xl bg-yt-panel p-6"><h2 className="mb-4 text-lg font-medium">{title}</h2>{children}</section>
);

export default function Settings() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [fullname, setFullname] = useState(user.fullname);
  const [email, setEmail] = useState(user.email);
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");

  const run = async (fn, ok) => { try { await fn(); toast(ok); } catch (e) { toast(e.message); } };
  const merge = (u) => setUser({ ...user, ...u });

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle>Settings</PageTitle>
      <Card title="Profile pictures">
        {user.coverImage && <img src={secure(user.coverImage)} alt="" className="mb-4 h-28 w-full rounded-lg object-cover" />}
        <div className="flex items-center gap-4"><Avatar user={user} size={64} />
          <div className="space-y-3 text-sm">
            <label className="block"><span className="mb-1 block text-yt-sub">New avatar</span>
              <input type="file" accept="image/*" className="input" onChange={(e) => {
                const f = new FormData(); f.append("avatar", e.target.files[0]);
                run(async () => merge(await api.updateAvatar(f)), "Avatar updated");
              }} /></label>
            <label className="block"><span className="mb-1 block text-yt-sub">New cover image</span>
              <input type="file" accept="image/*" className="input" onChange={(e) => {
                const f = new FormData(); f.append("coverimage", e.target.files[0]);
                run(async () => merge(await api.updateCover(f)), "Cover image updated");
              }} /></label>
          </div>
        </div>
      </Card>
      <Card title="Account details">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(async () => merge(await api.updateAccount({ fullname, email })), "Account updated"); }}>
          <input className="input" value={fullname} onChange={(e) => setFullname(e.target.value)} required aria-label="Full name" />
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email" />
          <button className="btn btn-white">Save changes</button>
        </form>
      </Card>
      <Card title="Change password">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(async () => { await api.changePassword({ oldPassword, newPassword }); setOld(""); setNew(""); }, "Password changed"); }}>
          <input className="input" type="password" placeholder="Current password" value={oldPassword} onChange={(e) => setOld(e.target.value)} required autoComplete="current-password" />
          <input className="input" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNew(e.target.value)} required autoComplete="new-password" />
          <button className="btn btn-white">Update password</button>
        </form>
      </Card>
    </div>
  );
}
