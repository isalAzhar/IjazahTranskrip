// services/dashboard.api.js

// 🔥 1. DYNAMIC BASE URL: Mengambil dari file .env (jika ada), atau fallback ke "/api"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Helper untuk menyusun Headers secara otomatis
const getHeaders = (token) => {
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// 🔥 2. GLOBAL ERROR HANDLER: Menangani respons secara terpusat
const handleResponse = async (response) => {
  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    let errorMessage = "Terjadi kesalahan pada server.";
    try {
      // 🔥 3. PESAN PINTAR: Mencoba membaca detail pesan error dari backend
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Abaikan jika response bukan berupa JSON
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

// ============================================================================
// DAFTAR ENDPOINT API
// ============================================================================

// 1. Fetch Ringkasan Statistik (Stat Cards)
export const getDashboardSummary = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      method: "GET",
      headers: getHeaders(token),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("[API Error] getDashboardSummary:", error.message);
    throw error; // Lempar kembali agar ditangkap oleh komponen UI
  }
};

// 2. Fetch Tabel Aktivitas Verifikasi Terbaru
export const getLatestValidations = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/validations/latest`, {
      method: "GET",
      headers: getHeaders(token),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("[API Error] getLatestValidations:", error.message);
    throw error;
  }
};

// 3. Fetch Detail Mahasiswa 
export const getDetailMahasiswa = async (nim, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/mahasiswa/${nim}`, {
      method: "GET",
      headers: getHeaders(token),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`[API Error] getDetailMahasiswa (${nim}):`, error.message);
    throw error;
  }
};