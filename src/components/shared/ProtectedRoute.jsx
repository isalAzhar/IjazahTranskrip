import React from "react";
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

  // ✅ Cek token SINKRON — tangkap copy-paste URL & back setelah logout
  const localToken = localStorage.getItem("authToken");
  if (!localToken) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#117065]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role?.toLowerCase() || "";

  if (allowedGroup === "ADMIN" && !ADMIN_ROLES.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedGroup === "OPERATOR" && !OPERATOR_ROLES.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedGroup === "VERIFIKATOR" && !VERIFIKATOR_ROLES.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedGroup === "REKTOR" && userRole !== "rektor") {
    return <Navigate to="/dashboard" replace />;
  }

  // allowedGroup === "ALL" → lolos semua role yang sudah login
  return children;
};

export default ProtectedRoute;