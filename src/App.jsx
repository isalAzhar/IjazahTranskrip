// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./pages/context/AuthContext";

// Public
import Login from "./pages/context/login";

// Shared
import Template from "./pages/admin/Template";
import DataMahasiswa from "./pages/admin/DataMahasiswa";
import DetailBatch from "./pages/admin/DetailBatch";
import DetailMahasiswa from "./pages/admin/DetailMahasiswa";
import DaftarUnit from "./pages/admin/DaftarUnit";
import DaftarPengguna from "./pages/admin/DaftarPengguna";
import Profile from "./pages/admin/Profile";
  
// Ijazah & Batch Components
import IjazahTerbit from "./components/ijazah/IjazahTerbit";
import IjazahProses from "./components/ijazah/IjazahProses";
import IjazahReject from "./components/ijazah/IjazahReject";
import IjazahRevoke from "./components/ijazah/IjazahRevoke";
import BatchTerbit from "./components/batch/BatchTerbit";
import BatchProses from "./components/batch/BatchProses";
import BatchReject from "./components/batch/BatchReject";
import BatchRevoke from "./components/batch/BatchRevoke";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";

// Operator
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import ManajemenData from "./pages/operator/ManajemenData";
import Pelaporan from "./pages/operator/Pelaporan";
import OperatorProfile from "./pages/operator/OperatorProfile";
import DokumenValid from "./pages/operator/DokumenValid";
import DetailMahasiswaOperator from "./pages/operator/DetailMahasiswaOperator";
import IjazahDigital from "./pages/operator/IjazahDigital";
import DetailPelaporan from "./pages/operator/DetailPelaporan";
import DetailBatchDokumenValid from "./pages/operator/DetailBatchDokumenValid";
import DetailDokumenValid from "./pages/operator/DetailDokumenValid";

// Verifikator & Rektor
import VerifikatorDashboard from "./pages/verifikator/VerifikatorDashboard";
import RektorDashboard from "./pages/rektor/RektorDashboard";
import VerifikatorProfile from "./pages/verifikator/Profile";
import RektorProfile from "./pages/rektor/Profile";

// Roles (🔥 UPDATE: Menambahkan "admin" agar sinkron dengan API Backend)
const ALL_ROLES = ["admin", "admin_sistem", "operator", "verifikator", "rektor"];
const OPERATOR_ROLES = ["operator"];
const ADMIN_ROLES = ["admin", "admin_sistem"];
const VERIFIKATOR_ROLES = ["verifikator"];
const REKTOR_ROLES = ["rektor"];

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  // 🔥 UPDATE: Menambahkan mapping untuk role "admin" ke "/admin/dashboard"
  const redirectMap = { 
    admin: "/admin/dashboard",
    admin_sistem: "/admin/dashboard", 
    operator: "/operator/dashboard", 
    verifikator: "/verifikator/dashboard", 
    rektor: "/rektor/dashboard" 
  };
  
  return <Navigate to={redirectMap[user.role] || "/login"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><Profile /></ProtectedRoute>} />
          <Route path="/admin/template" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><Template /></ProtectedRoute>} />
          <Route path="/admin/data-mahasiswa" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><DataMahasiswa /></ProtectedRoute>} />
          <Route path="/admin/daftar-unit" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><DaftarUnit /></ProtectedRoute>} />
          <Route path="/admin/daftar-pengguna" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><DaftarPengguna /></ProtectedRoute>} />
          <Route path="/admin/detail-batch/:id" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><DetailBatch /></ProtectedRoute>} />
          <Route path="/admin/detail-mahasiswa/:nim" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><DetailMahasiswa /></ProtectedRoute>} />

          {/* OPERATOR ROUTES */}
          <Route path="/operator/dashboard" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><OperatorDashboard /></ProtectedRoute>} />
          <Route path="/operator/profile" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><OperatorProfile /></ProtectedRoute>} />
          <Route path="/operator/upload-data" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><ManajemenData /></ProtectedRoute>} />
          <Route path="/operator/pelaporan" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><Pelaporan /></ProtectedRoute>} />
          <Route path="/operator/detail-pelaporan/:nim" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><DetailPelaporan /></ProtectedRoute>} />
          <Route path="/operator/dokumen-valid" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><DokumenValid /></ProtectedRoute>} />
          <Route path="/operator/dokumen-valid/batch/:batchId" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><DetailBatchDokumenValid /></ProtectedRoute>} />
          <Route path="/operator/detail-dokumen-valid/:nim" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><DetailDokumenValid /></ProtectedRoute>} />
          <Route path="/operator/ijazah-digital/:nim" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><IjazahDigital /></ProtectedRoute>} />
          <Route path="/operator/detail-mahasiswa/:nim" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><DetailMahasiswaOperator /></ProtectedRoute>} />
          <Route path="/operator/batch/terbit/:id" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><BatchTerbit /></ProtectedRoute>} />
          <Route path="/operator/batch/proses/:id" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><BatchProses /></ProtectedRoute>} />
          <Route path="/operator/batch/reject/:id" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><BatchReject /></ProtectedRoute>} />
          <Route path="/operator/batch/revoke/:id" element={<ProtectedRoute allowedRoles={OPERATOR_ROLES}><BatchRevoke /></ProtectedRoute>} />

          {/* VERIFIKATOR & REKTOR ROUTES */}
          <Route path="/verifikator/dashboard" element={<ProtectedRoute allowedRoles={VERIFIKATOR_ROLES}><VerifikatorDashboard /></ProtectedRoute>} />
          <Route path="/verifikator/profile" element={<ProtectedRoute allowedRoles={VERIFIKATOR_ROLES}><VerifikatorProfile /></ProtectedRoute>} />
          <Route path="/rektor/dashboard" element={<ProtectedRoute allowedRoles={REKTOR_ROLES}><RektorDashboard /></ProtectedRoute>} />
          <Route path="/rektor/profile" element={<ProtectedRoute allowedRoles={REKTOR_ROLES}><RektorProfile /></ProtectedRoute>} />

          {/* SHARED ROUTES */}
          <Route path="/detail-mahasiswa/:nim" element={<ProtectedRoute allowedRoles={ALL_ROLES}><DetailMahasiswa /></ProtectedRoute>} />
          <Route path="/ijazah/terbit" element={<ProtectedRoute allowedRoles={ALL_ROLES}><IjazahTerbit /></ProtectedRoute>} />
          <Route path="/ijazah/proses" element={<ProtectedRoute allowedRoles={ALL_ROLES}><IjazahProses /></ProtectedRoute>} />
          <Route path="/ijazah/reject" element={<ProtectedRoute allowedRoles={ALL_ROLES}><IjazahReject /></ProtectedRoute>} />
          <Route path="/ijazah/revoke" element={<ProtectedRoute allowedRoles={ALL_ROLES}><IjazahRevoke /></ProtectedRoute>} />
          <Route path="/ijazah-digital/:nim" element={<ProtectedRoute allowedRoles={ALL_ROLES}><IjazahDigital /></ProtectedRoute>} />
          <Route path="/batch/terbit/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><BatchTerbit /></ProtectedRoute>} />
          <Route path="/batch/proses/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><BatchProses /></ProtectedRoute>} />
          <Route path="/batch/reject/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><BatchReject /></ProtectedRoute>} />
          <Route path="/batch/revoke/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><BatchRevoke /></ProtectedRoute>} />

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