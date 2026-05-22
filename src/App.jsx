// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./pages/context/AuthContext";

// ── Public ──────────────────────────────────────────────────────────────────
import Login from "./pages/context/login";

// ── Shared / Umum ────────────────────────────────────────────────────────────
import Template        from "./pages/admin/Template";
import DataMahasiswa   from "./pages/admin/DataMahasiswa";
import DetailBatch     from "./pages/admin/DetailBatch";
import DetailMahasiswa from "./pages/admin/DetailMahasiswa";
import DaftarUnit      from "./pages/admin/DaftarUnit";
import DaftarPengguna  from "./pages/admin/DaftarPengguna";
import Profile         from "./pages/admin/Profile";

// ── Ijazah ───────────────────────────────────────────────────────────────────
import IjazahTerbit from "./components/ijazah/IjazahTerbit";
import IjazahProses from "./components/ijazah/IjazahProses";
import IjazahReject from "./components/ijazah/IjazahReject";
import IjazahRevoke from "./components/ijazah/IjazahRevoke";

// ── Batch ─────────────────────────────────────────────────────────────────────
import BatchTerbit from "./components/batch/BatchTerbit";
import BatchProses from "./components/batch/BatchProses";
import BatchReject from "./components/batch/BatchReject";
import BatchRevoke from "./components/batch/BatchRevoke";

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminDashboard from "./pages/admin/Dashboard";

// ── Operator ─────────────────────────────────────────────────────────────────
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import ManajemenData     from "./pages/operator/ManajemenData";
import Pelaporan         from "./pages/operator/Pelaporan";
import OperatorProfile   from "./pages/operator/OperatorProfile";
import DokumenValid      from "./pages/operator/DokumenValid";
import DetailMahasiswaOperator from "./pages/operator/DetailMahasiswaOperator";

// ── Operator Detail Pages ─────────────────────────────────────────────────────
import DetailPelaporan from "./pages/operator/DetailPelaporan";
import DetailBatchDokumenValid from "./pages/operator/DetailBatchDokumenValid";
import DetailDokumenValid from "./pages/operator/DetailDokumenValid";

// ── Verifikator & Rektor ──────────────────────────────────────────────────────
import VerifikatorDashboard from "./pages/verifikator/VerifikatorDashboard";
import RektorDashboard      from "./pages/rektor/RektorDashboard";
import VerifikatorProfile   from "./pages/verifikator/Profile";
import RektorProfile        from "./pages/rektor/Profile";

// ── Roles Definition ─────────────────────────────────────────────────────────
const ALL_ROLES      = ["admin_sistem", "operator", "verifikator", "rektor"];
const OPERATOR_ROLES = ["operator"];
const ADMIN_ROLES    = ["admin_sistem"];
const VERIFIKATOR_ROLES = ["verifikator"];
const REKTOR_ROLES = ["rektor"];

// ── Protected Route ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles?.length && !allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" replace />;

  return children;
};

