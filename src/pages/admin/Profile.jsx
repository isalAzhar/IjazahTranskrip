import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import {
  FiUser,
  FiLock,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { getMyProfile, changePassword } from "../../services/master-data.api";
import { useAuth } from "../context/AuthContext";
// ==================== FUNGSI FORMAT ROLE ====================
const formatRoleUI = (role) => {
  if (!role) return "-";
  const roleMap = {
    admin: "Admin",
    operator: "Operator",
    rektor: "Rektor",
    wakil_rektor_1: "Wakil Rektor 1",
    tu_rektorat: "TU Rektorat",
    dekan: "Dekan",
    wakil_dekan_1: "Wakil Dekan 1",
    tu_fakultas: "TU Fakultas",
  };
  return roleMap[role.toLowerCase()] || role;
};
// ============================================================

const Profile = () => {
  const { token, logout } = useAuth();

  // State Data User
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Modals
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 🔥 NEW: State untuk Pop-up Notifikasi (Toast) & Alert Modal
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [alertModal, setAlertModal] = useState({
    show: false,
    message: "",
    title: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk Form Ubah Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State untuk Toggle Visibilitas Password (Ikon Mata)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🔥 FUNGSI SHOW TOAST (Pop-up sukses/error)
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3500,
    );
  };

  // 🔥 FUNGSI SHOW ALERT MODAL (Pengganti alert())
  const showAlert = (message, title = "Perhatian") => {
    setAlertModal({ show: true, message, title });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);

        const profile = await getMyProfile();

        setUserData(profile);
      } catch (error) {
        console.error("Error fetching operator profile:", error);

        showAlert(
          error?.message || "Gagal mengambil data profile.",
          "Gagal Memuat Profile",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fungsi Logout
  const handleLogout = async () => {
    await logout();
  };

  // 🔥 FUNGSI UBAH PASSWORD (DENGAN VALIDASI & NOTIFIKASI)
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
    if (currentPassword === "") {
      showAlert("Harap masukkan password saat ini!", "Gagal");
      return;
    }
    if (newPassword === currentPassword) {
      showAlert(
        "Password baru tidak boleh sama dengan password lama!",
        "Gagal",
      );
      return;
    }

    // 🔥 SET LOADING SUBMIT
    setIsSubmitting(true);

    try {
      await changePassword({
        oldPassword: currentPassword,
        newPassword,
      });

      setIsPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      showToast("Password berhasil diperbarui!", "success");
    } catch (error) {
      showAlert(
        "Terjadi kesalahan jaringan. Silakan coba lagi.",
        "Error Jaringan",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto mt-10 relative">
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-10 relative z-10">
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-[#0B4B48]">
              <FiUser size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Informasi Pribadi
            </h2>
          </div>

          {/* Grid Informasi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6 mb-12">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Nama Lengkap
              </p>
              <p className="text-lg font-bold text-gray-800">
                {isLoading ? "Memuat..." : userData?.nama}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                NIDN
              </p>
              <p className="text-lg font-bold text-gray-800 tracking-wider">
                {isLoading ? "Memuat..." : userData?.nidn}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Email
              </p>
              <p className="text-lg font-bold text-gray-800">
                {isLoading ? "Memuat..." : userData?.email}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Role
              </p>
              <p className="text-lg font-bold text-gray-800">
                {isLoading ? "Memuat..." : formatRoleUI(userData?.role)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Tanggal Bergabung
              </p>
              <p className="text-lg font-bold text-gray-800">
                {isLoading ? "Memuat..." : userData?.tanggal_bergabung}
              </p>
            </div>
          </div>

          <hr className="border-gray-100 mb-8" />

          {/* Bagian Password & Button Logout */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center text-gray-400">
                <FiLock size={24} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">Password</p>
                <p className="text-xs text-gray-400">
                  Disarankan untuk diperbarui secara berkala
                </p>
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

      {/* ============================================================ */}
      {/* 🔥 MODAL UBAH PASSWORD (DENGAN LOADING STATE) */}
      {/* ============================================================ */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[500px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ubah Password
              </h2>
              <p className="text-sm text-gray-600">
                Demi keamanan akun Anda, harap lakukan pembaruan password secara
                berkala.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="p-8 space-y-6">
                {/* Password Saat Ini */}
                <div>
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Masukan password saat ini"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 text-gray-800 focus:border-[#0B4B48] focus:ring-1 focus:ring-[#0B4B48] outline-none transition-all placeholder:text-gray-400 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showCurrentPassword ? (
                        <FiEye size={20} />
                      ) : (
                        <FiEyeOff size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Buat password baru"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isSubmitting}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 text-gray-800 focus:border-[#0B4B48] focus:ring-1 focus:ring-[#0B4B48] outline-none transition-all placeholder:text-gray-400 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showNewPassword ? (
                        <FiEye size={20} />
                      ) : (
                        <FiEyeOff size={20} />
                      )}
                    </button>
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">
                    Min 8 Karakter
                  </p>
                </div>

                {/* Konfirmasi Password Baru */}
                <div>
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 text-gray-800 focus:border-[#0B4B48] focus:ring-1 focus:ring-[#0B4B48] outline-none transition-all placeholder:text-gray-400 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <FiEye size={20} />
                      ) : (
                        <FiEyeOff size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-[#EBEBEB] p-6 flex justify-end gap-3 rounded-b-[24px]">
                <button
                  type="button"
                  onClick={() => {
                    if (!isSubmitting) setIsPasswordModalOpen(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white text-gray-600 font-medium shadow-sm hover:bg-gray-50 transition-colors focus:outline-none disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0B4B48] text-white font-medium shadow-sm hover:bg-[#083634] transition-colors focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 🔥 MODAL KONFIRMASI LOGOUT (TETAP SAMA) */}
      {/* ============================================================ */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-[420px] shadow-2xl text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-24 h-24 bg-[#FFEAEA] rounded-[28px] flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-[#D32F2F] ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Apakah Anda yakin ingin Keluar?
            </h2>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed px-2">
              Apakah Anda yakin ingin keluar dari sistem? Pastikan semua
              perubahan telah disimpan sebelum melanjutkan.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-10 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors w-full focus:outline-none"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-10 py-3 rounded-2xl bg-[#CC0000] text-white font-bold hover:bg-[#A30000] transition-colors w-full shadow-md shadow-red-500/20 focus:outline-none"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 🔥 ALERT MODAL (PENGGANTI alert()) */}
      {/* ============================================================ */}
      {alertModal.show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-[400px] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#FFF3E0] rounded-full flex items-center justify-center flex-shrink-0">
                <FiAlertCircle className="text-[#E65100] text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {alertModal.title || "Perhatian"}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {alertModal.message}
                </p>
              </div>
              <button
                onClick={() =>
                  setAlertModal({ show: false, message: "", title: "" })
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() =>
                  setAlertModal({ show: false, message: "", title: "" })
                }
                className="px-8 py-2.5 rounded-xl bg-[#0B4B48] text-white font-medium hover:bg-[#083634] transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 🔥 TOAST NOTIFICATION (POP-UP SUKSES/GAGAL) */}
      {/* ============================================================ */}
      {toast.show && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div
            className={`px-6 py-3 rounded-full shadow-lg flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-[#0B4B48] text-white"
                : "bg-[#CC0000] text-white"
            }`}
          >
            {toast.type === "success" ? (
              <FiCheckCircle className="text-[#27AE60]" size={20} />
            ) : (
              <FiAlertCircle className="text-white" size={20} />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Profile;
