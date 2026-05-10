import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();
const API_BASE = "http://localhost:5000/api";

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("todo_token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("todo_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [authLoading, setAuthLoading] = useState(Boolean(token));

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token],
  );

  const saveSession = (session) => {
    setToken(session.token);
    setUser(session.user);
    localStorage.setItem("todo_token", session.token);
    localStorage.setItem("todo_user", JSON.stringify(session.user));
  };

  const login = async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Login gagal");
    saveSession(json.data);
  };

  const register = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Registrasi gagal");
    await login({ email: payload.email, password: payload.password });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("todo_token");
    localStorage.removeItem("todo_user");
  };

  useEffect(() => {
    if (!token) {
      setAuthLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Sesi tidak valid");
        setUser(json.data);
        localStorage.setItem("todo_user", JSON.stringify(json.data));
      } catch (error) {
        console.error(error);
        logout();
      } finally {
        setAuthLoading(false);
      }
    };

    loadProfile();
  }, [token, authHeaders]);

  return (
    <AuthContext.Provider
      value={{
        API_BASE,
        token,
        user,
        isAdmin: user?.roles?.includes("admin") || false,
        authHeaders,
        authLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