// ── Role-based Redirect ───────────────────────────────────────────────────────
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)   return <Navigate to="/login" replace />;

  const redirectMap = {
    admin_sistem: "/admin/dashboard",
    operator:     "/operator/dashboard",
    verifikator:  "/verifikator/dashboard",
    rektor:       "/rektor/dashboard",
  };

  const target = redirectMap[user.role];
  return target ? <Navigate to={target} replace /> : <Navigate to="/login" replace />;
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>

          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* ============================================================ */}
          {/* ADMIN ROUTES - prefix /admin */}
          {/* ============================================================ */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/template" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <Template />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/data-mahasiswa" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <DataMahasiswa />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/daftar-unit" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <DaftarUnit />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/daftar-pengguna" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <DaftarPengguna />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/detail-batch/:id" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <DetailBatch />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/detail-mahasiswa/:nim" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <DetailMahasiswa />
            </ProtectedRoute>
          } />

          {/* ============================================================ */}
          {/* OPERATOR ROUTES - prefix /operator */}
          {/* ============================================================ */}
          <Route path="/operator/dashboard" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <OperatorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/operator/profile" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <OperatorProfile />
            </ProtectedRoute>
          } />

          <Route path="/operator/manajemen-data" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <ManajemenData />
            </ProtectedRoute>
          } />

          <Route path="/operator/pelaporan" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <Pelaporan />
            </ProtectedRoute>
          } />

          {/* ROUTE UNTUK DOKUMEN VALID - Mengarah ke DokumenValid.jsx */}
          <Route path="/operator/dokumen-valid" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <DokumenValid />
            </ProtectedRoute>
          } />

          {/* ROUTE DENGAN PARAMETER NIM - Untuk detail mahasiswa dari dokumen valid */}
          <Route path="/operator/dokumen-valid/:nim" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <DokumenValid />
            </ProtectedRoute>
          } />

          {/* ROUTE UNTUK DETAIL MAHASISWA OPERATOR - Dari halaman Batch */}
          <Route path="/operator/detail-mahasiswa/:nim" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <DetailMahasiswaOperator />
            </ProtectedRoute>
          } />

          {/* ROUTE UNTUK DETAIL PELAPORAN OPERATOR */}
          <Route path="/operator/detail-pelaporan/:id" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <DetailPelaporan />
            </ProtectedRoute>
          } />

          {/* ROUTE UNTUK DETAIL BATCH DOKUMEN VALID OPERATOR */}
          <Route path="/operator/detail-batch-dokumen-valid/:id" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <DetailBatchDokumenValid />
            </ProtectedRoute>
          } />

          {/* ROUTE UNTUK DETAIL DOKUMEN VALID OPERATOR */}
          <Route path="/operator/detail-dokumen-valid/:id" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <DetailDokumenValid />
            </ProtectedRoute>
          } />
          
          {/* OPERATOR BATCH ROUTES */}
          <Route path="/operator/batch/terbit/:id" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <BatchTerbit />
            </ProtectedRoute>
          } />
          
          <Route path="/operator/batch/proses/:id" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <BatchProses />
            </ProtectedRoute>
          } />
          
          <Route path="/operator/batch/reject/:id" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <BatchReject />
            </ProtectedRoute>
          } />
          
          <Route path="/operator/batch/revoke/:id" element={
            <ProtectedRoute allowedRoles={OPERATOR_ROLES}>
              <BatchRevoke />
            </ProtectedRoute>
          } />
          

          {/* ============================================================ */}
          {/* VERIFIKATOR ROUTES - prefix /verifikator */}
          {/* ============================================================ */}
          <Route path="/verifikator/dashboard" element={
            <ProtectedRoute allowedRoles={VERIFIKATOR_ROLES}>
              <VerifikatorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/verifikator/profile" element={
            <ProtectedRoute allowedRoles={VERIFIKATOR_ROLES}>
              <VerifikatorProfile />
            </ProtectedRoute>
          } />

          {/* ============================================================ */}
          {/* REKTOR ROUTES - prefix /rektor */}
          {/* ============================================================ */}
          <Route path="/rektor/dashboard" element={
            <ProtectedRoute allowedRoles={REKTOR_ROLES}>
              <RektorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/rektor/profile" element={
            <ProtectedRoute allowedRoles={REKTOR_ROLES}>
              <RektorProfile />
            </ProtectedRoute>
          } />

          {/* ============================================================ */}
          {/* SHARED ROUTES - Bisa diakses semua role */}
          {/* ============================================================ */}

          {/* SHARED DETAIL MAHASISWA - Untuk semua role (Admin, Verifikator, Rektor) */}
          <Route path="/detail-mahasiswa/:nim" element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <DetailMahasiswa />
            </ProtectedRoute>
          } />

          {/* SHARED IJAZAH ROUTES - Bisa diakses semua role */}
          <Route path="/ijazah/terbit" element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <IjazahTerbit />
            </ProtectedRoute>
          } />

          <Route path="/ijazah/proses" element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <IjazahProses />
            </ProtectedRoute>
          } />

          <Route path="/ijazah/reject" element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <IjazahReject />
            </ProtectedRoute>
          } />

          <Route path="/ijazah/revoke" element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <IjazahRevoke />
            </ProtectedRoute>
          } />

          {/* SHARED BATCH ROUTES - Bisa diakses semua role */}
          <Route path="/batch/terbit/:id" element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <BatchTerbit />
            </ProtectedRoute>
          } />

          <Route path="/batch/proses/:id" element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <BatchProses />
            </ProtectedRoute>
          } />

          <Route path="/batch/reject/:id" element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <BatchReject />
            </ProtectedRoute>
          } />

          <Route path="/batch/revoke/:id" element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <BatchRevoke />
            </ProtectedRoute>
          } />

          {/* ============================================================ */}
          {/* REDIRECTS */}
          {/* ============================================================ */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;