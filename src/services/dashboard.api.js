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

// ==================== DEFAULT FALLBACKS ====================

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
    if (isAuthError(error)) throw error;
    return getDefaultStatistics();
  }
};

// ==================== 2. CHART BULANAN / TAHUNAN ====================
export const getMonthlyIssuance = async () => {
  try {
    const result = await fetchJSON(`${DASHBOARD_API}/statistik/tahunan`);

    const rows = Array.isArray(result.raw)
      ? result.raw
      : Array.isArray(result.data)
        ? result.data
        : [];

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
      data: datasets[0]?.data || [],
      years,
      raw: rows,
    };
  } catch (error) {
    if (isAuthError(error)) throw error;
    return getDefaultMonthlyIssuance();
  }
};

// ==================== 3. DONUT CHART STATUS VALIDASI ====================
export const getVerificationStatus = async (
  year = new Date().getFullYear(),
) => {
  try {
    const queryParams = buildQueryParams({ year });
    const result = await fetchJSON(
      `${DASHBOARD_API}/statistik/validasi?${queryParams}`,
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
    if (isAuthError(error)) throw error;
    return getDefaultVerificationStatus();
  }
};

// ==================== 4. TABEL STATUS VERIFIKASI TERBARU ====================
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
        raw: item,
      })),
      total: toNumber(pagination.total_data ?? pagination.total ?? 0),
      page: toNumber(pagination.page ?? page),
      totalPages: toNumber(pagination.total_page ?? pagination.totalPages ?? 1),
      pagination,
      raw: result,
    };
  } catch (error) {
    if (isAuthError(error)) throw error;
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

// ==================== 5. FILTER: FAKULTAS & TAHUN ====================
export const getFacultiesData = async () => {
  try {
    const result = await fetchJSON(`${DASHBOARD_API}/faculties`);
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    return [];
  }
};

export const getYearsData = async () => {
  try {
    const result = await fetchJSON(`${DASHBOARD_API}/years`);
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    return [];
  }
};

// ==================== FUNGSI LAINNYA ====================

export const getDetailIjazah = async (idMahasiswa) => {
  try {
    const result = await fetchJSON(
      `${DASHBOARD_API}/batches/mahasiswa/${idMahasiswa}`,
    );
    return result.data;
  } catch (error) {
    throw error;
  }
};

export const getBatchList = async (params = {}) => {
  try {
    const queryParams = buildQueryParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      tahun_lulus: params.tahun_lulus || "",
      periode: params.periode || "",
      status: params.status || "",
    });
    return await fetchJSON(`${DASHBOARD_API}/batches?${queryParams}`);
  } catch (error) {
    if (isAuthError(error)) throw error;
    return {
      success: false,
      data: [],
      pagination: { page: 1, limit: 10, total_data: 0, total_page: 1 },
    };
  }
};

// 🔥 FUNGSI DETAIL BATCH YANG SUDAH BERSIH DARI "batches/batch"
export const getDetailBatch = async (idBatch) => {
  try {
    const response = await fetchJSON(`${DASHBOARD_API}/batch/${idBatch}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// 🔥 FUNGSI VERIFY IJAZAH YANG SEKARANG SUDAH BALIK LAGI!
export const verifyIjazah = async (npm) => {
  try {
    return await fetchJSON(`${API_BASE_URL}/approval/verify/${npm}`, {
      method: "POST",
    });
  } catch (error) {
    throw error;
  }
};

export const searchIjazah = async (query) => {
  try {
    return await getIjazahList({ page: 1, limit: 10, search: query });
  } catch (error) {
    throw error;
  }
};

// 🔥 FUNGSI LIST BATCH DASHBOARD YANG SUDAH BERSIH DARI "batches/batch"
export const getDashboardBatches = async (params = {}) => {
  try {
    const queryParams = buildQueryParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      tahun_lulus: params.tahun_lulus || params.tahun || "",
      periode: params.periode || "",
      status: params.status || "", // Filter status jalan
    });

    const response = await fetchJSON(`${DASHBOARD_API}/batch?${queryParams}`);
    const rows = Array.isArray(response?.data) ? response.data : [];

    return {
      data: rows.map((item) => ({
        id: item.id_batch_upload || item.id_batch || item.id,
        batch_code:
          item.batch_code || item.batchCode || item.raw?.batch_code || null,

        id:
          item.batch_code || item.batchCode || item.raw?.batch_code || item.id, // Tambahan keamanan ID
        batch: item.nomor_batch_upload || item.batch || item.nama_batch || "-",
        fakultas:
          item.fakultas ||
          item.nama_fakultas ||
          item.nama_unit ||
          item.unit ||
          "-",
        tahun: (item.tahun_lulus || item.tahun || "-").toString(),
        periode: item.periode || item.periode_label || "-",
        total: Number(
          item.total_mahasiswa ||
            item.total_record ||
            item.total_record_ditampilkan ||
            0,
        ),
        raw: item,
      })),
      pagination: response?.pagination || {},
    };
  } catch (error) {
    if (isAuthError(error)) throw error;
    return { data: [], pagination: {} };
  }
};

// ==================== ALIAS EXPORT & DEFAULT ====================

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
  getFacultiesData,
  getYearsData,
};
