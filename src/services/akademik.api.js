// services/akademik.api.js
// Berisi semua fungsi yang berhubungan dengan data akademik mahasiswa

import { getAuthToken } from "./auth.api";

const API_BASE_URL = "/api";

export const getAkademikProfile = async (nim) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  if (!nim) {
    throw new Error("NIM tidak ditemukan.");
  }

  const response = await fetch(`${API_BASE_URL}/akademik/profile/${nim}`, {
    method: "GET",
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