const API_BASE_URL = import.meta.env.VITE_API_URL || "http://103.158.196.32:8010";


const getAuthToken = () => {
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
};

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
};

const handleResponse = async (response, fallbackMessage) => {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || fallbackMessage);
  }

  return result;
};

export const getValidDocumentBatches = async ({
  page = 1,
  limit = 10,
  search = "",
  fakultas = "",
  tahun = "",
} = {}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan.");
  }

  const query = buildQueryString({
    page,
    limit,
    search,
    fakultas,
    tahun,
  });

  const response = await fetch(`/api/document/valid-batches${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return handleResponse(
    response,
    "Gagal mengambil daftar batch dokumen valid.",
  );
};

export const getValidDocumentBatchDetail = async (
  batchCode,
  { search = "" } = {},
) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan.");
  }

  const query = buildQueryString({
    search,
  });

  if (!batchCode) {
    throw new Error("Kode batch tidak ditemukan.");
  }

  const response = await fetch(
    `/api/document/valid-batches/${encodeURIComponent(batchCode)}/mahasiswa${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );

  return handleResponse(
    response,
    "Gagal mengambil detail batch dokumen valid.",
  );
};

export const sendBatchDocumentEmail = async (batchCode) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan.");
  }

  if (!batchCode) {
    throw new Error("Kode batch tidak ditemukan.");
  }

  const response = await fetch(
    `/api/document/send-email/batch/${encodeURIComponent(batchCode)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  );

  return handleResponse(
    response,
    "Gagal mengirim email dokumen batch.",
  );
};


export const verifyDocumentByQr = async (kodeQr) => {
  if (!kodeQr) {
    throw new Error("Kode QR tidak ditemukan.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/document/verify/${encodeURIComponent(kodeQr)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const result = await response.json();

  // Untuk QR invalid, backend bisa return 404 tapi tetap ada data pesan error
  return result;
};