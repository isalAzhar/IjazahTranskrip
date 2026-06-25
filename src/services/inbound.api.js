// src/services/inbound.api.js
// Berisi semua fungsi yang berhubungan dengan upload/download data inbound mahasiswa

import { apiClient, apiJson } from "./apiClient";

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

const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

export const downloadInboundTemplate = async () => {
  const response = await apiClient("/inbound/template", {
    method: "GET",
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

  downloadBlob(blob, "template_data_mahasiswa.xlsx");
};

export const uploadInboundExcel = async ({
  file,
  periode,
  tahun_lulus,
  page = 1,
  limit = 10,
  id_template,
}) => {
  if (!file) {
    throw { message: "File Excel wajib dipilih." };
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

  const response = await apiClient("/inbound/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json().catch(() => ({}));

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
  const params = {
    page,
    limit,
  };

  if (Array.isArray(batch_ids)) {
    params.batch_ids = batch_ids.join(",");
  } else if (batch_ids) {
    params.batch_ids = batch_ids;
  }

  if (search) params.search = search;

  if (fakultas && fakultas !== "Semua Fakultas") {
    params.fakultas = fakultas;
  }

  if (tahun_lulus && tahun_lulus !== "Semua Tahun") {
    params.tahun_lulus = tahun_lulus;
  }

  const query = buildQueryString(params);

  return apiJson(`/inbound/mahasiswa/by-batches${query}`, {
    method: "GET",
  });
};