import { getAuthToken } from "./auth.api.js";

// 1. Ambil Laporan (Digunakan di halaman Pelaporan)
export const getApprovalLaporan = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
}) => {
  const token = getAuthToken();
  if (!token) throw new Error("Token tidak ditemukan. Silakan login ulang.");

  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));

  if (search) params.append("search", search);
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
  if (!response.ok) throw result;

  return result;
};

// 2. Revoke Mahasiswa — FIX: tambahkan catatan di body (backend wajibkan catatan)
export const revokeMahasiswa = async (mahasiswaCode, catatan) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  if (!mahasiswaCode) {
    throw new Error("Kode mahasiswa tidak ditemukan.");
  }

  if (!catatan?.trim()) {
    throw new Error("Catatan revoke wajib diisi.");
  }

  const response = await fetch(
    `/api/approval/mahasiswa/${encodeURIComponent(mahasiswaCode)}/revoke`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        catatan: catatan.trim(),
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Response revoke error:", result);

    throw new Error(
      result?.message ||
      result?.error ||
      "Gagal melakukan revoke mahasiswa."
    );
  }

  return result;
};

// 3. Ambil daftar batch yang menunggu approval (Untuk halaman Daftar Batch)
export const getPendingBatches = async ({ page = 1, limit = 10, search = "", fakultas = "", tahun = "" }) => {
  const token = getAuthToken();
  if (!token) throw new Error("Token tidak ditemukan.");

  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append("search", search);
  if (fakultas) params.append("fakultas", fakultas);
  if (tahun) params.append("tahun", tahun);

  const response = await fetch(`/api/approval/batches/pending?${params.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  const result = await response.json();
  if (!response.ok) throw result;

  return result;
};

// 4. Ambil detail mahasiswa per batch (Untuk halaman Detail Batch)
export const getBatchDetail = async (batchCode) => {
  const token = getAuthToken();
  if (!token) throw new Error("Token tidak ditemukan.");
  if (!batchCode) throw new Error("Kode batch tidak ditemukan.");

  const response = await fetch(`/api/approval/batches/${batchCode}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const result = await response.json();
  if (!response.ok) throw result;

  return result;
};

// 5. Approve seluruh batch (Tombol Validasi di Detail Batch)
export const approveBatch = async (batchCode) => {
  const token = getAuthToken();
  if (!token) throw new Error("Token tidak ditemukan.");
  if (!batchCode) throw new Error("Kode batch tidak ditemukan.");

  const response = await fetch(`/api/approval/batches/${batchCode}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();
  if (!response.ok) throw result;

  return result;
};

// 6. Reject seluruh batch (Tombol Reject di Daftar Batch)
export const rejectBatch = async (batchCode, catatan) => {
  const token = getAuthToken();
  if (!token) throw new Error("Token tidak ditemukan.");
  if (!batchCode) throw new Error("Kode batch tidak ditemukan.");

  const response = await fetch(`/api/approval/batches/${batchCode}/reject`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ catatan }),
  });

  const result = await response.json();
  if (!response.ok) throw result;

  return result;
};