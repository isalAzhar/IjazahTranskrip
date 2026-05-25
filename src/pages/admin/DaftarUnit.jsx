// src/pages/DaftarUnit.jsx
import React, { useState, useCallback, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiChevronDown, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { HiCheckCircle } from "react-icons/hi";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

// 🔥 IMPORT BRANKAS TOKEN
import { useAuth } from "../context/AuthContext";

// ==================== FUNGSI HELPER ====================
export const getUnitsData = () => {
  const saved = localStorage.getItem("units");
  return saved ? JSON.parse(saved) : [];
};

// Di dalam file DaftarUnit.jsx / .js
export const getPersonilByRole = (jenisUnit, role, namaUnit) => {
const semuaUnit = getUnitsData();
const unitData = semuaUnit.find(u => u.nama === namaUnit || u.nama_unit === namaUnit);
console.log("🔍 CEK ISI DATA UNIT UNTUK NIDN:", unitData);


  if (!unitData) return null;

  let namaPejabat = "";
  let nidnPejabat = "";

  // 🔥 SAMAKAN PERSIS DENGAN DATABASE (Huruf Kecil Semua)
  switch (role) {
    case "rektor":
      namaPejabat = unitData.rektor;
      nidnPejabat = unitData.nidn_rektor || unitData.nidn_rektor;
      break;
    case "wakil_rektor_1":
      namaPejabat = unitData.wakil_rektor_1 || unitData.wakilRektor || unitData.wakil;
      nidnPejabat = unitData.nidnWakilRektor || unitData.nidn_wakil_rektor_1;
      break;
   case "tu_rektorat":
      namaPejabat = unitData.tu_rektorat || unitData.katu;
      nidnPejabat = unitData.nidn_tu_rektorat || "";
      break;

   case "dekan":
      namaPejabat = unitData.dekan;
      nidnPejabat = unitData.nidnDekan; // <-- Tadi salah karena nidn_dekan
      break;

   case "wakil_dekan_1":
      namaPejabat = unitData.wakil;     // <-- Tadi salah karena wakil_dekan_1
      nidnPejabat = unitData.nidnWakil; // <-- Tadi salah karena nidn_wakil_dekan_1
      break;

  case "tu_fakultas":
      namaPejabat = unitData.katu;      // <-- Tadi salah karena tu_fakultas
      nidnPejabat = ""; // TU biasanya tidak wajib NIDN
      break;
  
    default:
      return null;
  }

  if (!namaPejabat) return null;

  return {
    nama: namaPejabat,
    nidn: nidnPejabat || "" 
  };
};

export const getFakultasList = () => {
  const units = getUnitsData();
  return units.filter(u => u.jenis?.toLowerCase() === "fakultas").map(u => u.nama);
};

export const isRoleTerisi = (unitName, role) => {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  return users.some(u => u.unit === unitName && u.role === role);
};

export const isFakultasLengkap = (fakultasName) => {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const usersInFakultas = users.filter(u => u.unit === fakultasName);
  const requiredRoles = ["Dekan", "Wakil Dekan", "TU Fakultas"];
  return requiredRoles.every(role => usersInFakultas.some(u => u.role === role));
};
// ==================== AKHIR FUNGSI HELPER ====================

// ==================== CONSTANTS & VALIDASI ====================
const emptyForm = {
  jenis: "", nama: "", en: "",
  dekan: "", nidnDekan: "",
  wakil: "", nidnWakil: "",
  katu: "",
  ttdDekan: null, parafWakil: null, parafKatu: null, stempel: null,
};

const emptyProdiForm = {
  nama: "", namaEn: "", sk: "", ketua: "", nidn: "", file: null,
};

const onlyNumber = (value) => value.replace(/\D/g, "");

const RequiredLabel = ({ children }) => (
  <label className="text-black font-semibold text-sm">
    {children} <span className="text-red-500">*</span>
  </label>
);

const ActionIconButton = ({ children, onClick, danger = false, title = "" }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`w-8 h-8 flex items-center justify-center rounded-md transition ${
      danger
        ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
        : "text-gray-400 hover:text-[#1F7A6E] hover:bg-[#E8F5E9]"
    }`}
  >
    {children}
  </button>
);
// ==================== AKHIR CONSTANTS ====================

