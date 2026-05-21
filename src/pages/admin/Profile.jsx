import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiUser, FiLock, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Konfirmasi kata sandi tidak cocok!");
      return;
    }
    if (newPassword.length < 8) {
      alert("Kata sandi baru minimal 8 karakter!");
      return;
    }
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
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
              <p className="text-lg font-bold text-gray-800">Mamat sudrajat</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">NIDN</p>
              <p className="text-lg font-bold text-gray-800 tracking-wider">12345678912345</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
              <p className="text-lg font-bold text-gray-800">adminsistem@gmail.com</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Role</p>
              <p className="text-lg font-bold text-gray-800">Admin Sistem</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal Bergabung</p>
              <p className="text-lg font-bold text-gray-800">15 Desember 2015</p>
            </div>
          </div>

          <hr className="border-gray-100 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center text-gray-400">
                <FiLock size={24} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">Kata Sandi</p>
                <p className="text-xs text-gray-400">Terakhir diubah 5 bulan yang lalu</p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="ml-4 text-[#0B4B48] text-sm font-bold hover:underline"
              >
                Ubah Sandi
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

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-125 overflow-hidden shadow-2xl">
            <div className="p-8 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubah Kata Sandi</h2>
              <p className="text-sm text-gray-600">Demi keamanan akun Anda, harap lakukan pembaruan kata sandi secara berkala.</p>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">Kata Sandi Saat Ini</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Masukan kata sandi saat ini"
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
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Buat kata sandi baru"
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
                  <label className="block text-[15px] font-bold text-gray-900 mb-2">Konfirmasi Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Ulangi kata sandi baru"
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

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-4xl p-8 w-full max-w-105 shadow-2xl text-center">
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

      {showSuccessToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-70">
          <div className="bg-[#0B4B48] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <FiCheckCircle className="text-[#27AE60]" size={20} />
            <span className="text-sm font-medium">Kata sandi berhasil diperbarui!</span>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Profile;