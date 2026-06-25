// src/services/template.api.js

import { apiJson } from "./apiClient";

export const getTemplateByJenis = async (jenis) => {
  if (!jenis) {
    throw new Error("Jenis template tidak ditemukan.");
  }

  return apiJson(`/template/${encodeURIComponent(jenis)}`, {
    method: "GET",
  });
};

export const uploadTemplateBackground = async (jenis, file, name) => {
  if (!jenis) {
    throw new Error("Jenis template tidak ditemukan.");
  }

  if (!file) {
    throw new Error("File background wajib dipilih.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name || file.name);

  return apiJson(`/template/${encodeURIComponent(jenis)}/background`, {
    method: "POST",
    body: formData,
  });
};

export const selectTemplateBackground = async (jenis, assetId) => {
  if (!jenis) {
    throw new Error("Jenis template tidak ditemukan.");
  }

  if (!assetId) {
    throw new Error("ID asset background tidak ditemukan.");
  }

  return apiJson(`/template/${encodeURIComponent(jenis)}/background/select`, {
    method: "PATCH",
    body: JSON.stringify({
      assetId,
    }),
  });
};

export const deleteTemplateBackground = async (jenis, assetId) => {
  if (!jenis) {
    throw new Error("Jenis template tidak ditemukan.");
  }

  if (!assetId) {
    throw new Error("ID asset background tidak ditemukan.");
  }

  return apiJson(
    `/template/${encodeURIComponent(jenis)}/background/${encodeURIComponent(
      assetId,
    )}`,
    {
      method: "DELETE",
    },
  );
};

export const saveTemplateLayout = async (
  jenis,
  elements,
  isSaved,
  isLocked,
  hasPreviewed,
  imageNaturalWidth = null,
  imageNaturalHeight = null,
) => {
  if (!jenis) {
    throw new Error("Jenis template tidak ditemukan.");
  }

  return apiJson(`/template/${encodeURIComponent(jenis)}/layout`, {
    method: "PUT",
    body: JSON.stringify({
      elements,
      isSaved,
      isLocked,
      hasPreviewed,
      imageNaturalWidth,
      imageNaturalHeight,
    }),
  });
};

export const getTemplatePlaceholders = async (jenis) => {
  if (!jenis) {
    throw new Error("Jenis template tidak ditemukan.");
  }

  return apiJson(`/template/${encodeURIComponent(jenis)}/placeholders`, {
    method: "GET",
  });
};