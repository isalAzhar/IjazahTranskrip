const RAW_API_BASE_URL = "/api";
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, "");

const DASHBOARD_API = `${API_BASE_URL}/dashboard`;

// ==================== HELPER ====================

export const getToken = () => {
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
};

const getHeaders = () => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? 0 : numberValue;
};

const buildQueryParams = (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });

  return queryParams.toString();
};

const fetchJSON = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(result.message || "Request gagal");
    error.status = response.status;
    error.response = result;
    throw error;
  }

  return result;
};

const isAuthError = (error) => {
  return error?.status === 401 || error?.status === 403;
};

const getDefaultStatistics = () => ({
  totalIjazahTerbit: 0,
  permintaanVerifikasi: 0,
  dataReject: 0,
  dataRevoke: 0,
  totalMahasiswa: 0,
  perubahanBulanTerakhir: 0,
  permintaanBaruHariIni: 0,
  rejectMingguIni: 0,
  perubahanHariIni: 0,
  raw: {},
});

const getDefaultMonthlyIssuance = () => ({
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ],
  datasets: [],
  data: [],
  years: [],
  raw: [],
});

const getDefaultVerificationStatus = () => {
  const chartData = [
    { name: "Terbit", value: 0, color: "#27AE60" },
    { name: "Proses", value: 0, color: "#16719E" },
    { name: "Reject", value: 0, color: "#DC2626" },
    { name: "Revoke", value: 0, color: "#F59E0B" },
  ];

  return {
    labels: chartData.map((item) => item.name),
    data: chartData.map((item) => item.value),
    colors: chartData.map((item) => item.color),
    chartData,
    terbit: 0,
    proses: 0,
    rejected: 0,
    revoked: 0,
    raw: {},
  };
};

// ==================== 1. CARD STATISTIK ATAS ====================
// Endpoint backend:
// GET /api/dashboard/summary

export const getStatistics = async () => {
  try {
    const result = await fetchJSON(`${DASHBOARD_API}/summary`);

    const data = result.data || {};

    return {
      totalIjazahTerbit: toNumber(data.terbit ?? data.total_terbit ?? 0),
      permintaanVerifikasi: toNumber(data.proses ?? data.total_proses ?? 0),
      dataReject: toNumber(data.rejected ?? data.total_rejected ?? 0),
      dataRevoke: toNumber(data.revoked ?? data.total_revoked ?? 0),

      totalMahasiswa: toNumber(data.total_mahasiswa ?? 0),

      perubahanBulanTerakhir: toNumber(data.perubahan_bulan_terakhir ?? 0),
      permintaanBaruHariIni: toNumber(data.permintaan_baru_hari_ini ?? 0),
      rejectMingguIni: toNumber(data.reject_minggu_ini ?? 0),
      perubahanHariIni: toNumber(data.perubahan_hari_ini ?? 0),

      raw: data,
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);

    if (isAuthError(error)) {
      throw error;
    }

    return getDefaultStatistics();
  }
};

// ==================== 2. CHART TAHUNAN / BULANAN ====================
// Endpoint backend:
// GET /api/dashboard/statistik-tahunan

export const getMonthlyIssuance = async () => {
  try {
    const result = await fetchJSON(`${DASHBOARD_API}/statistik-tahunan`);

    const rows = Array.isArray(result.data) ? result.data : [];

    const labels = rows.map((item) => item.bulan);

    const years = [
      ...new Set(
        rows.flatMap((item) =>
          Object.keys(item).filter((key) => key !== "bulan"),
        ),
      ),
    ];

    const datasets = years.map((year) => ({
      label: year,
      data: rows.map((item) => toNumber(item[year] ?? 0)),
    }));

    return {
      labels,
      datasets,

      // Untuk component lama yang hanya baca satu array data
      data: datasets[0]?.data || [],

      years,
      raw: rows,
    };
  } catch (error) {
    console.error("Error fetching monthly issuance:", error);

    if (isAuthError(error)) {
      throw error;
    }

    return getDefaultMonthlyIssuance();
  }
};

// ==================== 3. DONUT CHART STATUS VALIDASI ====================
// Endpoint backend:
// GET /api/dashboard/statistik-validasi?year=2026

