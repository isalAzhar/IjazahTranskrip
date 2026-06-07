// src/components/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../pages/context/AuthContext";

const ADMIN_ROLES = ["admin", "admin_sistem"];
const OPERATOR_ROLES = ["operator", "operator_data"];
const VERIFIKATOR_ROLES = [
  "tu_fakultas", "wakil_dekan", "wakil_dekan_1", "dekan",
  "tu_rektorat", "wakil_rektor", "wakil_rektor_1",
];

const ProtectedRoute = ({ children, allowedGroup }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ✅ LAYER 1: Cek token sinkron — eksekusi SEBELUM React render apapun
  const localToken = localStorage.getItem("authToken");
  const localUserRaw = localStorage.getItem("user");

  if (!localToken || !localUserRaw || localUserRaw === "undefined" || localUserRaw === "null") {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ✅ LAYER 2: Parse user dari localStorage sinkron
  // Ini mencegah celah saat Context masih loading tapi token sudah ada
  let localUser = null;
  try {
    localUser = JSON.parse(localUserRaw);
  } catch {
    // Data korup → tendang ke login
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  if (!localUser || !localUser.role) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  // ✅ LAYER 3: Validasi role dari localStorage (sinkron, tidak tunggu Context)
  const localRole = localUser.role?.toLowerCase() || "";

  if (allowedGroup === "ADMIN" && !ADMIN_ROLES.includes(localRole)) {
    return <Navigate to="/login" replace />;
  }
  if (allowedGroup === "OPERATOR" && !OPERATOR_ROLES.includes(localRole)) {
    return <Navigate to="/login" replace />;
  }
  if (allowedGroup === "VERIFIKATOR" && !VERIFIKATOR_ROLES.includes(localRole)) {
    return <Navigate to="/login" replace />;
  }
  if (allowedGroup === "REKTOR" && localRole !== "rektor") {
    return <Navigate to="/login" replace />;
  }

  // ✅ LAYER 4: Listener jika user hapus token manual via DevTools
  useEffect(() => {
    const handleStorageChange = () => {
      if (!localStorage.getItem("authToken")) {
        window.location.replace("/login");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ LAYER 5: Tunggu Context selesai load (sudah pasti lolos token & role di atas)
  if (loading) {
    return (
      <div className="h-screen w-screen fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#117065]" />
      </div>
    );
  }

  // ✅ LAYER 6: Double-check dari Context state (setelah loading selesai)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;