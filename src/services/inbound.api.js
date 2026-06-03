// services/inbound.api.js
// Berisi semua fungsi yang berhubungan dengan upload/download data inbound mahasiswa

import { getAuthToken } from "./auth.api";

const API_BASE_URL = "/api";

export const downloadInboundTemplate = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  const response = await fetch(`${API_BASE_URL}/inbound/template`, {
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
      // response bukan JSON
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
    throw { message: "Token tidak ditemukan. Silakan login ulang." };
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
    throw { message: "Token tidak ditemukan. Silakan login ulang." };
  }

  const params = new URLSearchParams();

  params.append(
    "batch_ids",
    Array.isArray(batch_ids) ? batch_ids.join(",") : batch_ids
  );
  params.append("page", String(page));
  params.append("limit", String(limit));

  if (search) params.append("search", search);
  if (fakultas && fakultas !== "Semua Fakultas") params.append("fakultas", fakultas);
  if (tahun_lulus && tahun_lulus !== "Semua Tahun") params.append("tahun_lulus", tahun_lulus);

  const response = await fetch(
    `${API_BASE_URL}/inbound/mahasiswa/by-batches?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw result;
  }

  return result;
};