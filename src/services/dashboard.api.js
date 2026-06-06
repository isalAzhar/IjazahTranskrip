





const API_BASE_URL = "/api";

const DASHBOARD_API = `${API_BASE_URL}/dashboard`;

// ==================== HELPER ====================

const getToken = () => {
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

const fetchJSON = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request gagal");
  }

  return result;
};

// ==================== 1. CARD STATISTIK ATAS ====================
// Endpoint backend:
// GET /api/dashboard/summary

export const getStatistics = async () => {
  try {
    const result = await fetchJSON(`${DASHBOARD_API}/summary`);

    const data = result.data || {};

    return {
      totalIjazahTerbit: Number(data.terbit || 0),
      permintaanVerifikasi: Number(data.proses || 0),
      dataReject: Number(data.rejected || 0),
      dataRevoke: Number(data.revoked || 0),

      totalMahasiswa: Number(data.total_mahasiswa || 0),

      // sementara default 0 karena backend belum buat statistik perubahan
      perubahanBulanTerakhir: 0,
      permintaanBaruHariIni: 0,
      rejectMingguIni: 0,
      perubahanHariIni: 0,

      raw: data,
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);

    return {
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
    };
  }
};

// ==================== 2. CHART TAHUNAN / BULANAN ====================
// Endpoint backend:
// GET /api/dashboard/statistik-tahunan

export const getMonthlyIssuance = async () => {
  try {
    const result = await fetchJSON(`${DASHBOARD_API}/statistik-tahunan`);

    const rows = result.data || [];

    const labels = rows.map((item) => item.bulan);

    const years = [
      ...new Set(
        rows.flatMap((item) =>
          Object.keys(item).filter((key) => key !== "bulan")
        )
      ),
    ];

    const datasets = years.map((year) => ({
      label: year,
      data: rows.map((item) => Number(item[year] || 0)),
    }));

    return {
      labels,
      datasets,

      // data ini untuk component lama yang hanya baca satu array data
      data: datasets[0]?.data || [],

      years,
      raw: rows,
    };
  } catch (error) {
    console.error("Error fetching monthly issuance:", error);

    return {
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
    };
  }
};

// ==================== 3. DONUT CHART STATUS VALIDASI ====================
// Endpoint backend:
// GET /api/dashboard/statistik-validasi

export const getVerificationStatus = async (year = new Date().getFullYear()) => {
  try {
    const result = await fetchJSON(`${DASHBOARD_API}/statistik-validasi?year=${year}`);

    const data = result.data || {};

    const chartData = [
      {
        name: "Terbit",
        value: Number(data.terbit || 0),
        color: "#27AE60",
      },
      {
        name: "Proses",
        value: Number(data.proses || 0),
        color: "#16719E",
      },
      {
        name: "Reject",
        value: Number(data.rejected || 0),
        color: "#DC2626",
      },
      {
        name: "Revoke",
        value: Number(data.revoked || 0),
        color: "#F59E0B",
      },
    ];

    return {
      labels: chartData.map((item) => item.name),
      data: chartData.map((item) => item.value),
      colors: chartData.map((item) => item.color),

      chartData,

      terbit: Number(data.terbit || 0),
      proses: Number(data.proses || 0),
      rejected: Number(data.rejected || 0),
      revoked: Number(data.revoked || 0),

      raw: data,
    };
  } catch (error) {
    console.error("Error fetching verification status:", error);

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

    const queryParams = new URLSearchParams({
      page,
      limit,
      search,
    });

    const result = await fetchJSON(
      `${DASHBOARD_API}/validations/latest?${queryParams}`
    );

    const list = result.data || [];
    const pagination = result.pagination || {};

    return {
      data: list.map((item) => ({
        id: item.id_mahasiswa,
        id_mahasiswa: item.id_mahasiswa,

        nama: item.nama,
        nim: item.nim,
        npm: item.nim,

        fakultas: item.fakultas,
        prodi: item.prodi,
        tahunLulus: item.tahun_lulus,
        tahun_lulus: item.tahun_lulus,

        status: item.status,
        batch: item.batch,
      })),

      total: Number(pagination.total_data || 0),
      page: Number(pagination.page || page),
      totalPages: Number(pagination.total_page || 1),

      pagination,
      raw: result,
    };
  } catch (error) {
    console.error("Error fetching ijazah list:", error);

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
      `${DASHBOARD_API}/batches/mahasiswa/${idMahasiswa}`
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

    const queryParams = new URLSearchParams();

    queryParams.append("page", page);
    queryParams.append("limit", limit);

    if (search) queryParams.append("search", search);
    if (tahun_lulus) queryParams.append("tahun_lulus", tahun_lulus);
    if (periode) queryParams.append("periode", periode);

    const result = await fetchJSON(
      `${DASHBOARD_API}/batches?${queryParams}`
    );

    return result;
  } catch (error) {
    console.error("Error fetching batch list:", error);

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
    const queryParams = new URLSearchParams();

    if (status) {
      queryParams.append("status", status);
    }

    const url = status
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
// Catatan:
// Endpoint verify belum masuk dashboard-service.
// Kalau nanti approval-service sudah siap, endpoint ini bisa diarahkan ke API approval.

export const verifyIjazah = async (npm) => {
  try {
    const response = await fetchJSON(`${API_BASE_URL}/api/approval/verify/${npm}`, {
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

// ==================== ALIAS EXPORT ====================
// Biar component lain bisa pakai nama yang lebih jelas

export const getDashboardSummary = getStatistics;
export const getStatistikValidasi = getVerificationStatus;
export const getStatistikTahunan = getMonthlyIssuance;
export const getLatestValidations = getIjazahList;