const getAuthToken = () => {
  return localStorage.getItem("authToken");
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
  batchId,
  { search = "" } = {},
) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan.");
  }

  const query = buildQueryString({
    search,
  });

  const response = await fetch(
    `/api/document/valid-batches/${batchId}/mahasiswa${query}`,
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