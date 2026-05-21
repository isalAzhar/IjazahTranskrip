import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userDataRaw = localStorage.getItem("user");

    // Debug biar ketahuan kenapa loading tidak kunjung berhenti
    // (bisa dihapus nanti)
    // console.log("[AuthContext] restore", { token: !!token, userDataRaw });

    try {
      if (token && userDataRaw && userDataRaw !== "undefined") {
        setUser(JSON.parse(userDataRaw));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Gagal memulihkan sesi:", error);
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);


  const login = (userData, token) => {
    return new Promise((resolve) => {
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      resolve();
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);