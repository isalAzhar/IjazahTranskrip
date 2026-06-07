// AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Blokir cache browser di level meta tag
  useEffect(() => {
    // Tambah meta no-cache secara dinamis
    const metas = [
      { httpEquiv: "Cache-Control", content: "no-cache, no-store, must-revalidate" },
      { httpEquiv: "Pragma", content: "no-cache" },
      { httpEquiv: "Expires", content: "0" },
    ];
    const addedMetas = metas.map(({ httpEquiv, content }) => {
      const el = document.createElement("meta");
      el.httpEquiv = httpEquiv;
      el.content = content;
      document.head.appendChild(el);
      return el;
    });
    return () => addedMetas.forEach((el) => document.head.removeChild(el));
  }, []);

  // 🔥 Blokir tombol Back browser
  useEffect(() => {
    const blockBack = () => {
      const token = localStorage.getItem("authToken");
      if (!token && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    };

    // Push state dummy supaya back button "ketahan"
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", blockBack);
    window.addEventListener("pageshow", (e) => {
      // bfcache (back-forward cache) — paksa reload jika halaman dari cache
      if (e.persisted) {
        const token = localStorage.getItem("authToken");
        if (!token) {
          window.location.replace("/login");
        } else {
          window.location.reload();
        }
      }
    });

    return () => {
      window.removeEventListener("popstate", blockBack);
    };
  }, []);

  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedToken = localStorage.getItem("authToken");
        const userDataRaw = localStorage.getItem("user");

        if (savedToken && userDataRaw && userDataRaw !== "undefined" && userDataRaw !== "null") {
          const parsedUser = JSON.parse(userDataRaw);
          setUser(parsedUser);
          setToken(savedToken);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch {
        localStorage.clear();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData, accessToken) => {
    return new Promise((resolve) => {
      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setToken(accessToken);
      resolve();
    });
  };

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setUser(null);
    setToken(null);
    // replace() agar history entry dihapus, bukan ditambah
    window.location.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);