const DaftarUnit = () => {
  // 🔥 STATE TOKEN & API
  const { token, logout } = useAuth();
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // 🔥 STATE UI
  const [openUnit, setOpenUnit] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [loadingDone, setLoadingDone] = useState(false);

  // 🔥 STATE PRODI
  const [openProdiForm, setOpenProdiForm] = useState(false);
  const [prodiForm, setProdiForm] = useState(emptyProdiForm);
  const [activeUnitId, setActiveUnitId] = useState(null);
  const [openProdiIndex, setOpenProdiIndex] = useState({});

  const [form, setForm] = useState(emptyForm);

  // 🔥 FETCH DATA DARI API
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setIsLoading(true);
        setApiError("");

        const response = await fetch("/api/unit/getAllUnit", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const result = await response.json();
        
        if (response.ok) {
          const rawData = Array.isArray(result) ? result : (result.data || []);
          const formattedData = rawData.map(item => {
            const jenisRaw = item.jenis_unit ? item.jenis_unit.toLowerCase() : "";
            const isUni = jenisRaw === "universitas";

            const mappedProdi = Array.isArray(item.prodi) ? item.prodi.map(p => ({
              id: p.id_prodi, // Tangkap ID Prodi jika nanti mau dipakai untuk Edit/Delete
              nama: p.nama_prodi || "-",
              namaEn: p.nama_prodi_en || "",
              ketua: p.kaprodi || "-",
              nidn: p.nidn_kaprodi || "-",
              sk: p.no_sk_akreditasi || "-",
              fileLama: p.file_paraf_kaprodi || null // Catat nama file jika sudah ada
            })).sort((a, b) => {
              // Mengurutkan Prodi sesuai abjad (A-Z)
              const namaA = a.nama || "";
              const namaB = b.nama || "";
              return namaA.localeCompare(namaB);
            }) : [];
            
            return {
              id: item.id_unit,
              jenis: isUni ? "Universitas" : "Fakultas",
              nama: item.nama_unit || "-",
              en: item.nama_unit_en || "-",
              dekan: isUni ? item.rektor : item.dekan,
              nidnDekan: isUni ? item.nidn_rektor : item.nidn_dekan,
              wakil: isUni ? item.wakil_rektor_1 : item.wakil_dekan_1,
              nidnWakil: isUni ? item.nidn_wakil_rektor_1 : item.nidn_wakil_dekan_1,
              katu: isUni ? item.tu_rektorat : item.tu_fakultas,
              prodi: mappedProdi
            };
          });
          setUnits(formattedData);
          localStorage.setItem("units", JSON.stringify(formattedData));
        } else {
          setApiError(result.message || "Gagal mengambil data unit.");
        }
      } catch (err) {
        setApiError("Gagal terhubung ke server backend.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchUnits();
  }, [token, logout]);

  useEffect(() => {
    if (units.length > 0) {
      localStorage.setItem("units", JSON.stringify(units));
    }
  }, [units]);

  // VARIABEL UI DINAMIS
  const isUniversitas = form.jenis === "Universitas";
  const universitasSudahAda = units.some((u) => u.jenis === "Universitas" && u.id !== editId);

  const labelPimpinan = isUniversitas ? "Rektor" : "Dekan";
  const labelWakil = isUniversitas ? "Wakil Rektor" : "Wakil Dekan";
  const labelKatu = isUniversitas ? "TU Rektor" : "KATU Fakultas";
  const labelTTD = isUniversitas ? "Tanda Tangan Rektor" : "Tanda Tangan Dekan";
  const labelParafWakil = isUniversitas ? "Paraf Wakil Rektor" : "Paraf Wakil Dekan";
  const labelParafKatu = isUniversitas ? "Paraf TU Rektor" : "Paraf KATU";
  const labelStempel = isUniversitas ? "Stempel Universitas" : "Stempel Fakultas";

  const isUnitFormValid = 
    form.jenis?.trim() && form.nama?.trim() && form.en?.trim() &&
    form.dekan?.trim() && form.nidnDekan?.trim() &&
    form.wakil?.trim() && form.nidnWakil?.trim() &&
    form.katu?.trim() &&
    (editId ? true : (form.ttdDekan && form.parafWakil && form.parafKatu && form.stempel));

  const isProdiFormValid =
    prodiForm.nama?.trim() && prodiForm.namaEn?.trim() && prodiForm.sk?.trim() &&
    prodiForm.ketua?.trim() && prodiForm.nidn?.trim(); 

  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    // Timeout dihapus agar user bisa klik "Selesai" secara manual
  };

  const handleChange = useCallback((key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })), []);
  const handleNumberChange = useCallback((key) => (e) => setForm((prev) => ({ ...prev, [key]: onlyNumber(e.target.value) })), []);
