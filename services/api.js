import {
  getUnits,
  createUnit,
  deleteUnit,
} from "../../services/unit.service";

const API_BASE_URL = "/api";

const getAuthToken = () => {
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
};
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
export const getApprovalLaporan = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
}) => {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  const params = new URLSearchParams();

  params.append("page", String(page));
  params.append("limit", String(limit));

  if (search) {
    params.append("search", search);
  }

  if (status && status !== "Semua Status") {
    params.append("status", status.toLowerCase());
  }

  const response = await fetch(`/api/approval/laporan?${params.toString()}`, {
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

export const downloadInboundTemplate = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  const response = await fetch("/api/inbound/template", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = "Gagal mengunduh template Excel.";

    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      // response bukan json
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "template_data_mahasiswa.xlsx";

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};

export const uploadInboundExcel = async ({
  file,
  periode,
  tahun_lulus,
  page = 1,
  limit = 10,
  id_template,
}) => {
  const token = getAuthToken();

  if (!token) {
    throw {
      message: "Token tidak ditemukan. Silakan login ulang.",
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("periode", periode);
  formData.append("tahun_lulus", tahun_lulus);
  formData.append("page", String(page));
  formData.append("limit", String(limit));

  if (id_template) {
    formData.append("id_template", String(id_template));
  }

  const response = await fetch(`${API_BASE_URL}/inbound/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw result;
  }

  return result;
};

export const getInboundMahasiswaByBatches = async ({
  batch_ids,
  page = 1,
  limit = 10,
  search = "",
  fakultas = "",
  tahun_lulus = "",
}) => {
  const token = getAuthToken();

  if (!token) {
    throw {
      message: "Token tidak ditemukan. Silakan login ulang.",
    };
  }

  const params = new URLSearchParams();

  params.append(
    "batch_ids",
    Array.isArray(batch_ids) ? batch_ids.join(",") : batch_ids,
  );

  params.append("page", String(page));
  params.append("limit", String(limit));

  if (search) {
    params.append("search", search);
  }

  if (fakultas && fakultas !== "Semua Fakultas") {
    params.append("fakultas", fakultas);
  }

  if (tahun_lulus && tahun_lulus !== "Semua Tahun") {
    params.append("tahun_lulus", tahun_lulus);
  }

  const response = await fetch(
    `${API_BASE_URL}/inbound/mahasiswa/by-batches?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw result;
  }

  return result;
};
// Fetch statistics for dashboard
export const getStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    if (!response.ok) throw new Error("Failed to fetch statistics");
    return await response.json();
  } catch (error) {
    console.error("Error fetching statistics:", error);
    // Return mock data for development
    return {
      totalIjazahTerbit: 12543,
      permintaanVerifikasi: 451,
      dataReject: 42,
      dataRevoke: 17,
      perubahanBulanTerakhir: 4.5,
      permintaanBaruHariIni: 12,
      rejectMingguIni: 2,
      perubahanHariIni: 0,
    };
  }
};

// Fetch monthly issuance data for chart
export const getMonthlyIssuance = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/monthly-issuance`);
    if (!response.ok) throw new Error("Failed to fetch monthly data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching monthly issuance:", error);
    // Return mock data for development
    return {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Ags",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ],
      data: [200, 350, 150, 250, 380, 180, 450, 300, 320, 280, 400, 350],
    };
  }
};

// Fetch verification status distribution
export const getVerificationStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/verification-status`);
    if (!response.ok) throw new Error("Failed to fetch verification status");
    return await response.json();
  } catch (error) {
    console.error("Error fetching verification status:", error);
    // Return mock data for development
    return {
      labels: ["Valid", "Proses", "Reject"],
      data: [1250, 320, 42],
      colors: ["#27AE60", "#F2A93B", "#EB5757"],
    };
  }
};

// Fetch list of ijazah for table
export const getIjazahList = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/ijazah?${queryParams}`);
    if (!response.ok) throw new Error("Failed to fetch ijazah list");
    return await response.json();
  } catch (error) {
    console.error("Error fetching ijazah list:", error);
    // Return mock data for development
    return {
      data: [
        {
          id: 1,
          nama: "Adi Saputra",
          npm: "2011080518",
          prodi: "Teknik Informatika",
          tahunLulus: 2024,
          status: "Valid",
        },
        {
          id: 2,
          nama: "Rani Maharani",
          npm: "2211080518",
          prodi: "Akuntansi",
          tahunLulus: 2026,
          status: "Proses",
        },
        {
          id: 3,
          nama: "Budi Pratama",
          npm: "1811080518",
          prodi: "Manajemen Bisnis",
          tahunLulus: 2022,
          status: "Valid",
        },
        {
          id: 4,
          nama: "Kayla Kay",
          npm: "2011080518",
          prodi: "Ilmu Hukum",
          tahunLulus: 2024,
          status: "Reject",
        },
      ],
      total: 4,
      page: 1,
      totalPages: 1,
    };
  }
};

// Verify ijazah
export const verifyIjazah = async (npm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify/${npm}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to verify ijazah");
    return await response.json();
  } catch (error) {
    console.error("Error verifying ijazah:", error);
    throw error;
  }
};

// Search ijazah by npm or nama
export const searchIjazah = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${query}`);
    if (!response.ok) throw new Error("Failed to search ijazah");
    return await response.json();
  } catch (error) {
    console.error("Error searching ijazah:", error);
    throw error;
  }
};

export default {
  getStatistics,
  getMonthlyIssuance,
  getVerificationStatus,
  getIjazahList,
  verifyIjazah,
  searchIjazah,
  uploadInboundExcel,
  getInboundMahasiswaByBatches,
  getApprovalLaporan,
  getAkademikProfile,
  downloadInboundTemplate,
};