export const getVerificationStatus = async (
  year = new Date().getFullYear(),
) => {
  try {
    const queryParams = buildQueryParams({ year });

    const result = await fetchJSON(
      `${DASHBOARD_API}/statistik-validasi?${queryParams}`,
    );

    const data = result.data || {};

    const chartData = [
      {
        name: "Terbit",
        value: toNumber(data.terbit ?? data.total_terbit ?? 0),
        color: "#27AE60",
      },
      {
        name: "Proses",
        value: toNumber(data.proses ?? data.total_proses ?? 0),
        color: "#16719E",
      },
      {
        name: "Reject",
        value: toNumber(data.rejected ?? data.total_rejected ?? 0),
        color: "#DC2626",
      },
      {
        name: "Revoke",
        value: toNumber(data.revoked ?? data.total_revoked ?? 0),
        color: "#F59E0B",
      },
    ];

    return {
      labels: chartData.map((item) => item.name),
      data: chartData.map((item) => item.value),
      colors: chartData.map((item) => item.color),

      chartData,

      terbit: toNumber(data.terbit ?? data.total_terbit ?? 0),
      proses: toNumber(data.proses ?? data.total_proses ?? 0),
      rejected: toNumber(data.rejected ?? data.total_rejected ?? 0),
      revoked: toNumber(data.revoked ?? data.total_revoked ?? 0),

      raw: data,
    };
  } catch (error) {
    console.error("Error fetching verification status:", error);

    if (isAuthError(error)) {
      throw error;
    }

    return getDefaultVerificationStatus();
  }
};

// ==================== 4. TABEL STATUS VERIFIKASI IJAZAH ====================
// Endpoint backend:
// GET /api/dashboard/validations/latest?page=1&limit=10&search=...

export const getIjazahList = async (params = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || params.q || "";

    const queryParams = buildQueryParams({
      page,
      limit,
      search,
      fakultas: params.fakultas || "",
      status: params.status || "",
      tahun_lulus: params.tahun_lulus || params.tahun || "",
    });

    const result = await fetchJSON(
      `${DASHBOARD_API}/validations/latest?${queryParams}`,
    );

    const list = Array.isArray(result.data) ? result.data : [];
    const pagination = result.pagination || {};

    return {
      data: list.map((item) => ({
        id: item.id ?? item.id_mahasiswa,
        id_mahasiswa: item.id_mahasiswa,

        nama: item.nama ?? item.nama_mahasiswa ?? item.mahasiswa?.nama ?? "-",
        nim: item.nim ?? item.mahasiswa?.nim ?? "-",
        npm: item.nim ?? item.mahasiswa?.nim ?? "-",

        fakultas:
          item.fakultas ??
          item.nama_fakultas ??
          item.unit_fakultas ??
          item.unit?.nama_unit ??
          item.mahasiswa?.prodi?.unit?.nama_unit ??
          "-",

        prodi:
          item.prodi ??
          item.nama_prodi ??
          item.program_studi ??
          item.mahasiswa?.prodi?.nama_prodi ??
          "-",

        tahunLulus:
          item.tahun_lulus ??
          item.tahunLulus ??
          item.tahun ??
          item.mahasiswa?.tahun_lulus ??
          "-",

        tahun_lulus:
          item.tahun_lulus ??
          item.tahunLulus ??
          item.tahun ??
          item.mahasiswa?.tahun_lulus ??
          "-",

        periode:
          item.periode ??
          item.periode_lulus ??
          item.batch_upload?.periode ??
          item.mahasiswa?.batch_upload?.periode ??
          "-",

        status:
          item.status ??
          item.status_dashboard ??
          item.status_validasi ??
          "proses",

        batch:
          item.batch ??
          item.nomor_batch_upload ??
          item.batch_upload?.nomor_batch_upload ??
          item.mahasiswa?.batch_upload?.nomor_batch_upload ??
          "-",

        id_batch_upload:
          item.id_batch_upload ??
          item.batch_upload?.id_batch_upload ??
          item.mahasiswa?.id_batch_upload ??
          item.mahasiswa?.batch_upload?.id_batch_upload ??
          null,

        raw: item,
      })),

      total: toNumber(pagination.total_data ?? pagination.total ?? 0),
      page: toNumber(pagination.page ?? page),
      totalPages: toNumber(pagination.total_page ?? pagination.totalPages ?? 1),

      pagination,
      raw: result,
    };
  } catch (error) {
    console.error("Error fetching ijazah list:", error);

    if (isAuthError(error)) {
      throw error;
    }

    return {
      data: [],
      total: 0,
      page: 1,
      totalPages: 1,
      pagination: {},
      raw: {},
    };
  }
};

// ==================== 5. DETAIL MAHASISWA / IJAZAH ====================
// Endpoint backend:
// GET /api/dashboard/batches/mahasiswa/:id

export const getDetailIjazah = async (idMahasiswa) => {
  try {
    const result = await fetchJSON(
      `${DASHBOARD_API}/batches/mahasiswa/${idMahasiswa}`,
    );

    return result.data;
  } catch (error) {
    console.error("Error fetching detail ijazah:", error);
    throw error;
  }
};

// ==================== 6. LIST BATCH ====================
// Endpoint backend:
// GET /api/dashboard/batches?page=1&limit=10&search=...

