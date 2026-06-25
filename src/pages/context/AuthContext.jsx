// AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  clearAuthSession,
  getAuthToken,
  getRefreshToken,
  getStoredUser,
  logout as logoutRequest,
  refreshAccessToken,
  saveAuthSession,
} from "../../services/auth.api";

const AuthContext = createContext(null);

const getLoginUrl = () => {
  const baseUrl = import.meta.env.BASE_URL || "/";
  return `${window.location.origin}${baseUrl}#/login`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const metas = [
      {
        httpEquiv: "Cache-Control",
        content: "no-cache, no-store, must-revalidate",
      },
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

  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedToken = getAuthToken();
        const savedRefreshToken = getRefreshToken();
        const savedUser = getStoredUser();

        if (savedToken && savedUser) {
          setUser(savedUser);
          setToken(savedToken);
          setRefreshToken(savedRefreshToken);
        } else {
          clearAuthSession();
          setUser(null);
          setToken(null);
          setRefreshToken(null);
        }
      } catch {
        clearAuthSession();
        setUser(null);
        setToken(null);
        setRefreshToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (userData, accessToken, newRefreshToken) => {
    saveAuthSession({
      accessToken,
      refreshToken: newRefreshToken,
      user: userData,
    });

    setUser(userData);
    setToken(accessToken);
    setRefreshToken(newRefreshToken || null);
  };

  const refreshSession = async () => {
    const currentRefreshToken = refreshToken || getRefreshToken();

    if (!currentRefreshToken) {
      throw new Error("Refresh token tidak ditemukan.");
    }

    const result = await refreshAccessToken(currentRefreshToken);
    const newAccessToken = result.access_token;

    if (!newAccessToken) {
      throw new Error("Access token baru tidak dikirim auth-service.");
    }

    saveAuthSession({
      accessToken: newAccessToken,
      refreshToken: currentRefreshToken,
      user,
    });

    setToken(newAccessToken);

    return newAccessToken;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.warn("Logout auth-service gagal, sesi lokal tetap dihapus:", error);
      clearAuthSession();
    } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      window.location.replace(getLoginUrl());
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        login,
        logout,
        refreshSession,
        loading,
        isAuthenticated: Boolean(user && token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);