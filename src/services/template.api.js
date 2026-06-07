import { getAuthToken } from "./auth.api";

const API_BASE_URL = "/api";

const parseJsonResponse = async (response) => {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Terjadi kesalahan request.");
    }

    return result;
  }

  const text = await response.text();
  throw new Error(text || `Response bukan JSON. Status: ${response.status}`);
};

export const getTemplateByJenis = async (jenis) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  const response = await fetch(`/api/template/${jenis}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return parseJsonResponse(response);
};

export const uploadTemplateBackground = async (jenis, file, name) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  if (!file) {
    throw new Error("File background wajib dipilih.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name || file.name);

  const response = await fetch(`/api/template/${jenis}/background`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseJsonResponse(response);
};

export const selectTemplateBackground = async (jenis, assetId) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  const response = await fetch(`/api/template/${jenis}/background/select`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      assetId,
    }),
  });

  return parseJsonResponse(response);
};

export const deleteTemplateBackground = async (jenis, assetId) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  const response = await fetch(`/api/template/${jenis}/background/${assetId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return parseJsonResponse(response);
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
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  const response = await fetch(`/api/template/${jenis}/layout`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      elements,
      isSaved,
      isLocked,
      hasPreviewed,
      imageNaturalWidth,
      imageNaturalHeight,
    }),
  });

  return parseJsonResponse(response);
};

export const getTemplatePlaceholders = async (jenis) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  const response = await fetch(`/api/template/${jenis}/placeholders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return parseJsonResponse(response);
};