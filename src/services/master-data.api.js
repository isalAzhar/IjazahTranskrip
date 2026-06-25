// src/services/master-data.api.js

import { apiClient, apiJson } from "./apiClient";

// ==================== USER ====================

const getNamaPejabatByRole = (user = {}) => {
  const unit = user.unit;

  if (!unit) return "-";

  switch (user.role) {
    case "rektor":
      return unit.rektor || "-";

    case "dekan":
      return unit.dekan || "-";

    case "wakil_rektor_1":
      return unit.wakil_rektor_1 || unit.wakilRektor || "-";

    case "wakil_dekan_1":
      return unit.wakil_dekan_1 || unit.wakil || "-";

    case "tu_rektorat":
      return unit.tu_rektorat || unit.katu || "-";

    case "tu_fakultas":
      return unit.tu_fakultas || unit.katu || "-";

    default:
      return "-";
  }
};

const getNidnPejabatByRole = (user = {}) => {
  const unit = user.unit;

  if (!unit) return "";

  switch (user.role) {
    case "rektor":
      return unit.nidnRektor || unit.nidn_rektor || "";

    case "dekan":
      return unit.nidnDekan || unit.nidn_dekan || "";

    case "wakil_rektor_1":
      return unit.nidnWakilRektor || unit.nidn_wakil_rektor_1 || "";

    case "wakil_dekan_1":
      return unit.nidnWakilDekan || unit.nidn_wakil_dekan_1 || unit.nidnWakil || "";

    case "tu_rektorat":
      return unit.nidn_tu_rektorat || "";

    case "tu_fakultas":
      return "";

    default:
      return "";
  }
};

export const normalizeUser = (user = {}) => {
  return {
    id: user.id || user.id_user || user.uuid,
    id_user: user.id_user || user.id || user.uuid,
    uuid: user.uuid || null,

    role: user.role || "-",
    email: user.email || "-",

    nama: getNamaPejabatByRole(user),
    nidn: getNidnPejabatByRole(user),

    unit:
      user.unit?.nama_unit ||
      user.unit?.nama ||
      user.nama_unit ||
      "-",

    raw: user,
  };
};

export const getUsers = async () => {
  const result = await apiJson("/user/getAllUser", {
    method: "GET",
  });

  const rows = Array.isArray(result?.data) ? result.data : [];

  const users = rows.map(normalizeUser);

  localStorage.setItem("users", JSON.stringify(users));

  return users;
};

