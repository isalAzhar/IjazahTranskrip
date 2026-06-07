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
      const response = await fetch("api/auth/login", {
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
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative w-full max-w-90 bg-white rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.25)] p-7 sm:p-9 flex flex-col">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mb-3">
            <img src={logoUika} alt="Logo UIKA" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-[17px] sm:text-xl font-bold text-gray-800 text-center">
            Universitas Ibn Khaldun Bogor
          </h2>
          <p className="text-[10px] sm:text-xs text-gray-400 font-bold mt-1 uppercase tracking-wide text-center">
            Verifikasi & Akses Ijazah Digital
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[13px] font-bold text-gray-600">Email</label>
            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm outline-none focus:border-[#0d6b5e] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-bold text-gray-600">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                // ✅ Matikan icon mata bawaan semua browser
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 border border-gray-100 text-sm outline-none focus:border-[#0d6b5e] transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-textfield-decoration-container]:hidden"
              />
             <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-[#0d6b5e] transition-colors"
              title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
            >
              {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
            </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 py-2 px-3 rounded-lg text-[11px] text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0d6b5e] hover:bg-[#0a5248] disabled:opacity-70 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <FiLoader className="animate-spin" size={18} /> : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;