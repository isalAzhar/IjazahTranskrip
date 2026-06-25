import { apiJson } from "./apiClient";


const BASE_PATH = "/dashboard";

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : "";
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

  return map[periode?.toLowerCase()] || periode?.replace(/_/g, " ") || "-";
};

/**
 * GET /dashboard/batch
 * Mengambil daftar semua batch.
 */
export const getBatches = async (params = {}) => {
  try {
    const query = buildQueryString(params);

    const result = await apiJson(`${BASE_PATH}/batch${query}`, {
      method: "GET",
    });

    return {
      data: Array.isArray(result?.data) ? result.data : [],
      pagination: result?.pagination || {
        page: 1,
        limit: 10,
        total_data: 0,
        total_page: 1,
      },
    };
  } catch (error) {
    console.error("API Error - getBatches:", error?.response || error);
    throw error;
  }
};

/**
 * GET /dashboard/batch/:id
 * Mengambil detail spesifik satu batch & di-filter berdasarkan status via query params.
 */
export const getDetailBatch = async (id, statusFilter = "") => {
  if (!id) {
    throw new Error("ID Batch diperlukan untuk melihat detail.");
  }

  try {
    const queryParams = {};

    if (statusFilter) {
      queryParams.status = statusFilter.toLowerCase();
    }

    const query = buildQueryString(queryParams);

    const result = await apiJson(
      `${BASE_PATH}/batch/${encodeURIComponent(id)}${query}`,
      {
        method: "GET",
      },
    );

    const resData = result;

    let bData = resData?.batch || resData?.data?.batch || {};
    let mList = [];

    if (Array.isArray(resData?.mahasiswa)) {
      mList = resData.mahasiswa;
    } else if (Array.isArray(resData?.data?.mahasiswa)) {
      mList = resData.data.mahasiswa;
    } else if (Array.isArray(resData?.mahasiswaList)) {
      mList = resData.mahasiswaList;
    } else if (Array.isArray(resData?.data?.mahasiswaList)) {
      mList = resData.data.mahasiswaList;
    } else if (Array.isArray(resData?.data)) {
      mList = resData.data;
    } else if (Array.isArray(resData)) {
      mList = resData;
    }

    const firstItem = mList[0] || {};

    const rawBatchName =
      bData.nama_batch ||
      bData.nomor_batch_upload ||
      firstItem.nomor_batch_upload ||
      firstItem.batch ||
      id;

    const batchInfo = {
      nama_batch: formatNamaBatch(rawBatchName),
      fakultas: bData.fakultas || firstItem.fakultas || "-",
      tahun_lulus:
        bData.tahun_lulus || firstItem.tahun_lulus || firstItem.tahun || "-",
      periode_label:
        bData.periode_label ||
        formatPeriode(bData.periode || firstItem.periode),
      total_record_label: `${mList.length} Mahasiswa`,
      total_record: mList.length,
    };

    return {
      batch: batchInfo,
      mahasiswa: mList,
    };
  } catch (error) {
    console.error(`API Error - getDetailBatch (${id}):`, error?.response || error);
    throw error;
  }
};