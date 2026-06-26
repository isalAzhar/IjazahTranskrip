// src/services/auth.api.js

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

const API_BASE_URL = rawBaseUrl
  ? rawBaseUrl.replace(/\/$/, "").endsWith("/api")
    ? rawBaseUrl.replace(/\/$/, "")
    : `${rawBaseUrl.replace(/\/$/, "")}/api`
  : "/api";

const resolveApiUrl = (path) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (cleanPath.startsWith("/api")) {
    if (API_BASE_URL === "/api") return cleanPath;
    return `${API_BASE_URL}${cleanPath.replace(/^\/api/, "")}`;
  }

  return `${API_BASE_URL}${cleanPath}`;
};
const AUTH_STORAGE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  user: "user",
};

const parseJsonResponse = async (response) => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      status: "error",
      message: `Response server bukan JSON: ${text.substring(0, 80)}`,
    };
  }
};

export const getAuthToken = () => {
  return localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
};

export const getRefreshToken = () => {
  return localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
};

export const getStoredUser = () => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.user);

  if (!raw || raw === "undefined" || raw === "null") {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveAuthSession = ({ accessToken, refreshToken, user }) => {
  if (accessToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, refreshToken);
  }

  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);

  // Hapus key lama agar tidak bentrok dengan auth baru
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");

  sessionStorage.clear();
};

export const login = async ({ email, password }) => {
  const response = await fetch(resolveApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const result = await parseJsonResponse(response);

  if (!response.ok) {
    throw result;
  }

  return result;
};

export const refreshAccessToken = async (
  refreshToken = getRefreshToken(),
) => {
  if (!refreshToken) {
    throw {
      status: "error",
      message: "Refresh token tidak ditemukan.",
    };
  }

  const response = await fetch(resolveApiUrl("/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  const result = await parseJsonResponse(response);

  if (!response.ok) {
    throw result;
  }

  return result;
};

export const logout = async () => {
  const token = getAuthToken();

  if (!token) {
    clearAuthSession();

    return {
      status: "success",
      message: "Logout lokal berhasil.",
    };
  }

  const response = await fetch(resolveApiUrl("/auth/logout"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const result = await parseJsonResponse(response);

  clearAuthSession();

  if (!response.ok) {
    throw result;
  }

  return result;
};