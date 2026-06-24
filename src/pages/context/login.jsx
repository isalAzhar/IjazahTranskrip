// Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import bgLogin from "../../assets/img/background.jpg";
import logoUika from "../../assets/img/Logo.jpg";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate(-1, { replace: true });
    }
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan password harus diisi");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/auth/login` 
        : "/api/auth/login";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error("Gagal menerjemahkan JSON. Balasan server: " + responseText.substring(0, 50));
      }

      if (response.ok && data.status === "success") {
        if (data.data && data.data.role) {
          data.data.role = data.data.role.toLowerCase().trim();
        }

        const accessToken = data.access_token;
        const userData = data.data;

        await login(userData, accessToken);

        const role = userData.role;
        let target = "/dashboard";

        if (["admin", "admin_sistem"].includes(role)) {
          target = "/admin/dashboard";
        } else if (["operator", "operator_data"].includes(role)) {
          target = "/operator/dashboard";
        } else if (role === "rektor") {
          target = "/rektor/dashboard";
        } else {
          target = "/verifikator/dashboard";
        }

        navigate(target, { replace: true });
      } else {
        setError(data.message || "Email atau password salah");
      }
    } catch (err) {
      setError("CRASH: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-6 overflow-hidden">
      <img src={bgLogin} alt="background" className="absolute inset-0 w-full h-full object-cover" />
      {/* Kontras disesuaikan: lebih terang seperti kode pertama */}
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative w-full max-w-[360px] sm:max-w-sm bg-white rounded-[28px] shadow-2xl p-6 sm:p-8 flex flex-col z-10 mx-auto">
        
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4 shrink-0">
            <img src={logoUika} alt="Logo UIKA" className="w-full h-full object-contain" />
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
                className="appearance-none w-full pl-4 pr-12 py-3 sm:py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-base sm:text-sm outline-none focus:border-[#0B6B63] focus:ring-1 focus:ring-[#0B6B63] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 p-2 cursor-pointer text-gray-400 hover:text-[#0B6B63] transition-colors flex items-center justify-center bg-transparent outline-none"
                title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
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
            {loading ? <FiLoader className="animate-spin" size={18} /> : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;