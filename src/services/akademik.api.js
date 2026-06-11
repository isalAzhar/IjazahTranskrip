// services/akademik.api.js
// Berisi semua fungsi yang berhubungan dengan data akademik mahasiswa

import { getAuthToken } from "./auth.api";

const API_BASE_URL = "/api";

export const getAkademikProfile = async (mahasiswaCode) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  if (!mahasiswaCode) {
    throw new Error("Kode mahasiswa tidak ditemukan.");
  }
  const response = await fetch(`${API_BASE_URL}/akademik/profile/${encodeURIComponent(mahasiswaCode)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw result;
  }

  return result;
};