export const createUser = async (payload) => {
  return apiJson("/user/createUser", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateUser = async (id, payload) => {
  if (!id) {
    throw new Error("ID pengguna tidak ditemukan.");
  }

  return apiJson(`/user/editUser/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteUser = async (id) => {
  if (!id) {
    throw new Error("ID pengguna tidak ditemukan.");
  }

  return apiJson(`/user/deleteUser/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

// ==================== UNIT ====================

export const normalizeUnit = (item = {}) => {
  const jenisRaw = item.jenis_unit || item.jenis || "";
  const isUniversitas = String(jenisRaw).toLowerCase() === "universitas";

  const mappedProdi = Array.isArray(item.prodi)
    ? item.prodi
        .map((prodi) => ({
          id: prodi.id_prodi || prodi.id,
          nama: prodi.nama_prodi || prodi.nama || "-",
          namaEn: prodi.nama_prodi_en || prodi.namaEn || "",
          ketua: prodi.kaprodi || prodi.ketua || "-",
          nidn: prodi.nidn_kaprodi || prodi.nidn || "-",
          sk: prodi.no_sk_akreditasi || prodi.sk || "-",
          fileLama: prodi.file_paraf_kaprodi || prodi.fileLama || null,
          raw: prodi,
        }))
        .sort((a, b) =>
          String(a.nama || "").localeCompare(String(b.nama || "")),
        )
    : [];

  return {
    id: item.id_unit || item.id,
    jenis: isUniversitas ? "Universitas" : "Fakultas",
    nama: item.nama_unit || item.nama || "-",
    nama_unit: item.nama_unit || item.nama || "-",
    en: item.nama_unit_en || item.en || "-",

    dekan: isUniversitas ? item.rektor : item.dekan,
    nidnDekan: isUniversitas ? item.nidn_rektor : item.nidn_dekan,

    wakil: isUniversitas ? item.wakil_rektor_1 : item.wakil_dekan_1,
    nidnWakil: isUniversitas
      ? item.nidn_wakil_rektor_1
      : item.nidn_wakil_dekan_1,

    katu: isUniversitas ? item.tu_rektorat : item.tu_fakultas,

    rektor: item.rektor,
    nidn_rektor: item.nidn_rektor,
    wakil_rektor_1: item.wakil_rektor_1,
    nidn_wakil_rektor_1: item.nidn_wakil_rektor_1,
    tu_rektorat: item.tu_rektorat,

    tu_fakultas: item.tu_fakultas,

    fileTtd: isUniversitas ? item.file_ttd_rektor : item.file_ttd_dekan,
    fileParafWakil: isUniversitas
      ? item.file_paraf_warek
      : item.file_paraf_wadek,
    fileParafKatu: isUniversitas
      ? item.file_paraf_tu_rektorat
      : item.file_paraf_tu_fakultas,
    fileStempel: isUniversitas
      ? item.file_stempel_universitas
      : item.file_stempel_fakultas,

    prodi: mappedProdi,
    raw: item,
  };
};

export const getUnits = async () => {
  const result = await apiJson("/unit/getAllUnit", {
    method: "GET",
  });

  const rows = Array.isArray(result)
    ? result
    : Array.isArray(result?.data)
      ? result.data
      : [];

  const units = rows.map(normalizeUnit);

  localStorage.setItem("units", JSON.stringify(units));

  return units;
};

export const getUnitsData = () => {
  const saved = localStorage.getItem("units");

  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const getFakultasList = (units = getUnitsData()) => {
  return units
    .filter((unit) => String(unit.jenis || "").toLowerCase() === "fakultas")
    .map((unit) => unit.nama);
};

export const getPersonilByRole = (
  jenisUnit,
  role,
  namaUnit,
  units = getUnitsData(),
) => {
  const unitData = units.find(
    (unit) => unit.nama === namaUnit || unit.nama_unit === namaUnit,
  );

  if (!unitData) return null;

  let namaPejabat = "";
  let nidnPejabat = "";

  switch (role) {
    case "rektor":
      namaPejabat = unitData.rektor || unitData.dekan;
      nidnPejabat = unitData.nidn_rektor || unitData.nidnDekan;
      break;

    case "wakil_rektor_1":
      namaPejabat = unitData.wakil_rektor_1 || unitData.wakil;
      nidnPejabat = unitData.nidn_wakil_rektor_1 || unitData.nidnWakil;
      break;

    case "tu_rektorat":
      namaPejabat = unitData.tu_rektorat || unitData.katu;
      nidnPejabat = unitData.nidn_tu_rektorat || "";
      break;

    case "dekan":
      namaPejabat = unitData.dekan;
      nidnPejabat = unitData.nidnDekan || unitData.nidn_dekan;
      break;

    case "wakil_dekan_1":
      namaPejabat = unitData.wakil || unitData.wakil_dekan_1;
      nidnPejabat = unitData.nidnWakil || unitData.nidn_wakil_dekan_1;
      break;

    case "tu_fakultas":
      namaPejabat = unitData.katu || unitData.tu_fakultas;
      nidnPejabat = "";
      break;

    default:
      return null;
  }

  if (!namaPejabat) return null;

  return {
    nama: namaPejabat,
    nidn: nidnPejabat || "",
  };
};

export const isRoleTerisi = (unitName, role) => {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  return users.some((user) => user.unit === unitName && user.role === role);
};

export const isFakultasLengkap = (fakultasName) => {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const usersInFakultas = users.filter((user) => user.unit === fakultasName);
  const requiredRoles = ["Dekan", "Wakil Dekan", "TU Fakultas"];

  return requiredRoles.every((role) =>
    usersInFakultas.some((user) => user.role === role),
  );
};

export const createUnit = async (formData) => {
  return apiJson("/unit/createUnit", {
    method: "POST",
    body: formData,
  });
};

export const updateUnit = async (id, formData) => {
  if (!id) {
    throw new Error("ID unit tidak ditemukan.");
  }

  return apiJson(`/unit/editUnit/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteUnit = async (id) => {
  if (!id) {
    throw new Error("ID unit tidak ditemukan.");
  }

  return apiJson(`/unit/deleteUnit/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

// ==================== PRODI ====================

export const createProdi = async (formData) => {
  return apiJson("/unit/createProdi", {
    method: "POST",
    body: formData,
  });
};

export const updateProdi = async (id, formData) => {
  if (!id) {
    throw new Error("ID prodi tidak ditemukan.");
  }

  return apiJson(`/unit/editProdi/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteProdi = async (id) => {
  if (!id) {
    throw new Error("ID prodi tidak ditemukan.");
  }

  return apiJson(`/unit/deleteProdi/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};
// ==================== PROFILE ====================

const formatProfileRole = (role) => {
  const normalizedRole = String(role || "").toLowerCase().trim();

  const roleMap = {
    admin: "Admin Sistem",
    operator: "Operator Data",
    rektor: "Rektor",
    wakil_rektor_1: "Wakil Rektor",
    tu_rektorat: "TU Rektorat",
    dekan: "Dekan",
    wakil_dekan_1: "Wakil Dekan",
    tu_fakultas: "TU Fakultas",
  };

  return roleMap[normalizedRole] || role || "-";
};

export const normalizeProfile = (profile = {}) => {
  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return {
    id: profile.id || profile.id_user || profile.uuid || null,
    id_user: profile.id_user || profile.id || null,
    uuid: profile.uuid || null,

    nama: profile.nama || profile.name || "-",
    nidn: profile.nidn || "-",
    email: profile.email || "-",
    role: formatProfileRole(profile.role),
    role_raw: profile.role || "-",

    tanggalBergabung: joinDate,
    tanggal_bergabung: joinDate,

    raw: profile,
  };
};

export const getMyProfile = async () => {
  const result = await apiJson("/profile/me", {
    method: "GET",
  });

  const profile = result?.data || result || {};

  return normalizeProfile(profile);
};

export const changePassword = async ({ oldPassword, newPassword }) => {
  if (!oldPassword) {
    throw new Error("Password saat ini wajib diisi.");
  }

  if (!newPassword) {
    throw new Error("Password baru wajib diisi.");
  }

  return apiJson("/user/changePassword", {
    method: "PUT",
    body: JSON.stringify({
      oldPassword,
      newPassword,
    }),
  });
};