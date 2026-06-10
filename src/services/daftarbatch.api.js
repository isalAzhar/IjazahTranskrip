import axios from "axios";

// Sesuaikan BASE URL ini jika berbeda
const BASE_URL = "/api/dashboard"; 

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const formatNamaBatch = (kode) => {
  return kode || "-";
};

const formatPeriode = (periode) => {
  const map = {
    semester_ganjil: "Semester Ganjil",
    semester_genap: "Semester Genap",
    semester_pendek: "Semester Pendek",
  };
  return map[periode?.toLowerCase()] || periode?.replace(/_/g, ' ') || "-";
};

/**
 * GET /batch
 * Mengambil daftar semua batch.
 */
export const getBatches = async (params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/batch`, {
      headers: getAuthHeaders(),
      params,
    });

    return {
      data: Array.isArray(response.data?.data) ? response.data.data : [],
      pagination: response.data?.pagination || {
        page: 1,
        limit: 10,
        total_data: 0,
        total_page: 1,
      },
    };
  } catch (error) {
    console.error("API Error - getBatches:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * GET /batch/:id
 * Mengambil detail spesifik satu batch & di-filter berdasarkan status via QUERY PARAMS.
 */
export const getDetailBatch = async (id, statusFilter = "") => {
  if (!id) throw new Error("ID Batch diperlukan untuk melihat detail.");

  try {
    // 🔥 1. SETUP PARAMS SESUAI ARAHAN BACKEND
    const queryParams = {};
    if (statusFilter) {
      // Pastikan status diformat huruf kecil agar konsisten (misal: "terbit", "proses", dll)
      queryParams.status = statusFilter.toLowerCase(); 
    }

    // Axios akan otomatis menerjemahkan queryParams menjadi URL seperti:
    // /api/dashboard/batch/ID_NYA?status=terbit
    const response = await axios.get(`${BASE_URL}/batch/${id}`, {
      headers: getAuthHeaders(),
      params: queryParams, // Tembak params ke backend di sini
    });

    const resData = response.data;

    // 🔥 2. EKSTRAKSI SUPER AMAN UNTUK BATCH & MAHASISWA
    let bData = resData?.batch || resData?.data?.batch || {};
    let mList = [];

    // Cek semua kemungkinan tempat array mahasiswa disembunyikan oleh backend
    if (Array.isArray(resData?.mahasiswa)) mList = resData.mahasiswa;
    else if (Array.isArray(resData?.data?.mahasiswa)) mList = resData.data.mahasiswa;
    else if (Array.isArray(resData?.mahasiswaList)) mList = resData.mahasiswaList;
    else if (Array.isArray(resData?.data?.mahasiswaList)) mList = resData.data.mahasiswaList;
    else if (Array.isArray(resData?.data)) mList = resData.data;
    else if (Array.isArray(resData)) mList = resData;

    // (Logika filter manual frontend DIHAPUS karena backend sudah mengirimkan data yang disaring)

    // 🔥 3. SINKRONISASI DATA HEADER
    const firstItem = mList[0] || {};
    const rawBatchName = bData.nama_batch || bData.nomor_batch_upload || firstItem.nomor_batch_upload || firstItem.batch || id;

    const batchInfo = {
        nama_batch: formatNamaBatch(rawBatchName),
        fakultas: bData.fakultas || firstItem.fakultas || "-",
        tahun_lulus: bData.tahun_lulus || firstItem.tahun_lulus || firstItem.tahun || "-",
        periode_label: bData.periode_label || formatPeriode(bData.periode || firstItem.periode),
        // Jumlah record sekarang 100% akurat dari jumlah array yang diberikan backend
        total_record_label: `${mList.length} Mahasiswa`,
        total_record: mList.length,
    };

    return {
        batch: batchInfo,
        mahasiswa: mList
    };

  } catch (error) {
    console.error(`API Error - getDetailBatch (${id}):`, error);
    throw error;
  }
};