// src/pages/context/login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import bgLogin from "../../assets/img/background.jpg";
import logoUika from "../../assets/img/Logo.jpg";

// DATA STATIS UNTUK LOGIN (Hardcoded accounts)
// Role yang tersedia: admin_sistem, operator, verifikator, rektor
const STATIC_USERS = [
  {
    id: 1,
    email: "admin@uika.ac.id",
    password: "admin123",
    name: "Admin Sistem",
    role: "admin_sistem",
    original_role: "admin_sistem"
  },
  {
    id: 2,
    email: "operator@uika.ac.id",
    password: "operator123",
    name: "Operator",
    role: "operator",
    original_role: "operator"
  },
  {
    id: 3,
    email: "tu_fakultas@uika.ac.id",
    password: "tufak123",
    name: "TU Fakultas",
    role: "verifikator",
    original_role: "tu_fakultas"
  },
  {
    id: 4,
    email: "wakil_dekan@uika.ac.id",
    password: "wakildekan123",
    name: "Wakil Dekan 1",
    role: "verifikator",
    original_role: "wakil_dekan"
  },
  {
    id: 5,
    email: "dekan@uika.ac.id",
    password: "dekan123",
    name: "Dekan",
    role: "verifikator",
    original_role: "dekan"
  },
  {
    id: 6,
    email: "tu_rektorat@uika.ac.id",
    password: "turek123",
    name: "TU Rektorat",
    role: "verifikator",
    original_role: "tu_rektorat"
  },
  {
    id: 7,
    email: "wakil_rektor@uika.ac.id",
    password: "wakil123",
    name: "Wakil Rektor 1",
    role: "verifikator",
    original_role: "wakil_rektor"
  },
  {
    id: 8,
    email: "rektor@uika.ac.id",
    password: "rektor123",
    name: "Rektor",
    role: "rektor",
    original_role: "rektor"
  }
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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
    
    // SIMULASI DELAY (seperti koneksi ke server)
    setTimeout(() => {
      try {
        // LOGIN MENGGUNAKAN DATA STATIS
        const foundUser = STATIC_USERS.find(
          user => user.email === email && user.password === password
        );

        if (foundUser) {
          // Buat token dummy
          const dummyToken = `dummy_token_${foundUser.id}_${Date.now()}`;
          
          // Data user yang akan disimpan
          const userData = {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role,
            original_role: foundUser.original_role || foundUser.role
          };
          
          // Simpan ke localStorage sebagai backup
          localStorage.setItem("authToken", dummyToken);
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("role", foundUser.role);
          localStorage.setItem("original_role", foundUser.original_role || foundUser.role);
          localStorage.setItem("name", foundUser.name);
          localStorage.setItem("email", foundUser.email);
          
          // Panggil fungsi login dari AuthContext
          login(userData, dummyToken);
          
          const role = foundUser.role;
          console.log("Login successful!");
          console.log("Role:", role);
          console.log("Name:", foundUser.name);
          console.log("Original Role:", foundUser.original_role || foundUser.role);

          // PENGALIHAN BERDASARKAN ROLE
          let target = "/";
          
          if (role === "admin_sistem") {
            target = "/admin/dashboard";
          } else if (role === "operator") {
            target = "/operator/dashboard";
          } else if (role === "verifikator") {
            target = "/verifikator/dashboard";
          } else if (role === "rektor") {
            target = "/rektor/dashboard";
          } else {
            target = "/dashboard";
          }

          navigate(target, { replace: true });
        } else {
          setError("Email atau password salah");
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("Terjadi kesalahan saat login");
      } finally {
        setLoading(false);
      }
    }, 800); // Simulasi delay loading
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
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 border border-gray-100 text-sm outline-none focus:border-[#0d6b5e] transition-all"
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-[#0d6b5e] transition-colors"
              >
                {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
              </div>
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