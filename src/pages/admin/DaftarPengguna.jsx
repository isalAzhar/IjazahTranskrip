import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
} from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";
import {
  getUnitsData,
  getPersonilByRole,
  getFakultasList,
} from "./DaftarUnit";

// ==================== FUNGSI VALIDASI EMAIL (dari Kode 1 - lebih baik) ====================
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email);
};
// ==================== AKHIR FUNGSI VALIDASI ====================

const DaftarPengguna = () => {
  const [openTambah, setOpenTambah] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHapus, setOpenHapus] = useState(false);
  const [openSukses, setOpenSukses] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const handleAddUser = (newUser) => {
    setUsers([...users, newUser]);
    setOpenSukses(true);
  };

  const handleEditUser = (updatedUser) => {
    const updatedUsers = users.map((u, i) =>
      i === selectedIndex ? updatedUser : u
    );

    setUsers(updatedUsers);
    setOpenSukses(true);
  };

  const handleHapusUser = () => {
    const updatedUsers = users.filter((_, i) => i !== selectedIndex);
    setUsers(updatedUsers);
    setOpenHapus(false);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Daftar Pengguna
          </h1>

          <p className="text-sm text-gray-500">
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
              <th className="py-4 px-4 text-center">Password</th>
              <th className="py-4 px-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-400">
                  Belum ada pengguna. Silakan tambah pengguna terlebih dahulu.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={index}
                  className="border border-gray-300 hover:bg-gray-50"
                >
                  <td className="py-4 px-4 text-center font-bold">
                    {index + 1}.
                  </td>

                  <td className="py-4 px-4 font-bold">{user.role}</td>

                  <td className="py-4 px-4 text-center">{user.nama}</td>

                  <td className="py-4 px-4 text-center">{user.unit}</td>

                  <td className="py-4 px-4 text-center">{user.email}</td>

                  <td className="py-4 px-4 text-center">
                    {"*".repeat(user.password.length)}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 transition"
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedIndex(index);
                          setOpenEdit(true);
                        }}
                      >
                        <FiEdit2 size={18} />
                      </button>

                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 transition"
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedIndex(index);
                          setOpenHapus(true);
                        }}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
            />
          </div>
        </div>
      )}

      {openEdit && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] rounded-2xl shadow-xl overflow-hidden">
            <EditUserForm
              userData={selectedUser}
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

      {openSukses && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[400px] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 flex flex-col items-center text-center gap-4">
              <FiCheckCircle size={56} className="text-[#0B4B48]" />

              <h2 className="text-xl font-bold text-gray-800">
                Data Berhasil Disimpan
              </h2>

              <p className="text-sm text-gray-500">
                Data pengguna telah berhasil disimpan ke dalam sistem.
              </p>
            </div>

            <div className="flex justify-center px-8 py-5 bg-gray-200">
              <button
                type="button"
                onClick={() => setOpenSukses(false)}
                className="px-8 py-2 rounded-xl bg-[#0B4B48] shadow-md text-white hover:bg-[#083c3a] transition"
              >
                Oke
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

// ==================== FORM TAMBAH ====================
const AddUserForm = ({ onSave, onClose, users = [] }) => {
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

  // AMBIL DATA UNIT LANGSUNG DARI DAFTAR UNIT
  const units = getUnitsData();
  const fakultasList = getFakultasList();

  const universitasList = units.filter((u) => u.jenis === "Universitas");

  const hasUniversitas = universitasList.length > 0;
  const hasFakultas = fakultasList.length > 0;
  const hasUnits = units.length > 0;

  const roleOptions = {
    Universitas: ["Rektor", "Wakil Rektor", "TU Rektor"],
    Fakultas: ["Dekan", "Wakil Dekan", "TU Fakultas"],
  };

  // Role yang TIDAK perlu NIDN (dari Kode 1 - lebih baik)
  const rolesWithoutNidn = ["TU Rektor", "TU Fakultas"];
  const isRoleRequireNidn = !rolesWithoutNidn.includes(role);

  const isRoleAlreadyTerisi = (roleName) => {
    if (!namaUnit) return true;

    return users.some(
      (u) => u.unit === namaUnit && u.role === roleName
    );
  };

  const getPersonilData = () => {
    if (!jenisUnit || !role || !namaUnit) return null;

    return getPersonilByRole(jenisUnit, role, namaUnit);
  };

  const personilData = getPersonilData();

  useEffect(() => {
    if (personilData && personilData.nama) {
      setForm((prev) => ({
        ...prev,
        nama: personilData.nama,
        nidn: personilData.nidn || "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        nama: "",
        nidn: "",
      }));
    }
  }, [personilData]);

  const handleJenisUnitChange = (value) => {
    setJenisUnit(value);
    setNamaUnit("");
    setRole("");
    setForm({
      nama: "",
      nidn: "",
      email: "",
      password: "",
    });
  };

  const handleNamaUnitChange = (value) => {
    setNamaUnit(value);
    setRole("");
    setForm({
      nama: "",
      nidn: "",
      email: "",
      password: "",
    });
  };

  const handleRoleChange = (value) => {
    setRole(value);

    setForm((prev) => ({
      ...prev,
      email: "",
      password: "",
    }));
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const emailTidakValid = form.email.length > 0 && !isValidEmail(form.email);

  const passwordKurang = form.password.length > 0 && form.password.length < 8;

  // Improved isSubmitDisabled dari kedua kode
  const isSubmitDisabled = () => {
    if (!role || !namaUnit || !form.nama || !form.email || !isValidEmail(form.email) || !form.password || form.password.length < 8) {
      return true;
    }
    
    // Jika role membutuhkan NIDN, cek NIDN harus diisi
    if (isRoleRequireNidn && !form.nidn) {
      return true;
    }
    
    // Jika personilData tidak ada (data unit belum lengkap)
    if (!personilData?.nama) {
      return true;
    }
    
    return false;
  };

  const handleSubmit = () => {
    if (!isValidEmail(form.email)) {
      alert("Email harus menggunakan format yang benar (contoh: nama@domain.com)");
      return;
    }

    if (isSubmitDisabled()) {
      alert("Semua field harus diisi dengan benar!");
      return;
    }

    const newUser = {
      role,
      nama: form.nama,
      nidn: form.nidn,
      unit: namaUnit,
      email: form.email,
      password: form.password,
    };

    onSave(newUser);
    onClose();
  };

  return (
    <>
      <div className="px-8 py-6 border-b border-gray-300">
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
            <p className="text-sm text-yellow-800">
              ⚠️ Belum ada data unit. Silakan tambah unit terlebih dahulu di
              halaman Daftar Unit.
            </p>
          </div>
        )}

        <div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">
                Jenis Unit <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  value={jenisUnit}
                  onChange={(e) => handleJenisUnitChange(e.target.value)}
                  className="w-full border border-gray-400 rounded-2xl px-4 py-3 pr-12 bg-gray-50 outline-none focus:border-[#0B4B48] appearance-none"
                  disabled={!hasUnits}
                >
                  <option value="" disabled hidden>
                    Pilih Jenis Unit
                  </option>

                  {hasUniversitas && (
                    <option value="Universitas">Universitas</option>
                  )}

                  {hasFakultas && (
                    <option value="Fakultas">Fakultas</option>
                  )}
                </select>

                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">
                Nama Unit <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  value={namaUnit}
                  onChange={(e) => handleNamaUnitChange(e.target.value)}
                  className="w-full border border-gray-400 rounded-2xl px-4 py-3 pr-12 bg-gray-50 appearance-none outline-none focus:border-[#0B4B48]"
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

                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">
                Role <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full border border-gray-400 rounded-2xl px-4 py-3 pr-12 bg-gray-50 outline-none focus:border-[#0B4B48] appearance-none"
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

                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black" />
              </div>
            </div>
          </div>

          <div className="min-h-[18px] mt-2">
            {role && !personilData?.nama && (
              <p className="text-xs text-red-500">
                Data {role} belum diisi di Daftar Unit. Silakan lengkapi data
                unit terlebih dahulu.
              </p>
            )}
          </div>
        </div>

        {role && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-400">Nama {role}</label>

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
                  className={`w-full mt-1 border rounded-2xl px-4 py-3 ${
                    personilData?.nama
                      ? "bg-gray-100 text-gray-600"
                      : "bg-gray-50"
                  }`}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">NIDN</label>

                <input
                  name="nidn"
                  value={form.nidn}
                  onChange={handleChange}
                  placeholder={
                    !isRoleRequireNidn 
                      ? "Tidak diperlukan untuk role ini"
                      : "NIDN akan terisi otomatis"
                  }
                  readOnly={!!personilData?.nidn || !isRoleRequireNidn}
                  className={`w-full mt-1 border rounded-2xl px-4 py-3 ${
                    (!isRoleRequireNidn) || (personilData?.nidn)
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
                <label className="text-xs text-gray-400">
                  Email <span className="text-red-500">*</span>
                </label>

                <input
                  name="email"
                  type="email"
                  placeholder="Masukkan email, contoh: nama@domain.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full mt-1 border rounded-2xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-[#0B4B48] focus:outline-none ${
                    emailTidakValid ? "border-red-400" : ""
                  }`}
                />

                <p className="text-xs text-red-500 mt-1 min-h-[18px]">
                  {emailTidakValid ? "Email harus menggunakan format yang benar (contoh: nama@domain.com)." : ""}
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-400">
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-1">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full border rounded-2xl px-4 py-3 pr-12 bg-gray-50 ${
                      passwordKurang ? "border-red-400" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <FiEye size={22} />
                    ) : (
                      <FiEyeOff size={22} />
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

      <div className="flex justify-end gap-3 px-8 py-5 bg-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-md text-black"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled()}
          className={`px-6 py-2 rounded-xl shadow-md text-white transition ${
            isSubmitDisabled()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0B4B48] hover:bg-[#083c3a]"
          }`}
        >
          Simpan
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
    nidn: userData.nidn || "",
    email: userData.email || "",
    password: userData.password || "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const emailTidakValid = form.email.length > 0 && !isValidEmail(form.email);

  const passwordKurang = form.password.length > 0 && form.password.length < 8;

  const isSubmitDisabled =
    !form.email ||
    !isValidEmail(form.email) ||
    !form.password ||
    form.password.length < 8;

  const handleSubmit = () => {
    if (!isValidEmail(form.email)) {
      alert("Email harus menggunakan format yang benar (contoh: nama@domain.com)");
      return;
    }

    if (isSubmitDisabled) {
      alert("Email dan password harus diisi dengan benar!");
      return;
    }

    onSave({
      ...userData,
      ...form,
    });

    onClose();
  };

  return (
    <>
      <div className="px-8 py-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Edit Pengguna</h2>

        <p className="text-sm text-gray-400 mt-1">
          {userData.role} — {userData.unit}
        </p>
      </div>

      <div className="p-8 space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-400">Nama</label>

            <input
              name="nama"
              value={form.nama}
              readOnly
              className="w-full mt-1 border rounded-2xl px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400">NIDN</label>

            <input
              name="nidn"
              value={form.nidn}
              readOnly
              className="w-full mt-1 border rounded-2xl px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400">
            Email <span className="text-red-500">*</span>
          </label>

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Masukkan email, contoh: nama@domain.com"
            className={`w-full mt-1 border rounded-2xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-[#0B4B48] focus:outline-none ${
              emailTidakValid ? "border-red-400" : ""
            }`}
          />

          <p className="text-xs text-red-500 mt-1 min-h-[18px]">
            {emailTidakValid ? "Email harus menggunakan format yang benar (contoh: nama@domain.com)." : ""}
          </p>
        </div>

        <div>
          <label className="text-xs text-gray-400">
            Password <span className="text-red-500">*</span>
          </label>

          <div className="relative mt-1">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              className={`w-full border rounded-2xl px-4 py-3 pr-12 bg-gray-50 focus:ring-2 focus:ring-[#0B4B48] focus:outline-none ${
                passwordKurang ? "border-red-400" : ""
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEye size={22} /> : <FiEyeOff size={22} />}
            </button>
          </div>

          <p className="text-xs text-red-500 mt-1 min-h-[18px]">
            {passwordKurang ? "Password minimal 8 karakter." : ""}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 px-8 py-5 bg-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-md text-black hover:bg-gray-50 transition"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`px-6 py-2 rounded-xl shadow-md text-white transition ${
            isSubmitDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0B4B48] hover:bg-[#083c3a]"
          }`}
        >
          Simpan
        </button>
      </div>
    </>
  );
};

// ==================== FORM HAPUS ====================
const DeleteUserForm = ({ userData, onDelete, onClose }) => {
  return (
    <>
      <div className="px-8 py-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Hapus Pengguna</h2>
      </div>

      <div className="p-8">
        <p className="text-gray-600 text-sm">
          Apakah kamu yakin ingin menghapus pengguna ini?
        </p>

        <div className="mt-4 bg-gray-50 border rounded-2xl px-5 py-4 space-y-1">
          <p className="text-sm font-semibold text-gray-800">
            {userData.nama}
          </p>

          <p className="text-xs text-gray-400">
            {userData.role} — {userData.unit}
          </p>

          <p className="text-xs text-gray-400">{userData.email}</p>
        </div>

        <p className="text-xs text-red-400 mt-3">
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>

      <div className="flex justify-end gap-3 px-8 py-5 bg-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-md text-black"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="px-6 py-2 rounded-xl bg-red-600 shadow-md text-white hover:bg-red-700 transition"
        >
          Hapus
        </button>
      </div>
    </>
  );
};

export default DaftarPengguna;