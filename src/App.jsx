// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./pages/context/AuthContext";
import Login from "./pages/context/login";

// ============================================================
// IMPORT PAGES DARI FOLDER ADMIN (Untuk admin_sistem)
// ============================================================
import AdminDashboard from "./pages/admin/Dashboard";
import Template from "./pages/admin/Template";
import DataMahasiswa from "./pages/admin/DataMahasiswa";
import DetailBatch from "./pages/admin/DetailBatch";
import DetailMahasiswa from "./pages/admin/DetailMahasiswa";
import DaftarUnit from "./pages/admin/DaftarUnit";
import DaftarPengguna from "./pages/admin/DaftarPengguna";
import AdminProfile from "./pages/admin/Profile";

// ============================================================
// IMPORT PAGES DARI FOLDER OPERATOR
// ============================================================
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import OperatorProfile from "./pages/operator/Profile";

// ============================================================
// IMPORT PAGES DARI FOLDER VERIFIKATOR
// ============================================================
import VerifikatorDashboard from "./pages/verifikator/VerifikatorDashboard";
import VerifikatorProfile from "./pages/verifikator/Profile";

// ============================================================
// IMPORT PAGES DARI FOLDER REKTOR
// ============================================================
import RektorDashboard from "./pages/rektor/RektorDashboard";
import RektorProfile from "./pages/rektor/Profile";

// ============================================================
// IMPORT DARI FOLDER IJAZAH (Components)
// ============================================================
import IjazahTerbit from "./components/ijazah/IjazahTerbit";
import IjazahProses from "./components/ijazah/IjazahProses";
import IjazahReject from "./components/ijazah/IjazahReject";
import IjazahRevoke from "./components/ijazah/IjazahRevoke";

// ============================================================
// IMPORT DARI FOLDER BATCH (Components)
// ============================================================
import BatchTerbit from "./components/batch/BatchTerbit";
import BatchProses from "./components/batch/BatchProses";
import BatchReject from "./components/batch/BatchReject";
import BatchRevoke from "./components/batch/BatchRevoke";

// ============================================================
// DEFINE ROLES
// ============================================================
const ADMIN_ROLES = ["admin_sistem"];
const OPERATOR_ROLES = ["operator"];
const VERIFIKATOR_ROLES = ["verifikator"];
const REKTOR_ROLES = ["rektor"];

// SEMUA ROLE YANG ADA DI SISTEM (UNTUK AKSES UMUM)
const ALL_ROLES = [...ADMIN_ROLES, ...OPERATOR_ROLES, ...VERIFIKATOR_ROLES, ...REKTOR_ROLES];

// ============================================================
// PROTECTED ROUTE COMPONENT
// ============================================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// ============================================================
// REDIRECT BERDASARKAN ROLE (SETELAH LOGIN)
// ============================================================
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Redirect berdasarkan role
  const redirectMap = {
    admin_sistem: "/admin/dashboard",
    operator: "/operator/dashboard",
    verifikator: "/verifikator/dashboard",
    rektor: "/rektor/dashboard",
  };

  const target = redirectMap[user.role];
  if (target) {
    return <Navigate to={target} replace />;
  }

  return <Navigate to="/login" replace />;
};

// ============================================================
// MAIN APP COMPONENT
// ============================================================
function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* PUBLIC ROUTE */}
          <Route path="/login" element={<Login />} />

          {/* DASHBOARD ROUTES - Sesuai dengan masing-masing role */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/operator/dashboard" 
            element={
              <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
                <OperatorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/verifikator/dashboard" 
            element={
              <ProtectedRoute allowedRoles={VERIFIKATOR_ROLES}>
                <VerifikatorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/rektor/dashboard" 
            element={
              <ProtectedRoute allowedRoles={REKTOR_ROLES}>
                <RektorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* PROFILE ROUTES - Masing-masing role punya profile sendiri */}
          <Route 
            path="/admin/profile" 
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <AdminProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/operator/profile" 
            element={
              <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
                <OperatorProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/verifikator/profile" 
            element={
              <ProtectedRoute allowedRoles={VERIFIKATOR_ROLES}>
                <VerifikatorProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/rektor/profile" 
            element={
              <ProtectedRoute allowedRoles={REKTOR_ROLES}>
                <RektorProfile />
              </ProtectedRoute>
            } 
          />

          {/* FITUR IJAZAH - Dapat diakses oleh semua role */}
          <Route 
            path="/ijazah-terbit" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <IjazahTerbit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ijazah-proses" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <IjazahProses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ijazah-reject" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <IjazahReject />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ijazah-revoke" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <IjazahRevoke />
              </ProtectedRoute>
            } 
          />
          
          {/* FITUR BATCH - Dapat diakses oleh semua role */}
          <Route 
            path="/batch-terbit/:id" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <BatchTerbit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/batch-proses/:id" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <BatchProses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/batch-reject/:id" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <BatchReject />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/batch-revoke/:id" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <BatchRevoke />
              </ProtectedRoute>
            } 
          />

          {/* FITUR UMUM LAINNYA - Dapat diakses oleh semua role */}
          <Route 
            path="/template" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <Template />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/data-mahasiswa" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <DataMahasiswa />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/detail-batch/:id" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <DetailBatch />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/detail-mahasiswa/:nim" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <DetailMahasiswa />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/daftar-unit" 
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <DaftarUnit />
              </ProtectedRoute>
            } 
          />
          
          {/* KHUSUS ADMIN_SISTEM SAJA */}
          <Route 
            path="/daftar-pengguna" 
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <DaftarPengguna />
              </ProtectedRoute>
            } 
          />
          
          {/* REDIRECTS */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;