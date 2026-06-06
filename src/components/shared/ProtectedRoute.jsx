import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../pages/context/AuthContext";

const ProtectedRoute = ({ children, allowedGroup }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 🔥 LAPISAN KEAMANAN SINKRON: Cek Token Langsung
  // Ini membunuh waktu tunggu React rendering jika user menekan back
  const localToken = localStorage.getItem("authToken");
  if (!localToken) {
    return <Navigate to="/login" replace />;
  }

  // Tampilkan loading saat state dari Context sedang disiapkan
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#117065]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

 // ... (Sisa kode di atasnya tetap sama)

  // 3. Pengecekan Role berdasarkan Grup
  const userRole = user?.role?.toLowerCase() || "";
  
  // Gabungkan semua role verifikator sesuai rule terbaru
  const ALL_VERIFIKATOR_ROLES = [
    "tu_fakultas", "wakil_dekan", "wakil_dekan_1", "dekan",
    "tu_rektorat", "wakil_rektor", "wakil_rektor_1"
  ];

  // Validasi akses Verifikator (Fakultas & TU Rektorat/Warek)
  if (allowedGroup === "VERIFIKATOR" && !ALL_VERIFIKATOR_ROLES.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Validasi akses Rektor (Eksklusif hanya untuk Rektor)
  if (allowedGroup === "REKTOR" && userRole !== "rektor") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;