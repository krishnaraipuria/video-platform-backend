import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { Login, Register } from "./pages/Auth.jsx";
import Home from "./pages/Home.jsx";
import Watch from "./pages/Watch.jsx";
import Channel from "./pages/Channel.jsx";
import Upload from "./pages/Upload.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Settings from "./pages/Settings.jsx";
import { History, Liked, Subscriptions } from "./pages/Lists.jsx";
import { PlaylistDetail, Playlists } from "./pages/Playlists.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Home trending />} />
        <Route path="watch/:id" element={<Watch />} />
        <Route path="channel/:username" element={<Channel />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="history" element={<History />} />
        <Route path="liked" element={<Liked />} />
        <Route path="playlists" element={<Playlists />} />
        <Route path="playlist/:id" element={<PlaylistDetail />} />
        <Route path="upload" element={<Upload />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
