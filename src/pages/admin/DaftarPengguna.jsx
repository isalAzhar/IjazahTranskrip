// src/pages/DaftarPengguna.jsx
import React, { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown } from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";

const DaftarPengguna = () => {
  const [openTambah, setOpenTambah] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHapus, setOpenHapus] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // ✅ DATA AWAL
  const initialUsers = [
    {
      role: "Rektor",
      nama: "Drs. Agus Solo, M.KOM.",
      unit: "Universitas Ibn Khaldun Bogor",
      email: "agus123@gmail.com",
      password: "12345678",
    },
    {
      role: "Wakil Rektor",
      nama: "Drs. Anisaa Putri, M.Kom",
      unit: "Universitas Ibn Khaldun Bogor",
      email: "aniisa726@gmail.com",
      password: "12345678",
    },
    {
      role: "KATU Rektorat",
      nama: "Yoga Aldiansyah, S.Kom",
      unit: "Universitas Ibn Khaldun Bogor",
      email: "yoga925@gmail.com",
      password: "12345678",
    },
  ];

  const [users, setUsers] = useState(initialUsers);

  // Tambah user
  const handleAddUser = (newUser) => {
    setUsers([...users, newUser]);
  };

  // Edit user
  const handleEditUser = (updatedUser) => {
    const updatedUsers = users.map((u, i) =>
      i === selectedIndex ? updatedUser : u
    );
    setUsers(updatedUsers);
  };

  // Hapus user
  const handleHapusUser = () => {
    const updatedUsers = users.filter((_, i) => i !== selectedIndex);
    setUsers(updatedUsers);
    setOpenHapus(false);
  };

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daftar Pengguna</h1>
          <p className="text-sm text-gray-500">
            Kelola data pengguna sistem dan akses pengguna secara efisien.
          </p>
        </div>

        <button
          onClick={() => setOpenTambah(true)}
          className="flex items-center gap-2 bg-[#0B4B48] hover:bg-[#083c3a] text-white px-4 py-2 rounded-lg shadow-xl text-sm font-semibold transition"
        >
          <FiPlus /> Tambah Pengguna
        </button>
      </div>

      {/* TABLE */}
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
            {users.map((user, index) => (
              <tr key={index} className="border border-gray-300 hover:bg-gray-50">
                <td className="py-4 px-4 text-center font-bold">{index + 1}.</td>
                <td className="py-4 px-4 font-bold">{user.role}</td>
                <td className="py-4 px-4 text-center">{user.nama}</td>
                <td className="py-4 px-4 text-center">{user.unit}</td>
                <td className="py-4 px-4 text-center">{user.email}</td>
                <td className="py-4 px-4 text-center">{user.password}</td>
                <td className="py-4 px-4">
                  <div className="flex justify-center gap-3">
                    <button
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
            ))}
          </tbody>
        </table>
      </div>

      {/* ==================== MODAL TAMBAH ==================== */}
      {openTambah && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-250 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <AddUserForm onSave={handleAddUser} onClose={() => setOpenTambah(false)} users={users} />
          </div>
        </div>
      )}

      {/* ==================== MODAL EDIT ==================== */}
      {openEdit && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-150 rounded-2xl shadow-xl overflow-hidden">
            <EditUserForm userData={selectedUser} onSave={handleEditUser} onClose={() => setOpenEdit(false)} />
          </div>
        </div>
      )}

      {/* ==================== MODAL HAPUS ==================== */}
      {openHapus && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-112.5 rounded-2xl shadow-xl overflow-hidden">
            <DeleteUserForm userData={selectedUser} onDelete={handleHapusUser} onClose={() => setOpenHapus(false)} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

// ==================== KOMPONEN FORM TAMBAH ====================
const AddUserForm = ({ onSave, onClose, users = [] }) => {
  const [jenisUnit, setJenisUnit] = useState("");
  const [namaUnit, setNamaUnit] = useState("");
  const [role, setRole] = useState("");
  const [form, setForm] = useState({
    nama: "",
    nidn: "",
    email: "",
    password: "",
  });

  const dataRole = {
    Dekan: { nama: "Dr. Husni, M.Kom", nidn: "111111111111" },
    "Wakil Dekan": { nama: "Dr. Andi Saputra, M.Kom", nidn: "222222222222" },
    "TU Fakultas": { nama: "Budi Santoso, S.Kom", nidn: "333333333333" },
  };

  const roleList = ["Dekan", "Wakil Dekan", "TU Fakultas"];
  const daftarFakultas = [
    "Fakultas Teknik dan Sains",
    "Fakultas Ekonomi dan Bisnis",
    "Fakultas Hukum",
    "Fakultas Agama Islam",
    "Fakultas Keguruan dan Ilmu Pendidikan",
    "Fakultas Ilmu Kesehatan",
  ];

  const isFakultasFull = (namaFakultas) => {
    const usersInFakultas = users.filter((u) => u.unit === namaFakultas);
    const rolesTerisi = usersInFakultas.map((u) => u.role);
    return roleList.every((r) => rolesTerisi.includes(r));
  };

  const isRoleTerisi = (roleNama) => {
    return users.some((u) => u.unit === namaUnit && u.role === roleNama);
  };

  const handleRoleChange = (value) => {
    setRole(value);
    if (dataRole[value]) {
      setForm({
        ...form,
        nama: dataRole[value].nama,
        nidn: dataRole[value].nidn,
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const newUser = {
      role,
      nama: form.nama,
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
        <h2 className="text-xl font-bold text-gray-800">Tambah Pengguna Baru</h2>
      </div>

      <div className="p-8 space-y-8">
        {/* SECTION 1 */}
        <div>
          <div className="grid grid-cols-3 gap-4">
            {/* Jenis Unit */}
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Jenis Unit</label>
              <div className="relative">
                <select
                  value={jenisUnit}
                  onChange={(e) => {
                    setJenisUnit(e.target.value);
                    setNamaUnit("");
                    setRole("");
                  }}
                  className="w-full border border-gray-400 rounded-2xl px-4 py-3 pr-12 bg-gray-50 outline-none focus:border-[#0B4B48] appearance-none"
                >
                  <option value="" disabled hidden>Pilih Jenis Unit</option>
                  <option value="Universitas" disabled className="text-gray-400">Universitas</option>
                  <option value="Fakultas">Fakultas</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black" />
              </div>
            </div>

            {/* Nama Unit */}
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nama Unit</label>
              <div className="relative">
                <select
                  value={namaUnit}
                  onChange={(e) => {
                    setNamaUnit(e.target.value);
                    setRole("");
                  }}
                  className="w-full border border-gray-400 rounded-2xl px-4 py-3 pr-12 bg-gray-50 appearance-none outline-none focus:border-[#0B4B48]"
                >
                  <option value="" disabled hidden>Pilih Nama Unit</option>
                  {daftarFakultas.map((f) => (
                    <option key={f} value={f} disabled={isFakultasFull(f)} className={isFakultasFull(f) ? "text-gray-400" : ""}>
                      {f}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black" />
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full border border-gray-400 rounded-2xl px-4 py-3 pr-12 bg-gray-50 outline-none focus:border-[#0B4B48] appearance-none"
                >
                  <option value="" disabled hidden>Pilih Role</option>
                  {roleList.map((r) => (
                    <option key={r} value={r} disabled={isRoleTerisi(r) || !namaUnit} className={isRoleTerisi(r) ? "text-gray-400" : ""}>
                      {r}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 - Data Role */}
        {role && (
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-3">Data {role}</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-400">Nama {role}</label>
                <input value={form.nama} readOnly className="w-full mt-1 border rounded-2xl px-4 py-3 bg-gray-100" />
              </div>
              <div>
                <label className="text-xs text-gray-400">NIDN {role}</label>
                <input value={form.nidn} readOnly className="w-full mt-1 border rounded-2xl px-4 py-3 bg-gray-100" />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3 - Email & Password */}
        {role && (
          <div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-400">Email</label>
                <input name="email" placeholder="Masukkan email" onChange={handleChange} className="w-full mt-1 border rounded-2xl px-4 py-3 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Password</label>
                <input name="password" placeholder="Minimal 8 karakter" onChange={handleChange} className="w-full mt-1 border rounded-2xl px-4 py-3 bg-gray-50" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 px-8 py-5 bg-gray-200">
        <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-md text-black">
          Batal
        </button>
        <button onClick={handleSubmit} className="px-6 py-2 rounded-xl bg-[#0B4B48] shadow-md text-white">
          Simpan
        </button>
      </div>
    </>
  );
};

// ==================== KOMPONEN FORM EDIT ====================
const EditUserForm = ({ userData, onSave, onClose }) => {
  const [form, setForm] = useState({
    nama: userData.nama || "",
    email: userData.email || "",
    password: userData.password || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave({ ...userData, ...form });
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
        <div>
          <label className="text-xs text-gray-400">Nama</label>
          <input name="nama" value={form.nama} onChange={handleChange} className="w-full mt-1 border rounded-2xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-[#0B4B48]" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="w-full mt-1 border rounded-2xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-[#0B4B48]" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Password</label>
          <input name="password" value={form.password} onChange={handleChange} placeholder="Minimal 8 karakter" className="w-full mt-1 border rounded-2xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-[#0B4B48]" />
        </div>
      </div>

      <div className="flex justify-end gap-3 px-8 py-5 bg-gray-200">
        <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-md text-black">
          Batal
        </button>
        <button onClick={handleSubmit} className="px-6 py-2 rounded-xl bg-[#0B4B48] shadow-md text-white">
          Simpan
        </button>
      </div>
    </>
  );
};

// ==================== KOMPONEN FORM HAPUS ====================
const DeleteUserForm = ({ userData, onDelete, onClose }) => {
  return (
    <>
      <div className="px-8 py-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Hapus Pengguna</h2>
      </div>

      <div className="p-8">
        <p className="text-gray-600 text-sm">Apakah kamu yakin ingin menghapus pengguna ini?</p>
        <div className="mt-4 bg-gray-50 border rounded-2xl px-5 py-4 space-y-1">
          <p className="text-sm font-semibold text-gray-800">{userData.nama}</p>
          <p className="text-xs text-gray-400">{userData.role} — {userData.unit}</p>
          <p className="text-xs text-gray-400">{userData.email}</p>
        </div>
        <p className="text-xs text-red-400 mt-3">Tindakan ini tidak dapat dibatalkan.</p>
      </div>

      <div className="flex justify-end gap-3 px-8 py-5 bg-gray-200">
        <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-md text-black">
          Batal
        </button>
        <button onClick={onDelete} className="px-6 py-2 rounded-xl bg-red-600 shadow-md text-white hover:bg-red-700 transition">
          Hapus
        </button>
      </div>
    </>
  );
};

export default DaftarPengguna;