export const getBatchList = async (params = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || "";
    const tahun_lulus = params.tahun_lulus || "";
    const periode = params.periode || "";
    const status = params.status || "";

    const queryParams = buildQueryParams({
      page,
      limit,
      search,
      tahun_lulus,
      periode,
      status,
    });

    const result = await fetchJSON(`${DASHBOARD_API}/batches?${queryParams}`);

    return result;
  } catch (error) {
    console.error("Error fetching batch list:", error);

    if (isAuthError(error)) {
      throw error;
    }

    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total_data: 0,
        total_page: 1,
      },
    };
  }
};

// ==================== 7. DETAIL BATCH ====================
// Endpoint backend:
// GET /api/dashboard/batches/batch/:id

export const getDetailBatch = async (idBatch, status = "") => {
  try {
    const queryParams = buildQueryParams({ status });

    const url = queryParams
      ? `${DASHBOARD_API}/batches/batch/${idBatch}?${queryParams}`
      : `${DASHBOARD_API}/batches/batch/${idBatch}`;

    const result = await fetchJSON(url);

    return result.data;
  } catch (error) {
    console.error("Error fetching detail batch:", error);
    throw error;
  }
};

// ==================== 8. VERIFY IJAZAH ====================
// Endpoint approval:
// POST /api/approval/verify/:npm

export const verifyIjazah = async (npm) => {
  try {
    const response = await fetchJSON(`${API_BASE_URL}/approval/verify/${npm}`, {
      method: "POST",
    });

    return response;
  } catch (error) {
    console.error("Error verifying ijazah:", error);
    throw error;
  }
};

// ==================== 9. SEARCH IJAZAH ====================
// Search diarahkan ke endpoint validations/latest

export const searchIjazah = async (query) => {
  try {
    return await getIjazahList({
      page: 1,
      limit: 10,
      search: query,
    });
  } catch (error) {
    console.error("Error searching ijazah:", error);
    throw error;
  }
};

// ==================== 10. LIST FAKULTAS ====================
// Endpoint backend:
// GET /api/dashboard/faculties
// Aman ditambahkan. Kalau endpoint belum ada, return [].

// ==================== ALIAS EXPORT ====================
// Biar component lain bisa pakai nama yang lebih jelas

// ==================== DEFAULT EXPORT OPSIONAL ====================
// Tidak wajib dipakai, tapi aman kalau nanti mau import sebagai object.

export const getDashboardBatches = async (params = {}) => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const search = params.search || "";
    const tahun_lulus = params.tahun_lulus || params.tahun || "";
    const periode = params.periode || "";

    const queryParams = buildQueryParams({
      page,
      limit,
      search,
      tahun_lulus,
      periode,
    });

    const response = await fetchJSON(
      `${DASHBOARD_API}/batches/batch?${queryParams}`,
    );

    const rows = Array.isArray(response?.data) ? response.data : [];

    return {
      data: rows.map((item) => ({
        id: item.id_batch_upload || item.id,
        id_batch_upload: item.id_batch_upload,

        batch: item.nomor_batch_upload || item.batch || "-",
        nomor_batch_upload: item.nomor_batch_upload || "-",

        fakultas:
          item.fakultas ||
          item.nama_fakultas ||
          item.nama_unit ||
          item.unit ||
          "-",

        tahun: item.tahun_lulus?.toString() || "-",
        tahun_lulus: item.tahun_lulus,

        periode: item.periode || "-",

        total: Number(item.total_mahasiswa || 0),
        total_mahasiswa: Number(item.total_mahasiswa || 0),

        raw: item,
      })),

      pagination: {
        page: Number(response?.pagination?.page || page),
        limit: Number(response?.pagination?.limit || limit),
        total_data: Number(response?.pagination?.total_data || 0),
        total_page: Number(response?.pagination?.total_page || 1),
      },

      raw: response,
    };
  } catch (error) {
    console.error("Error fetching dashboard batches:", error);

    if (isAuthError(error)) {
      throw error;
    }

    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total_data: 0,
        total_page: 1,
      },
      raw: {},
    };
  }
};

export const getDashboardSummary = getStatistics;
export const getStatistikValidasi = getVerificationStatus;
export const getStatistikTahunan = getMonthlyIssuance;
export const getLatestValidations = getIjazahList;

export default {
  getStatistics,
  getMonthlyIssuance,
  getVerificationStatus,
  getIjazahList,
  getDetailIjazah,
  getBatchList,
  getDetailBatch,
  getDashboardBatches,
  verifyIjazah,
  searchIjazah,
  getDashboardSummary,
  getStatistikValidasi,
  getStatistikTahunan,
  getLatestValidations,
};
