// services/approval.api.js

import { apiJson } from "./apiClient.js";

// Helper query string
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

// 1. Ambil Laporan
export const getApprovalLaporan = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  const params = {
    page,
    limit,
  };

  if (search) {
    params.search = search;
  }

  if (status && status !== "Semua Status") {
    params.status = status.toLowerCase();
  }

  const query = buildQueryString(params);

  return apiJson(`/approval/laporan${query}`, {
    method: "GET",
  });
};

// 2. Revoke Mahasiswa
export const revokeMahasiswa = async (mahasiswaCode, catatan) => {
  if (!mahasiswaCode) {
    throw new Error("Kode mahasiswa tidak ditemukan.");
  }

  if (!catatan?.trim()) {
    throw new Error("Catatan revoke wajib diisi.");
  }

  return apiJson(
    `/approval/mahasiswa/${encodeURIComponent(mahasiswaCode)}/revoke`,
    {
      method: "POST",
      body: JSON.stringify({
        catatan: catatan.trim(),
      }),
    },
  );
};

// 3. Ambil daftar batch yang menunggu approval
export const getPendingBatches = async ({
  page = 1,
  limit = 10,
  search = "",
  fakultas = "",
  tahun = "",
} = {}) => {
  const query = buildQueryString({
    page,
    limit,
    search,
    fakultas,
    tahun,
  });

  return apiJson(`/approval/batches/pending${query}`, {
    method: "GET",
  });
};

// 4. Ambil detail mahasiswa per batch
export const getBatchDetail = async (batchCode) => {
  if (!batchCode) {
    throw new Error("Kode batch tidak ditemukan.");
  }

  return apiJson(`/approval/batches/${encodeURIComponent(batchCode)}`, {
    method: "GET",
  });
};

// 5. Approve seluruh batch
export const approveBatch = async (batchCode) => {
  if (!batchCode) {
    throw new Error("Kode batch tidak ditemukan.");
  }

  return apiJson(`/approval/batches/${encodeURIComponent(batchCode)}/approve`, {
    method: "POST",
  });
};

// 6. Reject seluruh batch
export const rejectBatch = async (batchCode, catatan) => {
  if (!batchCode) {
    throw new Error("Kode batch tidak ditemukan.");
  }

  return apiJson(`/approval/batches/${encodeURIComponent(batchCode)}/reject`, {
    method: "POST",
    body: JSON.stringify({
      catatan,
    }),
  });
};