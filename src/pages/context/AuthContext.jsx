// src/pages/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedToken = localStorage.getItem("authToken");
        const userDataRaw = localStorage.getItem("user");

        console.log("[AuthContext] Restoring session:", { 
          hasToken: !!savedToken, 
          hasUserData: !!userDataRaw
        });

        if (savedToken && userDataRaw && userDataRaw !== "undefined" && userDataRaw !== "null") {
          const parsedUser = JSON.parse(userDataRaw);
          setUser(parsedUser);
          setToken(savedToken);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error("[AuthContext] Error restoring session:", error);
        localStorage.clear();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // FUNGSI LOGIN (Menggunakan Promise agar bisa di-await oleh login.jsx)
  const login = (userData, accessToken) => {
    return new Promise((resolve) => {
      console.log("[AuthContext] Login tersimpan:", { userData, hasToken: !!accessToken });
      
      // Simpan ke LocalStorage
      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Simpan ke State
      setUser(userData);
      setToken(accessToken);
      
      resolve();
    });
  };

  const logout = () => {
  console.log("[AuthContext] Logout dieksekusi");

  sessionStorage.removeItem("inbound_uploaded_data");
  sessionStorage.removeItem("inbound_uploaded_batch_ids");
  sessionStorage.removeItem("inbound_uploaded_pagination");

  localStorage.clear();
  setUser(null);
  setToken(null);

  window.location.href = "/";
};

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {/* Tahan rendering aplikasi sampai pengecekan memori selesai */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);