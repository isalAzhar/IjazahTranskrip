// src/pages/DaftarPengguna.jsx
import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiXCircle, // 🔥 Tambahan icon untuk notifikasi error
} from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { getUnitsData, getPersonilByRole, getFakultasList } from "./DaftarUnit";

// 🔥 IMPORT BRANKAS TOKEN
import { useAuth } from "../context/AuthContext";

// ==================== FUNGSI VALIDASI EMAIL ====================
// ==================== FUNGSI FORMAT ROLE (UI) ====================
const formatRoleUI = (role) => {
  if (!role) return "-";
  
  // Kamus terjemahan dari format database ke format tampilan
  const roleMap = {
    "admin": "Admin",
    "operator": "Operator",
    "rektor": "Rektor",
    "wakil_rektor_1": "Wakil Rektor",
    "tu_rektorat": "TU Rektorat",
    "dekan": "Dekan",
    "wakil_dekan_1": "Wakil Dekan",
    "tu_fakultas": "TU Fakultas"
  };

  // Cocokkan data, jika tidak ada di kamus, tampilkan aslinya
  return roleMap[role.toLowerCase()] || role; 
};
// ===============================================================
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email);
};
// ===============================================================

const DaftarPengguna = () => {
  // 🔥 STATE TOKEN DARI AUTH CONTEXT
  const { token } = useAuth();

  const [openTambah, setOpenTambah] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHapus, setOpenHapus] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 STATE UNTUK MODAL NOTIFIKASI (Menggantikan alert bawaan browser)
  const [notif, setNotif] = useState({
    show: false,
    title: "",
    message: "",
    type: "success", // bisa "success" atau "error"
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/getAllUser", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (response.ok && result.data) {
        const data = result.data; 
        
        const formattedUsers = data.map(u => {
          const namaPejabat = u.unit ? (
            u.role === "rektor" ? u.unit.rektor : 
            u.role === "dekan" ? u.unit.dekan : 
            u.role === "wakil_rektor_1" ? u.unit.wakil_rektor_1 :
            u.role === "wakil_dekan_1" ? u.unit.wakil_dekan_1 :
            u.role === "tu_rektorat" ? u.unit.tu_rektorat :
            u.role === "tu_fakultas" ? u.unit.tu_fakultas : "-"
          ) : "-";

          const nidnPejabat = u.unit ? (
            u.role === "rektor" ? (u.unit.nidnRektor || u.unit.nidn_rektor) : 
            u.role === "dekan" ? (u.unit.nidnDekan || u.unit.nidn_dekan) : 
            u.role === "wakil_rektor_1" ? (u.unit.nidnWakilRektor || u.unit.nidn_wakil_rektor_1) :
            u.role === "wakil_dekan_1" ? (u.unit.nidnWakilDekan || u.unit.nidn_wakil_dekan_1) :
            u.role === "tu_rektorat" ? u.unit.nidn_tu_rektorat :
            u.role === "tu_fakultas" ? "" : ""
          ) : "";

          return {
            id: u.id || u.id_user || u.uuid,
            role: u.role || "-",
            email: u.email || "-",
            nama: namaPejabat,
            nidn: nidnPejabat,
            unit: u.unit?.nama_unit || "-"
          };
        });

        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleAddUser = async (newUser) => {
    try {
      const response = await fetch("/api/user/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        fetchUsers(); 
        setOpenTambah(false);
        setNotif({
          show: true,
          title: "Berhasil Menyimpan",
          message: "Data pengguna baru telah berhasil ditambahkan ke sistem.",
          type: "success",
        });
      } else {
        const errorData = await response.json();
        setNotif({
          show: true,
          title: "Gagal Menyimpan",
          message: errorData.message || "Terjadi kesalahan pada server.",
          type: "error",
        });
      }
    } catch (error) {
      setNotif({
        show: true,
        title: "Error Koneksi",
        message: "Gagal terhubung ke server saat menambah pengguna.",
        type: "error",
      });
    }
  };

  const handleEditUser = async (updatedUser) => {
    try {
      const response = await fetch(`/api/user/editUser/${updatedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        fetchUsers(); 
        setOpenEdit(false);
        setNotif({
          show: true,
          title: "Berhasil Diperbarui",
          message: "Data pengguna telah berhasil diperbarui.",
          type: "success",
        });
      } else {
        const errorData = await response.json();
        setNotif({
          show: true,
          title: "Gagal Memperbarui",
          message: errorData.message || "Terjadi kesalahan pada server.",
          type: "error",
        });
      }
    } catch (error) {
      setNotif({
        show: true,
        title: "Error Koneksi",
        message: "Gagal terhubung ke server saat memperbarui pengguna.",
        type: "error",
      });
    }
  };

  const handleHapusUser = async () => {
    const userId = selectedUser?.id_user || selectedUser?.id;
    if (!userId) {
      setNotif({
        show: true,
        title: "Gagal",
        message: "ID Pengguna tidak ditemukan untuk dihapus.",
        type: "error",
      });
      return;
    }

    try {
      const response = await fetch(`/api/user/deleteUser/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setOpenHapus(false);
        await fetchUsers();
        setSelectedUser(null); 
        setNotif({
          show: true,
          title: "Berhasil Dihapus",
          message: "Akses pengguna telah berhasil dihapus dari sistem.",
          type: "success",
        });
      } else {
        const errorData = await response.json();
        setNotif({
          show: true,
          title: "Gagal Menghapus",
          message: errorData.message || "Terjadi kesalahan pada server.",
          type: "error",
        });
      }
    } catch (error) {
      setNotif({
        show: true,
        title: "Error Koneksi",
        message: "Gagal terhubung ke server saat menghapus pengguna.",
        type: "error",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daftar Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data pengguna sistem dan akses pengguna secara efisien.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenTambah(true)}
          className="flex items-center gap-2 bg-[#0B4B48] hover:bg-[#083c3a] text-white px-4 py-2 rounded-lg shadow-xl text-sm font-semibold transition"
        >
          <FiPlus /> Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-400 font-bold shadow-md">
            <tr>
              <th className="py-4 px-4 text-center">No.</th>
              <th className="py-4 px-4">Role</th>
              <th className="py-4 px-4 text-center">Nama</th>
              <th className="py-4 px-4 text-center">Nama Unit</th>
              <th className="py-4 px-4 text-center">Email</th>
              <th className="py-4 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-10 text-center">Memuat data...</td>
              </tr>
            ) : users && users.length > 0 ? (
              users.map((user, index) => {
                let namaTampil = user.nama || "-";
                if (user.unit && typeof user.unit === 'object') {
                  const r = (user.role || "").trim();
                  if (r === "rektor") namaTampil = user.unit.rektor;
                  else if (r === "dekan") namaTampil = user.unit.dekan;
                  else if (r === "wakil_rektor_1") namaTampil = user.unit.wakil_rektor_1;
                  else if (r === "wakil_dekan_1") namaTampil = user.unit.wakil_dekan_1;
                  else if (r === "tu_rektorat") namaTampil = user.unit.tu_rektorat;
                  else if (r === "tu_fakultas") namaTampil = user.unit.tu_fakultas;
                  if (!namaTampil) namaTampil = "-";
                }

                const unitTampil = typeof user.unit === 'object' && user.unit !== null 
                                   ? (user.unit.nama_unit || "-") 
                                   : (user.unit || "-");

                return (
                  <tr key={user.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-center font-bold">{index + 1}.</td>
                    <td className="py-4 px-4 font-bold">{formatRoleUI(user.role) }</td>
                    <td className="py-4 px-4 text-center">{namaTampil}</td>
                    <td className="py-4 px-4 text-center">{unitTampil}</td>
                    <td className="py-4 px-4 text-center">{user.email || "-"}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-3">
                        <button type="button" className="text-blue-600" onClick={() => { setSelectedUser(user); setOpenEdit(true); }}>
                          <FiEdit2 size={18} />
                        </button>
                        <button type="button" className="text-red-500" onClick={() => { setSelectedUser(user); setOpenHapus(true); }}>
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-400">Belum ada data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openTambah && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[1000px] rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <AddUserForm
              onSave={handleAddUser}
              onClose={() => setOpenTambah(false)}
              users={users}
              onError={(msg) => setNotif({ show: true, title: "Peringatan", message: msg, type: "error" })}
            />
          </div>
        </div>
      )}

      {openEdit && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] rounded-2xl shadow-xl overflow-hidden">
            <EditUserForm
              userData={{
                ...selectedUser,
                unit:
                  typeof selectedUser.unit === "object" &&
                  selectedUser.unit !== null
                    ? selectedUser.unit.nama_unit ||
                      selectedUser.unit.nama ||
                      "-"
                    : selectedUser.unit || "-",
              }}
              onSave={handleEditUser}
              onClose={() => setOpenEdit(false)}
            />
          </div>
        </div>
      )}

      {openHapus && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[450px] rounded-2xl shadow-xl overflow-hidden">
            <DeleteUserForm
              userData={selectedUser}
              onDelete={handleHapusUser}
              onClose={() => setOpenHapus(false)}
            />
          </div>
        </div>
      )}

      {/* 🔥 MODAL NOTIFIKASI DINAMIS MENGGANTIKAN ALERT() */}
      {notif.show && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[999]">
          <div className="bg-white w-[400px] rounded-2xl shadow-xl overflow-hidden transform transition-all scale-100">
            <div className="p-8 flex flex-col items-center text-center gap-4">
              {/* Icon berubah dinamis tergantung tipe (success / error) */}
              <div className={`w-16 h-16 mx-auto flex items-center justify-center rounded-full shadow-md ${
                notif.type === "success" ? "bg-[#0B4B48]" : "bg-red-500"
              }`}>
                {notif.type === "success" ? (
                  <FiCheckCircle size={36} className="text-white" />
                ) : (
                  <FiXCircle size={36} className="text-white" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {notif.title}
              </h2>
              <p className="text-sm text-gray-500">
                {notif.message}
              </p>
            </div>
            <div className="flex justify-center px-8 py-5 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setNotif({ ...notif, show: false })}
                className={`w-full py-2.5 rounded-xl shadow-md font-semibold text-white transition ${
                  notif.type === "success" 
                  ? "bg-[#0B4B48] hover:bg-[#083c3a]" 
                  : "bg-red-500 hover:bg-red-600"
                }`}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

// ==================== FORM TAMBAH ====================
const AddUserForm = ({ onSave, onClose, users = [], onError }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [jenisUnit, setJenisUnit] = useState("");
  const [namaUnit, setNamaUnit] = useState("");
  const [role, setRole] = useState("");

  const [form, setForm] = useState({
    nama: "",
    nidn: "",
    email: "",
    password: "",
  });

  const units = getUnitsData();
  const fakultasList = getFakultasList();

  const universitasList = units.filter((u) => u.jenis === "Universitas");

  const hasUniversitas = universitasList.length > 0;
  const hasFakultas = fakultasList.length > 0;
  const hasUnits = units.length > 0;

  const roleOptions = {
    Universitas: ["rektor", "wakil_rektor_1", "tu_rektorat"],
    Fakultas: ["dekan", "wakil_dekan_1", "tu_fakultas"],
  };

  const rolesWithoutNidn = ["tu_rektorat", "tu_fakultas"];
  const isRoleRequireNidn = !rolesWithoutNidn.includes(role);

  const isRoleAlreadyTerisi = (roleName) => {
    if (!namaUnit) return true;
    return users.some((u) => u.unit === namaUnit && u.role === roleName);
  };

  const getPersonilData = () => {
    if (!jenisUnit || !role || !namaUnit) return null;

    try {
      const hasilData = getPersonilByRole(jenisUnit, role, namaUnit);
      return hasilData || null;
    } catch (error) {
      console.error("🚨 CRASH DICEGAH: Gagal mengambil data personil", error);
      return null;
    }
  };

  const personilData = getPersonilData();

  useEffect(() => {
    const dataPejabat = getPersonilData();

    setForm((prev) => {
      const newNama = dataPejabat?.nama || "";
      const newNidn = dataPejabat?.nidn || "";

      if (prev.nama === newNama && prev.nidn === newNidn) {
        return prev;
      }

      return {
        ...prev,
        nama: newNama,
        nidn: newNidn,
      };
    });
  }, [jenisUnit, namaUnit, role]);

  const handleJenisUnitChange = (value) => {
    setJenisUnit(value);
    setNamaUnit("");
    setRole("");
    setForm({ nama: "", nidn: "", email: "", password: "" });
  };

  const handleNamaUnitChange = (value) => {
    setNamaUnit(value);
    setRole("");
    setForm({ nama: "", nidn: "", email: "", password: "" });
  };

  const handleRoleChange = (value) => {
    setRole(value);
    setForm((prev) => ({ ...prev, email: "", password: "" }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const emailTidakValid = form.email.length > 0 && !isValidEmail(form.email);
  const passwordKurang = form.password.length > 0 && form.password.length < 8;

  const isSubmitDisabled = () => {
    if (
      !role ||
      !namaUnit ||
      !form.nama ||
      !form.email ||
      !isValidEmail(form.email) ||
      !form.password ||
      form.password.length < 8
    ) {
      return true;
    }
    if (isRoleRequireNidn && !form.nidn) {
      return true;
    }
    if (!personilData?.nama) {
      return true;
    }
    return false;
  };

  const handleSubmit = () => {
    if (!isValidEmail(form.email)) {
      onError("Format email yang diinputkan tidak valid. Gunakan format @domain.com");
      return;
    }

    if (isSubmitDisabled()) {
      onError("Harap pastikan semua field mandatory telah terisi dengan benar.");
      return;
    }
    
    const selectedUnitObj = units.find(
      (u) => u.nama === namaUnit || u.nama_unit === namaUnit
    );

    const idUnitReal = selectedUnitObj ? selectedUnitObj.id : null;

    const newUser = {
      role,
      nama: form.nama,
      nidn: form.nidn,
      id_unit: idUnitReal,
      email: form.email,
      password: form.password,
    };

    onSave(newUser);
  };

  return (
    <>
      <div className="px-8 py-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">
          Tambah Pengguna Baru
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Data pengguna akan terisi otomatis dari data unit yang sudah
          ditambahkan
        </p>
      </div>

      <div className="p-8 space-y-8">
        {!hasUnits && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ Belum ada data unit. Silakan tambah unit terlebih dahulu di
              halaman Daftar Unit.
            </p>
          </div>
        )}

        <div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold text-sm">
                Jenis Unit <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={jenisUnit}
                  onChange={(e) => handleJenisUnitChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-12 bg-gray-50 outline-none focus:border-[#0B4B48] appearance-none"
                  disabled={!hasUnits}
                >
                  <option value="" disabled hidden>
                    Pilih Jenis Unit
                  </option>
                  {hasUniversitas && (
                    <option value="Universitas">Universitas</option>
                  )}
                  {hasFakultas && <option value="Fakultas">Fakultas</option>}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold text-sm">
                Nama Unit <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={namaUnit}
                  onChange={(e) => handleNamaUnitChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-12 bg-gray-50 outline-none focus:border-[#0B4B48] appearance-none"
                  disabled={!jenisUnit}
                >
                  <option value="" disabled hidden>
                    Pilih Nama Unit
                  </option>
                  {jenisUnit === "Universitas" &&
                    universitasList.map((u) => (
                      <option key={u.id} value={u.nama}>
                        {u.nama}
                      </option>
                    ))}
                  {jenisUnit === "Fakultas" &&
                    fakultasList.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold text-sm">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-12 bg-gray-50 outline-none focus:border-[#0B4B48] appearance-none"
                  disabled={!namaUnit}
                >
                  <option value="" disabled hidden>
                    Pilih Role
                  </option>
                  {jenisUnit &&
                    roleOptions[jenisUnit]?.map((r) => (
                      <option
                        key={r}
                        value={r}
                        disabled={isRoleAlreadyTerisi(r)}
                        className={
                          isRoleAlreadyTerisi(r) ? "text-gray-400" : ""
                        }
                      >
                        {r} {isRoleAlreadyTerisi(r) ? "(Sudah terisi)" : ""}
                      </option>
                    ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="min-h-[18px] mt-2">
            {role && !personilData?.nama && (
              <p className="text-xs text-red-500 font-medium">
                Data {role} belum diisi di Daftar Unit. Silakan lengkapi data
                unit terlebih dahulu.
              </p>
            )}
          </div>
        </div>

        {role && (
          <div className="space-y-5 border-t border-gray-100 pt-5">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Nama {role}
                </label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder={
                    personilData?.nama
                      ? "Terisi otomatis"
                      : `Data ${role} belum diisi`
                  }
                  readOnly={!!personilData?.nama}
                  className={`w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm ${
                    personilData?.nama
                      ? "bg-gray-100 text-gray-600"
                      : "bg-gray-50"
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  NIDN
                </label>
                <input
                  name="nidn"
                  value={form.nidn}
                  onChange={handleChange}
                  placeholder={
                    !isRoleRequireNidn ? "Tidak diperlukan" : "Terisi otomatis"
                  }
                  readOnly={!!personilData?.nidn || !isRoleRequireNidn}
                  className={`w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm ${
                    !isRoleRequireNidn || personilData?.nidn
                      ? "bg-gray-100 text-gray-600"
                      : "bg-gray-50"
                  }`}
                />
                {!isRoleRequireNidn && (
                  <p className="text-xs text-gray-400 mt-1">
                    *NIDN tidak diperlukan untuk role {role}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 items-start">
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Masukkan email (contoh: a@b.com)"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-[#0B4B48] focus:outline-none ${
                    emailTidakValid ? "border-red-400" : ""
                  }`}
                />
                <p className="text-xs text-red-500 mt-1 min-h-[18px]">
                  {emailTidakValid ? "Format email tidak valid." : ""}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-12 bg-gray-50 focus:ring-2 focus:ring-[#0B4B48] focus:outline-none ${
                      passwordKurang ? "border-red-400" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <FiEye size={18} />
                    ) : (
                      <FiEyeOff size={18} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-red-500 mt-1 min-h-[18px]">
                  {passwordKurang ? "Password minimal 8 karakter." : ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 px-8 py-5 bg-gray-50 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-sm text-black font-medium hover:bg-gray-100 transition"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled()}
          className={`px-6 py-2 rounded-xl shadow-sm text-white font-medium transition ${
            isSubmitDisabled()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0B4B48] hover:bg-[#083c3a]"
          }`}
        >
          Simpan Data
        </button>
      </div>
    </>
  );
};

// ==================== FORM EDIT ====================
const EditUserForm = ({ userData, onSave, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    nama: userData.nama || "",
    nidn: userData.nidn|| "",
    email: userData.email || "",
    password: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <>
      <div className="px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Pengguna</h2>
        <p className="text-sm font-medium text-gray-500 mt-1">
          {userData.role} — {userData.unit}
        </p>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Baris Nama & NIDN */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold text-gray-500 mb-1 block">Nama</label>
            <input name="nama" value={form.nama} readOnly className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-700" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500 mb-1 block">NIDN</label>
            <input name="nidn" value={form.nidn} readOnly className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-700" />
          </div>
        </div>

        {/* Baris Email */}
        <div>
          <label className="text-sm font-semibold text-gray-500 mb-1 block">Email *</label>
          <input 
            name="email" type="email" value={form.email} onChange={handleChange} 
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0B4B48] outline-none" 
          />
        </div>

        {/* Baris Password */}
        <div>
          <label className="text-sm font-semibold text-gray-500 mb-1 block">Password</label>
          <div className="relative">
            <input 
              name="password" 
              type={showPassword ? "text" : "password"} 
              value={form.password} 
              onChange={handleChange}
              placeholder="••••••••" 
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-[#0B4B48] outline-none" 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
              {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            *Kosongkan kolom ini jika tidak ingin mengubah password lama.
          </p>
        </div> 
      </div>

      {/* Footer Tombol */}
      <div className="flex justify-end gap-3 px-8 py-6 bg-gray-50 rounded-b-2xl">
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 font-semibold hover:bg-gray-100 transition">Batal</button>
        <button onClick={() => onSave({ ...userData, ...form })} className="px-6 py-2.5 rounded-xl bg-[#0B4B48] text-white font-semibold hover:bg-[#083c3a] transition">Simpan</button>
      </div>
    </>
  );
};

// ==================== FORM HAPUS ====================
const DeleteUserForm = ({ userData, onDelete, onClose }) => {
  if (!userData) return null;
  return (
    <>
      <div className="px-8 py-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Hapus Pengguna</h2>
      </div>

      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-red-100 flex items-center justify-center rounded-full mb-4">
          <FiTrash2 size={28} className="text-red-600" />
        </div>
        <p className="text-gray-600 text-sm">
          Apakah Anda yakin ingin mencabut akses pengguna ini?
        </p>

        <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 space-y-1 text-left">
          <p className="text-base font-bold text-gray-800">{userData.nama}</p>
          <p className="text-sm font-semibold text-[#0B4B48]">
            {formatRoleUI(userData.role)} — {userData.unit}
          </p>
          <p className="text-sm text-gray-500">{userData.email}</p>
        </div>

        <p className="text-xs text-red-500 mt-4 font-medium">
          Tindakan ini permanen dan tidak dapat dibatalkan.
        </p>
      </div>

      <div className="flex justify-end gap-3 px-8 py-5 bg-gray-50 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-sm text-black font-medium hover:bg-gray-100 transition"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-6 py-2 rounded-xl bg-red-600 shadow-sm font-medium text-white hover:bg-red-700 transition"
        >
          Hapus Akses
        </button>
      </div>
    </>
  );
};

export default DaftarPengguna;