const handleFile = useCallback((key) => (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi: Cek apakah tipe file adalah PNG
      if (file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
        alert("Hanya file gambar dengan format .PNG yang diperbolehkan!");
        e.target.value = ""; // Reset input file agar kosong lagi
        return;
      }
      setForm((prev) => ({ ...prev, [key]: file }));
    }
  }, []);
  const openForm = (unit = null) => {
    if (unit) {
      setEditId(unit.id);
        setForm({
        jenis: unit.jenis || "",
        nama: unit.nama || "",
        en: unit.en || "",
        dekan: unit.dekan || "",
        nidnDekan: unit.nidnDekan || "",
        wakil: unit.wakil || "",
        nidnWakil: unit.nidnWakil || "",
        katu: unit.katu || "",
        ttdDekan: null,
        parafWakil: null,
        parafKatu: null,
        stempel: null,
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setOpenModal(true);
  };

  // 🔥 SIMPAN KE API
  const handleSave = async () => {
    if (!form.jenis || !form.nama) {
      alert("Jenis unit dan Nama Unit wajib diisi!");
      return;
    }

    if (form.jenis === "Universitas" && universitasSudahAda && !editId) {
      alert("Universitas hanya boleh ditambahkan satu kali!");
      return;
    }

    const formData = new FormData();
    formData.append("nama_unit", form.nama);
    formData.append("jenis_unit", form.jenis.toLowerCase());
    formData.append("nama_unit_en", form.en || "");
    formData.append("dekan", form.dekan || "");
    formData.append("nidn_dekan", form.nidnDekan || "");
    formData.append("wakil_dekan_1", form.wakil || "");
    formData.append("nidn_wakil_dekan_1", form.nidnWakil || "");
    formData.append("tu_fakultas", form.katu || "");
    
    if (form.ttdDekan) formData.append("file_ttd_dekan", form.ttdDekan);
    if (form.parafWakil) formData.append("file_paraf_wadek", form.parafWakil);
    if (form.parafKatu) formData.append("file_paraf_tu_fakultas", form.parafKatu);
    if (form.stempel) formData.append("file_stempel_fakultas", form.stempel);

    try {
      const url = editId ? `/api/unit/editUnit/${editId}` : "/api/unit/createUnit";
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Authorization": `Bearer ${token}` }, // TANPA CONTENT-TYPE
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setOpenModal(false);
        triggerSuccess(editId ? "Unit berhasil diupdate!" : "Unit berhasil ditambahkan!");
      } else {
        alert("Error Backend: " + JSON.stringify(result));
      }
    } catch (err) {
      alert("Error Koneksi.");
    }
  };

// 🔥 FUNGSI HAPUS UNIT (Menembak API DELETE)
  const handleDelete = async (id) => {
    try {
      // 🎯 Sesuaikan rute ini dengan rute delete di Backend Komandan
      // Misalnya: "/api/unit/deleteUnit/${id}" atau "/api/unit/${id}"
      const response = await fetch(`/api/unit/deleteUnit/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        // Jika backend merespon sukses, hapus dari tampilan Frontend
        setUnits((prev) => prev.filter((u) => u.id !== id));
        triggerSuccess("Unit berhasil dihapus dari database!");
      } else {
        const errorData = await response.json();
        alert(`Gagal menghapus unit: ${errorData.message || "Kesalahan Server"}`);
      }
    } catch (error) {
      console.error("Error menghapus unit:", error);
      alert("Terjadi kesalahan koneksi saat menghapus unit.");
    }
  };

  // 🔥 TOMBOL SELESAI DI KLIK
  const handleSelesai = () => {
    setLoadingDone(true);
    setTimeout(() => {
      setLoadingDone(false);
      setShowSuccess(false);
      window.location.reload(); // Refresh untuk menarik data terbaru dari DB
    }, 500);
  };

  // --- PRODI FUNCTIONS ---
  const openProdiModal = (unitId) => {
    setActiveUnitId(unitId);
    setProdiForm(emptyProdiForm);
    setOpenProdiForm(true);
  };

  const handleEditProdi = (unitId, index) => {
    const unit = units.find((u) => u.id === unitId);
    const data = unit.prodi[index];
    setProdiForm({ ...emptyProdiForm, ...data, editIndex: index });
    setActiveUnitId(unitId);
    setOpenProdiForm(true);
  };

  const handleDeleteProdi = (unitId, index) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== unitId) return u;
        return { ...u, prodi: u.prodi.filter((_, i) => i !== index) };
      })
    );
    triggerSuccess("Prodi berhasil dihapus");
  };

  // 🔥 FUNGSI SIMPAN PRODI (Menembak API POST/PUT)
  const saveProdi = async () => {
    if (!isProdiFormValid) return;

    // 1. Bungkus data ke dalam FormData agar file foto bisa ikut terkirim
    const formData = new FormData();
    formData.append("id_unit", activeUnitId); // ID Fakultas/Universitas tempat Prodi ini bernaung
    formData.append("nama_prodi", prodiForm.nama);
    formData.append("nama_prodi_en", prodiForm.namaEn || "");
    formData.append("kaprodi", prodiForm.ketua || "");
    formData.append("nidn_kaprodi", prodiForm.nidn || "");
    formData.append("no_sk_akreditasi", prodiForm.sk || "");

    // Jika ada file stempel/paraf prodi yang dipilih, masukkan ke form
    if (prodiForm.file) {
      formData.append("file_paraf_kaprodi", prodiForm.file);
    }

    try {
      // 2. Tentukan apakah ini mode Edit atau Tambah Baru
      const isEdit = prodiForm.editIndex !== undefined;
      
      // 🎯 CATATAN KOMANDAN: Sesuaikan rute URL ini dengan rute di Backend!
      const url = isEdit 
        ? `/api/unit/editProdi/${prodiForm.id}` // Jika update
        : `/api/unit/createProdi`;              // Jika tambah baru
        
      const method = isEdit ? "PUT" : "POST";

      // 3. Tembakkan ke server Backend
      const response = await fetch(url, {
        method: method,
        headers: { 
          "Authorization": `Bearer ${token}` 
          // TANPA Content-Type, biarkan browser yang mengatur otomatis
        },
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setOpenProdiForm(false);
        triggerSuccess(isEdit ? "Prodi berhasil diupdate!" : "Prodi berhasil ditambahkan!");
        // UI akan ter-refresh otomatis ketika tombol "Selesai" diklik (karena fungsi handleSelesai)
      } else {
        alert("Error Backend: " + (result.message || JSON.stringify(result)));
      }
    } catch (err) {
      console.error("Error save prodi:", err);
      alert("Error Koneksi: Gagal menyimpan Prodi ke server.");
    }
  };

const handleProdiFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
        alert("Hanya file gambar dengan format .PNG yang diperbolehkan!");
        e.target.value = ""; 
        return;
      }
      setProdiForm((prev) => ({ ...prev, file: file }));
    }
  };  const handleProdiNidnChange = (e) => setProdiForm((prev) => ({ ...prev, nidn: onlyNumber(e.target.value) }));
  const toggleProdiDropdown = (unitId, idx) => {
    const key = `${unitId}-${idx}`;
    setOpenProdiIndex((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const isProdiOpen = (unitId, idx) => !!openProdiIndex[`${unitId}-${idx}`];

  return (
    <DashboardLayout>
      <div className="bg-[#F7F8FA] p-6 rounded-xl min-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">Daftar Unit</h1>
            <p className="text-sm text-gray-400 mt-1">
              Kelola data pejabat penandatangan dokumen ijazah dan transkrip.
            </p>
            {apiError && <p className="text-sm text-red-500 mt-2 font-semibold">⚠️ {apiError}</p>}
          </div>
          <button
            type="button"
            onClick={() => openForm()}
            className="flex items-center gap-2 bg-[#0B4B48] hover:bg-[#083c3a] text-white px-4 py-2 rounded-lg shadow-xl text-sm font-semibold transition"
          >
            <FiPlus size={14} />
            Tambah Unit
          </button>
        </div>

        {/* LIST UNIT */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
          {isLoading ? (
            <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B4B48]"></div>
               <p className="text-sm text-gray-500 font-medium">Menarik data dari server pusat...</p>
            </div>
          ) : units.length === 0 ? (
            <div className="py-10 text-center text-gray-400 font-medium text-sm">
               Belum ada data unit di database. Silakan tambah unit baru.
            </div>
          ) : (
            [...units]
              .sort((a, b) => {
                if (a.jenis === "Universitas") return -1;
                if (b.jenis === "Universitas") return 1;
                
                const namaA = a.nama || "";
                const namaB = b.nama || "";
                return namaA.localeCompare(namaB);
              })
              .map((u) => {
                const isUni = u.jenis === "Universitas";
                const pimpinan = isUni ? "Rektor" : "Dekan";
                const wakil = isUni ? "Wakil Rektor" : "Wakil Dekan";
                const katu = isUni ? "TU Rektor" : "KATU Fakultas";

                return (
                  <div key={u.id} className="border border-gray-100 rounded-lg">
                    {/* HEADER UNIT */}
                    <div
                      onClick={() => setOpenUnit(openUnit === u.id ? null : u.id)}
                      className="flex justify-between items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-gray-800 truncate">{u.nama}</p>
                        <p className="text-xs text-gray-400 truncate">{u.en}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <ActionIconButton title="Buka/Tutup">
                          <FiChevronDown
                            className={`transition-transform duration-200 ${openUnit === u.id ? "rotate-180" : ""}`}
                          />
                        </ActionIconButton>
                        <ActionIconButton
                          title="Edit Unit"
                          onClick={(e) => { e.stopPropagation(); openForm(u); }}
                        >
                          <FiEdit2 size={16} />
                        </ActionIconButton>
                        <ActionIconButton
                          title="Hapus Unit"
                          danger
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(u.id);
                            setDeleteType("unit");
                            setShowDeleteModal(true);
                          }}
                        >
                          <FiTrash2 size={16} />
                        </ActionIconButton>
                      </div>
                    </div>

                    {/* DROPDOWN UNIT */}
                    {openUnit === u.id && (
                      <div className="px-4 pb-5 pt-3 space-y-5 border-t border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{pimpinan}</p>
                          <p className="text-xs text-gray-400">
                            {u.dekan} <span className="mx-1">-</span> {u.nidnDekan}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{wakil}</p>
                          <p className="text-xs text-gray-400">
                            {u.wakil} <span className="mx-1">-</span> {u.nidnWakil}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{katu}</p>
                          <p className="text-xs text-gray-400">{u.katu}</p>

                          {/* DAFTAR PRODI */}
                          {u.jenis === "Fakultas" && u.prodi?.length > 0 && (
                            <div className="mt-3 pl-3 border-l border-gray-200 space-y-2">
                              {u.prodi.map((p, idx) => (
                                <div key={idx} className="border border-gray-100 rounded-lg">
                                  {/* ROW PRODI */}
                                  <div
                                    onClick={() => toggleProdiDropdown(u.id, idx)}
                                    className="flex justify-between items-center gap-4 px-3 py-2.5 cursor-pointer hover:bg-gray-50 rounded-lg"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-gray-800 truncate">{p.nama}</p>
                                      {p.namaEn && (
                                        <p className="text-[11px] text-gray-400 truncate">{p.namaEn}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <ActionIconButton title="Buka/Tutup">
                                        <FiChevronDown
                                          size={15}
                                          className={`transition-transform duration-200 ${isProdiOpen(u.id, idx) ? "rotate-180" : ""}`}
                                        />
                                      </ActionIconButton>
                                      <ActionIconButton
                                        title="Edit Prodi"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditProdi(u.id, idx);
                                        }}
                                      >
                                        <FiEdit2 size={14} />
                                      </ActionIconButton>
                                      <ActionIconButton
                                        title="Hapus Prodi"
                                        danger
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteTarget({ unitId: u.id, index: idx });
                                          setDeleteType("prodi");
                                          setShowDeleteModal(true);
                                        }}
                                      >
                                        <FiTrash2 size={14} />
                                      </ActionIconButton>
                                    </div>
                                  </div>

                                  {/* DROPDOWN PRODI */}
                                  {isProdiOpen(u.id, idx) && (
                                    <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                                      <p className="text-sm font-medium text-gray-700">Ketua Program Studi</p>
                                      <p className="text-xs text-gray-400 mt-0.5">{p.ketua}</p>
                                      {p.nidn && (
                                        <p className="text-xs text-gray-400">NIDN: {p.nidn}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {u.jenis === "Fakultas" && (
                          <button
                            type="button"
                            onClick={() => openProdiModal(u.id)}
                            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#1F7A6E] border border-[#1F7A6E] px-3 py-1.5 rounded-md hover:bg-[#1F7A6E] hover:text-white transition"
                          >
                            <FiPlus size={12} />
                            Tambah Prodi
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>

        {/* MODAL UNIT */}
        {openModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">{editId ? "Edit Unit" : "Tambah Unit"}</h2>
                <p className="text-sm text-gray-500 mt-1">Lengkapi data unit di bawah ini</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>Jenis Unit</RequiredLabel>
                    <div className="relative">
                      <select
                        value={form.jenis}
                        onChange={handleChange("jenis")}
                        className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 pr-12 bg-gray-50 outline-none focus:border-[#0B4B48] appearance-none"
                      >
                        <option value="" disabled hidden>Pilih Jenis Unit</option>
                        <option 
                          value="Universitas" 
                          disabled={universitasSudahAda && !editId}
                        >
                          Universitas {(universitasSudahAda && !editId) ? "(Sudah terisi)" : ""}
                        </option>
                        <option value="Fakultas">Fakultas</option>
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black text-lg" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>Nama Unit</RequiredLabel>
                    <input
                      value={form.nama}
                      onChange={handleChange("nama")}
                      placeholder="Masukkan nama unit"
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>Nama Unit (English)</RequiredLabel>
                    <input
                      value={form.en}
                      onChange={handleChange("en")}
                      placeholder="Nama unit dalam bahasa Inggris"
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>{labelPimpinan}</RequiredLabel>
                    <input
                      value={form.dekan}
                      onChange={handleChange("dekan")}
                      placeholder={`Nama ${labelPimpinan}`}
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>NIDN</RequiredLabel>
                    <input
                      value={form.nidnDekan}
                      onChange={handleNumberChange("nidnDekan")}
                      placeholder="NIDN (hanya angka)"
                      inputMode="numeric"
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>{labelTTD}</RequiredLabel>
                    <input
                      type="file"
                      accept="image/png" 
                      onChange={handleFile("ttdDekan")}
                      className="w-full text-sm text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {form.ttdDekan?.name && <p className="text-xs text-gray-400 mt-1">{form.ttdDekan.name}</p>}

                 
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>{labelWakil}</RequiredLabel>
                    <input
                      value={form.wakil}
                      onChange={handleChange("wakil")}
                      placeholder={`Nama ${labelWakil}`}
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>NIDN Wakil</RequiredLabel>
                    <input
                      value={form.nidnWakil}
                      onChange={handleNumberChange("nidnWakil")}
                      placeholder="NIDN Wakil (hanya angka)"
                      inputMode="numeric"
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>{labelParafWakil}</RequiredLabel>
                    <input
                      type="file"
                      accept="image/png" 
                      onChange={handleFile("parafWakil")}
                      className="w-full text-sm text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {form.parafWakil?.name && <p className="text-xs text-gray-400 mt-1">{form.parafWakil.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>{labelKatu}</RequiredLabel>
                    <input
                      value={form.katu}
                      onChange={handleChange("katu")}
                      placeholder={`Nama ${labelKatu}`}
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>{labelParafKatu}</RequiredLabel>
                    <input
                      type="file"
                      accept="image/png" 
                      onChange={handleFile("parafKatu")}
                      className="w-full text-sm text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {form.parafKatu?.name && <p className="text-xs text-gray-400 mt-1">{form.parafKatu.name}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>{labelStempel}</RequiredLabel>
                    <input
                      type="file"
                      accept="image/png" 
                      onChange={handleFile("stempel")}
                      className="w-full text-sm text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {form.stempel?.name && <p className="text-xs text-gray-400 mt-1">{form.stempel.name}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-5 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-md text-black font-medium hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isUnitFormValid}
                  className={`px-6 py-2 rounded-xl shadow-md font-medium transition ${
                    !isUnitFormValid
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#0B4B48] text-white hover:bg-[#083c3a]"
                  }`}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PRODI */}
        {openProdiForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  {prodiForm.editIndex !== undefined ? "Edit Program Studi" : "Tambah Program Studi"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Lengkapi data program studi di bawah ini</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col gap-2">
                  <RequiredLabel>Fakultas</RequiredLabel>
                  <div className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-100 text-gray-800">
                    {units.find((u) => u.id === activeUnitId)?.nama || "-"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>Nama Prodi</RequiredLabel>
                    <input
                      value={prodiForm.nama}
                      onChange={(e) => setProdiForm({ ...prodiForm, nama: e.target.value })}
                      placeholder="Masukkan nama program studi"
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>Nama Prodi (English)</RequiredLabel>
                    <input
                      value={prodiForm.namaEn}
                      onChange={(e) => setProdiForm({ ...prodiForm, namaEn: e.target.value })}
                      placeholder="Nama program studi dalam bahasa Inggris"
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>No SK Akreditasi</RequiredLabel>
                    <input
                      value={prodiForm.sk}
                      onChange={(e) => setProdiForm({ ...prodiForm, sk: e.target.value })}
                      placeholder="Nomor SK Akreditasi"
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>Kepala Program Studi</RequiredLabel>
                    <input
                      value={prodiForm.ketua}
                      onChange={(e) => setProdiForm({ ...prodiForm, ketua: e.target.value })}
                      placeholder="Nama Kepala Program Studi"
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>NIDN Kepala Program Studi</RequiredLabel>
                    <input
                      value={prodiForm.nidn}
                      onChange={handleProdiNidnChange}
                      placeholder="NIDN (hanya angka)"
                      inputMode="numeric"
                      className="w-full border border-gray-400 shadow-lg rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B4B48]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <RequiredLabel>File Paraf Kepala Program Studi</RequiredLabel>
                    <input
                      type="file"
                       accept="image/png"
                      onChange={handleProdiFile}
                      className="w-full text-sm text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {prodiForm.file?.name && <p className="text-xs text-gray-400 mt-1">{prodiForm.file.name}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-5 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setOpenProdiForm(false)}
                  className="px-6 py-2 rounded-xl bg-white border border-gray-300 shadow-md text-black font-medium hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveProdi}
                  disabled={!isProdiFormValid}
                  className={`px-6 py-2 rounded-xl shadow-md font-medium transition ${
                    !isProdiFormValid
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#0B4B48] text-white hover:bg-[#083c3a]"
                  }`}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POPUP SUCCESS */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
          <div className="bg-white w-[360px] rounded-2xl p-7 text-center shadow-xl">
            <div className="w-16 h-16 mx-auto bg-[#0B4B48] flex items-center justify-center rounded-full mb-4 shadow-md">
              <HiCheckCircle size={36} className="text-white" />
            </div>
            <p className="text-base font-semibold text-gray-800">Data Berhasil Disimpan</p>
            <p className="text-sm text-gray-400 mt-1">{successMessage}</p>
            <button
              type="button"
              onClick={handleSelesai}
              disabled={loadingDone}
              className="mt-5 w-full py-2 rounded-md text-sm text-white bg-[#0B4B48] hover:bg-[#083c3a] transition"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white w-[360px] rounded-2xl p-6 text-center shadow-xl">
            <div className="w-16 h-16 mx-auto bg-red-500 flex items-center justify-center rounded-full mb-4">
              <HiOutlineExclamationTriangle size={32} className="text-white" />
            </div>
            <p className="text-base font-semibold text-gray-800">
              Apakah Anda yakin ingin menghapus {deleteType === "prodi" ? "Prodi" : "Unit"} ini?
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Tindakan ini tidak dapat dibatalkan. Seluruh data yang terkait akan dihapus secara permanen.
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  if (deleteType === "unit") {
                    handleDelete(deleteTarget);
                  } else if (deleteType === "prodi") {
                    handleDeleteProdi(deleteTarget.unitId, deleteTarget.index);
                  }
                  setShowDeleteModal(false);
                }}
                className="w-full bg-red-600 text-white py-2 rounded-md text-sm hover:bg-red-700 transition"
              >
                Hapus Data
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-full bg-gray-100 py-2 rounded-md text-sm hover:bg-gray-200 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DaftarUnit;