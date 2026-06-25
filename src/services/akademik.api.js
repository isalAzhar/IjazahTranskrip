

import { apiJson } from "./apiClient";

export const getAkademikProfile = async (mahasiswaCode) => {
  if (!mahasiswaCode) {
    throw new Error("Kode mahasiswa tidak ditemukan.");
  }

  return apiJson(
    `/akademik/profile/${encodeURIComponent(mahasiswaCode)}`,
    {
      method: "GET",
    },
  );
};