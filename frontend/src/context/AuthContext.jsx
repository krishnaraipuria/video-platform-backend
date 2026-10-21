import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, remember, tokens } from "../lib/api.js";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => remember(readUser()));

  const setUser = useCallback((u) => {
    // keep the cached copy in sync; tokens/password never stored on the user object
    if (u) localStorage.setItem("user", JSON.stringify(u));
    setUserState(remember(u));
  }, []);

  const login = async (credentials) => {
    const data = await api.login(credentials);
    tokens.set(data);
    setUser(data.user);
    return data.user;
  };

  const logout = useCallback(async () => {
    try { await api.logout(); } catch { /* already signed out server-side */ }
    tokens.clear();
    setUserState(null);
  }, []);

  useEffect(() => {
    const onExpired = () => setUserState(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  return <AuthCtx.Provider value={{ user, setUser, login, logout }}>{children}</AuthCtx.Provider>;
}
