// src/pages/context/Login.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import { useAuth } from "./AuthContext";
import bgLogin from "../../assets/img/background.jpg";
import logoUika from "../../assets/img/Logo.jpg";
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  login as loginRequest,
} from "../../services/auth.api";

const getDashboardByRole = (role) => {
  const normalizedRole = String(role || "").toLowerCase().trim();

  if (["admin", "admin_sistem"].includes(normalizedRole)) {
    return "/admin/dashboard";
  }

  if (["operator", "operator_data"].includes(normalizedRole)) {
    return "/operator/dashboard";
  }

  if (normalizedRole === "rektor") {
    return "/rektor/dashboard";
  }

  return "/verifikator/dashboard";
};

const Login = () => {
  const navigate = useNavigate();

  const {
    login,
    user,
    loading: authLoading = false,
  } = useAuth();

  const [checkingSession, setCheckingSession] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const token = getAuthToken();
    const storedUser = user || getStoredUser();

    if (token && storedUser?.role) {
      navigate(getDashboardByRole(storedUser.role), { replace: true });
      return;
    }

    if (token && !storedUser?.role) {
      clearAuthSession();
    }

    setCheckingSession(false);
  }, [authLoading, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password.trim()) {
      setError("Email dan password harus diisi.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginRequest({
        email: cleanEmail,
        password,
      });

      if (data.status !== "success") {
        setError(data.message || "Email atau password salah.");
        return;
      }

      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;
      const userData = data.data;

      if (!accessToken || !refreshToken || !userData) {
        setError("Response login tidak lengkap dari auth-service.");
        return;
      }

      const normalizedUser = {
        ...userData,
        role: String(userData.role || "").toLowerCase().trim(),
      };

      await login(normalizedUser, accessToken, refreshToken);

      navigate(getDashboardByRole(normalizedUser.role), {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Email atau password salah.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <FiLoader className="animate-spin text-[#0B6B63]" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-6 overflow-hidden">
      <img
        src={bgLogin}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative w-full max-w-[360px] sm:max-w-sm bg-white rounded-[28px] shadow-2xl p-6 sm:p-8 flex flex-col z-10 mx-auto">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4 shrink-0">
            <img
              src={logoUika}
              alt="Logo UIKA"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center leading-tight">
            Universitas Ibn Khaldun Bogor
          </h2>

          <p className="text-[10px] sm:text-xs text-gray-500 font-bold mt-1.5 uppercase tracking-wide text-center">
            Verifikasi & Akses Ijazah Digital
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full">
          <div className="mb-4 w-full">
            <label className="block text-xs sm:text-[13px] font-bold text-gray-700 mb-1.5">
              Email
            </label>

            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              className="appearance-none w-full px-4 py-3 sm:py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-base sm:text-sm outline-none focus:border-[#0B6B63] focus:ring-1 focus:ring-[#0B6B63] transition-all"
            />
          </div>

          <div className="mb-5 sm:mb-6 w-full">
            <label className="block text-xs sm:text-[13px] font-bold text-gray-700 mb-1.5">
              Password
            </label>

            <div className="relative flex items-center w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className="appearance-none w-full pl-4 pr-12 py-3 sm:py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-base sm:text-sm outline-none focus:border-[#0B6B63] focus:ring-1 focus:ring-[#0B6B63] transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                className="absolute right-2 p-2 cursor-pointer text-gray-400 hover:text-[#0B6B63] transition-colors flex items-center justify-center bg-transparent outline-none"
                title={
                  showPassword
                    ? "Sembunyikan Kata Sandi"
                    : "Tampilkan Kata Sandi"
                }
              >
                {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 py-2.5 px-3 rounded-lg text-xs text-center font-semibold border border-red-100 mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B6B63] hover:bg-[#08524C] disabled:opacity-70 text-white font-bold py-3.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={18} />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;