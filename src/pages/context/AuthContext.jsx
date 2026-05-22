// src/pages/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      try {
        const token = localStorage.getItem("authToken");
        const userDataRaw = localStorage.getItem("user");

        console.log("[AuthContext] Restoring session:", { 
          hasToken: !!token, 
          hasUserData: !!userDataRaw,
          userDataRaw: userDataRaw
        });

        if (token && userDataRaw && userDataRaw !== "undefined" && userDataRaw !== "null") {
          const parsedUser = JSON.parse(userDataRaw);
          console.log("[AuthContext] User restored:", parsedUser);
          setUser(parsedUser);
        } else {
          console.log("[AuthContext] No valid session found");
          setUser(null);
        }
      } catch (error) {
        console.error("[AuthContext] Error restoring session:", error);
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData, token) => {
    return new Promise((resolve) => {
      console.log("[AuthContext] Login:", { userData, token: !!token });
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      resolve();
    });
  };

  const logout = () => {
    console.log("[AuthContext] Logout");
    localStorage.clear();
    setUser(null);
    // Gunakan navigate instead of window.location untuk SPA yang lebih baik
    // Tapi karena ini di luar Router, window.location masih OK
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);