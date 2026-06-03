// services/dashboard.api.js
// Fungsi-fungsi yang belum di-binding ke backend (masih mock data)

const API_BASE_URL = "/api";

// Fetch statistics for dashboard
export const getStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    if (!response.ok) throw new Error("Failed to fetch statistics");
    return await response.json();
  } catch (error) {
    console.error("Error fetching statistics:", error);
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
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"],
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
    return {
      data: [
        { id: 1, nama: "Adi Saputra",    npm: "2011080518", prodi: "Teknik Informatika", tahunLulus: 2024, status: "Valid"  },
        { id: 2, nama: "Rani Maharani",  npm: "2211080518", prodi: "Akuntansi",          tahunLulus: 2026, status: "Proses" },
        { id: 3, nama: "Budi Pratama",   npm: "1811080518", prodi: "Manajemen Bisnis",   tahunLulus: 2022, status: "Valid"  },
        { id: 4, nama: "Kayla Kay",      npm: "2011080518", prodi: "Ilmu Hukum",         tahunLulus: 2024, status: "Reject" },
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

// Search ijazah by npm atau nama
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