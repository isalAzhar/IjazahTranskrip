// src/services/document.api.js

import { apiClient, apiJson } from "./apiClient";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
};

export const getValidDocumentBatches = async ({
  page = 1,
  limit = 10,
  search = "",
  fakultas = "",
  tahun = "",
  status_email = "",
} = {}) => {
  const params = {
    page,
    limit,
  };

  if (search) params.search = search;
  if (fakultas) params.fakultas = fakultas;
  if (tahun) params.tahun = tahun;
  if (status_email) params.status_email = status_email;

  const query = buildQueryString(params);

  return apiJson(`/document/valid-batches${query}`, {
    method: "GET",
  });
};

export const getValidDocumentBatchDetail = async (
  batchCode,
  { search = "" } = {},
) => {
  if (!batchCode) {
    throw new Error("Kode batch tidak ditemukan.");
  }

  const query = buildQueryString({ search });

  return apiJson(
    `/document/valid-batches/${encodeURIComponent(batchCode)}/mahasiswa${query}`,
    {
      method: "GET",
    },
  );
};

export const sendBatchDocumentEmail = async (batchCode) => {
  if (!batchCode) {
    throw new Error("Kode batch tidak ditemukan.");
  }

  return apiJson(`/document/send-email/batch/${encodeURIComponent(batchCode)}`, {
    method: "POST",
  });
};

export const previewDocumentByQr = async (kodeQr) => {
  if (!kodeQr) {
    throw new Error("Kode QR tidak ditemukan.");
  }

  const response = await apiClient(
    `/document/preview/${encodeURIComponent(kodeQr)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    },
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result?.message || "Gagal membuka preview dokumen.");
  }

  return response.blob();
};

export const downloadDocumentByQr = async (kodeQr) => {
  if (!kodeQr) {
    throw new Error("Kode QR tidak ditemukan.");
  }

  const response = await apiClient(
    `/document/download/${encodeURIComponent(kodeQr)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    },
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result?.message || "Gagal download dokumen.");
  }

  return response.blob();
};

export const verifyDocumentByQr = async (kodeQr) => {
  if (!kodeQr) {
    throw new Error("Kode QR tidak ditemukan.");
  }

  const response = await fetch(
    `/api/document/verify/${encodeURIComponent(kodeQr)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message || "Gagal verifikasi dokumen.");
  }

  return result;
};