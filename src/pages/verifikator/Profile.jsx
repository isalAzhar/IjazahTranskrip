import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiUser, FiLock, FiCheckCircle, FiEye, FiEyeOff, FiX, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

// ==================== FUNGSI FORMAT ROLE ====================
const formatRoleUI = (role) => {
  if (!role) return "-";
  const roleMap = {
    "admin": "Admin",
    "operator": "Operator",
    "rektor": "Rektor",
    "wakil_rektor_1": "Wakil Rektor 1",
    "tu_rektorat": "TU Rektorat",
    "dekan": "Dekan",
    "wakil_dekan_1": "Wakil Dekan 1",
    "tu_fakultas": "TU Fakultas"
  };
  return roleMap[role.toLowerCase()] || role; 
};
// ============================================================

const Profile = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // 🔥 State Data User Dinamis
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State Modals & Toasts
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // 🔥 NEW: State untuk Alert Modal (pengganti alert)
  const [alertModal, setAlertModal] = useState({ show: false, message: "", title: "" });
  
  // State Form Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🔥 FUNGSI SHOW ALERT MODAL (Pengganti alert())
  const showAlert = (message, title = "Perhatian") => {
    setAlertModal({ show: true, message, title });
  };

  // 🔥 1. PENYEDOTAN DATA PROFIL DARI BACKEND
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/profile/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        const result = await response.json();
        
        if (response.ok && result.data) {
          const joinDate = result.data.created_at 
            ? new Date(result.data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            : "-";

          setUserData({
            nama: result.data.nama || "-", 
            nidn: result.data.nidn || "-", 
            email: result.data.email || "-",
            role: result.data.role || "-",
            tanggal_bergabung: joinDate
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🔥 2. FUNGSI UBAH PASSWORD REAL KE BACKEND (pakai Alert Modal)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // 🔥 VALIDASI PAKAI ALERT MODAL (BUKAN ALERT BIASA)
    if (newPassword !== confirmPassword) {
      showAlert("Konfirmasi password tidak cocok!", "Gagal");
      return;
    }
    if (newPassword.length < 8) {
      showAlert("Password baru minimal 8 karakter!", "Gagal");
      return;
    }
    if (newPassword === currentPassword) {
      showAlert("Password baru tidak boleh sama dengan password lama!", "Gagal");
      return;
    }

    try {
      const response = await fetch("/api/user/changePassword", {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        setIsPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        showAlert(result.message || "Gagal mengubah password.", "Gagal");
      }
    } catch (error) {
      showAlert("Terjadi kesalahan jaringan.", "Error");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto mt-10 relative">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 relative z-10">

          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-[#0B4B48]">
              <FiUser size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Informasi Pribadi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6 mb-12">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nama Lengkap</p>
              <p className="text-lg font-bold text-gray-800">{isLoading ? "Memuat..." : userData?.nama}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">NIDN</p>
              <p className="text-lg font-bold text-gray-800 tracking-wider">{isLoading ? "Memuat..." : userData?.nidn}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
              <p className="text-lg font-bold text-gray-800">{isLoading ? "Memuat..." : userData?.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Role</p>
              <p className="text-lg font-bold text-gray-800">{isLoading ? "Memuat..." : formatRoleUI(userData?.role)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal Bergabung</p>
              <p className="text-lg font-bold text-gray-800">{isLoading ? "Memuat..." : userData?.tanggal_bergabung}</p>
            </div>
          </div>

          <hr className="border-gray-100 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center text-gray-400">
                <FiLock size={24} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">Password</p>
                <p className="text-xs text-gray-400">Disarankan untuk diperbarui secara berkala</p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="ml-4 text-[#0B4B48] text-sm font-bold hover:underline"
              >
                Ubah Password
              </button>
            </div>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="bg-[#0B4B48] hover:bg-[#083634] text-white px-12 py-3 rounded-2xl font-bold transition-all shadow-md"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Modal Ubah Password */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-125 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubah Password</h2>
              <p className="text-sm text-gray-600">Demi keamanan akun Anda, harap lakukan pembaruan password secara berkala.</p>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">Password Saat Ini</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Masukan password saat ini"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 text-gray-800 focus:border-[#0B4B48] focus:ring-1 focus:ring-[#0B4B48] outline-none transition-all placeholder:text-gray-400"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrentPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Buat password baru"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 text-gray-800 focus:border-[#0B4B48] focus:ring-1 focus:ring-[#0B4B48] outline-none transition-all placeholder:text-gray-400"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                    </button>
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">Min 8 Karakter</p>
                </div>
                <div>
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 text-gray-800 focus:border-[#0B4B48] focus:ring-1 focus:ring-[#0B4B48] outline-none transition-all placeholder:text-gray-400"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-[#EBEBEB] p-6 flex justify-end gap-3 rounded-b-3xl">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-white text-gray-600 font-medium shadow-sm hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#0B4B48] text-white font-medium shadow-sm hover:bg-[#083634] transition-colors">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Logout */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-[420px] shadow-2xl text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-24 h-24 bg-[#FFEAEA] rounded-[28px] flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#D32F2F] ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Apakah Anda yakin ingin Keluar?</h2>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed px-2">
              Pastikan semua perubahan telah disimpan sebelum melanjutkan.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setIsLogoutModalOpen(false)} className="px-10 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors w-full">
                Batal
              </button>
              <button onClick={handleLogout} className="px-10 py-3 rounded-2xl bg-[#CC0000] text-white font-bold hover:bg-[#A30000] transition-colors w-full shadow-md shadow-red-500/20">
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 ALERT MODAL (PENGGANTI alert) */}
      {alertModal.show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-[400px] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#FFF3E0] rounded-full flex items-center justify-center flex-shrink-0">
                <FiAlertCircle className="text-[#E65100] text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{alertModal.title || "Perhatian"}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{alertModal.message}</p>
              </div>
              <button 
                onClick={() => setAlertModal({ show: false, message: "", title: "" })}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setAlertModal({ show: false, message: "", title: "" })}
                className="px-8 py-2.5 rounded-xl bg-[#0B4B48] text-white font-medium hover:bg-[#083634] transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Success */}
      {showSuccessToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-70 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#0B4B48] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <FiCheckCircle className="text-[#27AE60]" size={20} />
            <span className="text-sm font-medium">Password berhasil diperbarui!</span>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Profile;