import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isWatch = pathname.startsWith("/watch");
  const [open, setOpen] = useState(() => window.innerWidth >= 1024 && !isWatch);

  useEffect(() => {
    if (isWatch || window.innerWidth < 1024) setOpen(false);
  }, [pathname, isWatch]);

  if (!user) return <Navigate to="/login" replace state={{ from: pathname }} />;

  const overlay = isWatch || window.innerWidth < 1024;
  return (
    <>
      <Header onMenu={() => setOpen((o) => !o)} />
      {open && (
        <>
          {overlay && <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />}
          <aside className={`fixed bottom-0 left-0 top-14 ${overlay ? "z-50" : "z-30"}`}><Sidebar /></aside>
        </>
      )}
      <main className={`min-h-screen pt-14 ${open && !overlay ? "lg:pl-60" : ""}`}>
        <div className="p-4 sm:p-6"><Outlet /></div>
      </main>
    </>
  );
}
