// services/auth.api.js
// Berisi helper token dan fungsi autentikasi

const API_BASE_URL = "/api";

/**
 * Ambil token dari localStorage (cek beberapa key umum)
 */
export const getAuthToken = () => {
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
};

export const login = async ({ username, password }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw result;
  }

  return result;
};

export const logout = async () => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw result;
  }

  return result;
};