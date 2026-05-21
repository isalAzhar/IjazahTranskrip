// src/components/ui/DashboardLayout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../pages/context/AuthContext";
import Navbar from "./Navbar";

const DashboardLayout = ({ children, title, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const token = localStorage.getItem("authToken");

  // Cek autentikasi
  useEffect(() => {
    if (!loading && !user && !token) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, token, navigate]);

  // Cek autorisasi berdasarkan role
  useEffect(() => {
    if (!loading && user && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Jika role tidak diizinkan, redirect ke dashboard sesuai role
        const role = user.role;
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
          target = "/login";
        }
        
        navigate(target, { replace: true });
      }
    }
  }, [loading, user, allowedRoles, navigate]);

  // Set judul halaman
  useEffect(() => {
    if (title) {
      document.title = `${title} | UIKA Ijazah Digital`;
    }
  }, [title]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user && !token) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      
      <main className="w-full px-4 md:px-8 py-6">
        <div className="w-full max-w-400 mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;