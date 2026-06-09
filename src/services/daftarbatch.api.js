import axios from "axios";

// 🔥 FIX: Tambahkan prefix "/dashboard/batches" agar sesuai dengan router backend
const BASE_URL = "/api/dashboard/batches"; 

const getAuthHeaders = () => {
// ... sisa kode ke bawah biarkan sama ...
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/**
 * GET /batch
 * Mengambil daftar semua batch.
 * Bisa menerima parameter seperti halaman (page), limit, atau pencarian (search).
 */
export const getBatches = async (params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/batch`, {
      headers: getAuthHeaders(),
      params: params, // Opsional: untuk mengirim ?page=1&limit=10 dsb.
    });
    return response.data;
  } catch (error) {
    console.error("API Error - getBatches:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * GET /batch/:id
 * Mengambil detail spesifik dari satu batch berdasarkan ID.
 */
export const getDetailBatch = async (id) => {
  if (!id) throw new Error("ID Batch diperlukan untuk melihat detail.");
  
  try {
    const response = await axios.get(`${BASE_URL}/batch/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`API Error - getDetailBatch (${id}):`, error.response?.data || error.message);
    throw error;
  }
};