import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../pages/context/AuthContext";
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
} from "../../services/auth.api";

const ADMIN_ROLES = ["admin", "admin_sistem"];

const OPERATOR_ROLES = ["operator", "operator_data"];

const VERIFIKATOR_ROLES = [
  "tu_fakultas",
  "wakil_dekan",
  "wakil_dekan_1",
  "dekan",
  "tu_rektorat",
  "wakil_rektor",
  "wakil_rektor_1",
];

const REKTOR_ROLES = ["rektor"];

const ROLE_GROUPS = {
  ADMIN: ADMIN_ROLES,
  OPERATOR: OPERATOR_ROLES,
  VERIFIKATOR: VERIFIKATOR_ROLES,
  REKTOR: REKTOR_ROLES,
  ALL: [
    ...ADMIN_ROLES,
    ...OPERATOR_ROLES,
    ...VERIFIKATOR_ROLES,
    ...REKTOR_ROLES,
  ],
};

const getDashboardByRole = (role) => {
  const normalizedRole = String(role || "").toLowerCase().trim();

  if (ADMIN_ROLES.includes(normalizedRole)) {
    return "/admin/dashboard";
  }

  if (OPERATOR_ROLES.includes(normalizedRole)) {
    return "/operator/dashboard";
  }

  if (REKTOR_ROLES.includes(normalizedRole)) {
    return "/rektor/dashboard";
  }

  return "/verifikator/dashboard";
};

const ProtectedRoute = ({ children, allowedGroup = "ALL" }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#117065]" />
      </div>
    );
  }

  const token = getAuthToken();
  const storedUser = user || getStoredUser();

  if (!token || !storedUser?.role) {
    clearAuthSession();

    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  const userRole = String(storedUser.role || "").toLowerCase().trim();

  const allowedRoles = ROLE_GROUPS[allowedGroup] || ROLE_GROUPS.ALL;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={getDashboardByRole(userRole)} replace />;
  }

  return children;
};

export default ProtectedRoute;