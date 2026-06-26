import {
  clearAuthSession,
  getAuthToken,
  getRefreshToken,
  getStoredUser,
  refreshAccessToken,
  saveAuthSession,
} from "./auth.api";

let refreshPromise = null;

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

const API_BASE_URL = rawBaseUrl
  ? rawBaseUrl.replace(/\/$/, "").endsWith("/api")
    ? rawBaseUrl.replace(/\/$/, "")
    : `${rawBaseUrl.replace(/\/$/, "")}/api`
  : "/api";

const resolveApiUrl = (path) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (cleanPath.startsWith("/api")) {
    if (API_BASE_URL === "/api") {
      return cleanPath;
    }

    return `${API_BASE_URL}${cleanPath.replace(/^\/api/, "")}`;
  }

  return `${API_BASE_URL}${cleanPath}`;
};

const resolveApiUrl = (path) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (cleanPath.startsWith("/api")) {
    if (API_BASE_URL === "/api") {
      return cleanPath;
    }

    return `${API_BASE_URL}${cleanPath.replace(/^\/api/, "")}`;
  }

  return `${API_BASE_URL}${cleanPath}`;
};

const redirectToLogin = () => {
  clearAuthSession();

  const baseUrl = import.meta.env.BASE_URL || "/";
  const loginUrl = `${window.location.origin}${baseUrl}#/login`;

  if (
    !window.location.hash.includes("/login") &&
    !window.location.pathname.includes("/login")
  ) {
    window.location.replace(loginUrl);
  }
};

const refreshTokenOnce = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .then((result) => {
        const newAccessToken =
          result?.access_token || result?.data?.access_token || result?.token;

        if (!newAccessToken) {
          throw new Error("Access token baru tidak dikirim auth-service.");
        }

        saveAuthSession({
          accessToken: newAccessToken,
          refreshToken: getRefreshToken(),
          user: getStoredUser(),
        });

        return newAccessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const apiClient = async (path, options = {}) => {
  const url = resolveApiUrl(path);
  const isFormData = options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const token = getAuthToken();

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status !== 401) {
    return response;
  }

  try {
    const newAccessToken = await refreshTokenOnce();

    response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
    });

    return response;
  } catch (error) {
    redirectToLogin();
    throw error;
  }
};

export const apiJson = async (path, options = {}) => {
  const response = await apiClient(path, options);

  const text = await response.text();

  let result = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = {
      message: `Response server bukan JSON: ${text.substring(0, 100)}`,
    };
  }

  if (!response.ok) {
    const error = new Error(result.message || "Request gagal.");
    error.status = response.status;
    error.response = result;
    throw error;
  }

  return result;
};
