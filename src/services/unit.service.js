// src/services/unit.service.js

import { apiJson } from "./apiClient";

export const getUnits = async () => {
  return apiJson("/master-unit", {
    method: "GET",
  });
};

export const createUnit = async (data) => {
  return apiJson("/master-unit", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const deleteUnit = async (id) => {
  if (!id) {
    throw new Error("ID unit tidak ditemukan.");
  }

  return apiJson(`/master-unit/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};