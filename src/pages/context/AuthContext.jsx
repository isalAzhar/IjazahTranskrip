import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 PERTAHANAN GLOBAL: Deteksi Tombol Back & Cache Browser
  useEffect(() => {
    const blockBackNavigation = () => {
      const currentToken = localStorage.getItem("authToken");
      // Jika user memaksa kembali ke halaman dalam tapi token sudah tidak ada
      if (!currentToken && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    };

    // Dengarkan aksi navigasi browser (tembus ke level memory)
    window.addEventListener("popstate", blockBackNavigation);
    window.addEventListener("pageshow", blockBackNavigation);
    window.addEventListener("visibilitychange", blockBackNavigation);

    return () => {
      window.removeEventListener("popstate", blockBackNavigation);
      window.removeEventListener("pageshow", blockBackNavigation);
      window.removeEventListener("visibilitychange", blockBackNavigation);
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
      } catch (error) {
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
    // 1. Hancurkan semua storage
    sessionStorage.clear();
    localStorage.clear();
    
    // 2. Bersihkan state
    setUser(null);
    setToken(null);

    // 3. Paksa hard reload menggunakan .href agar memori JS dihancurkan
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);