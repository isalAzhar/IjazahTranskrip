import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ============================================================
// IMPORT CONTEXT & LOGIN (Masuk ke dalam folder pages)
// ============================================================
import { AuthProvider, useAuth } from "./pages/context/AuthContext";
import Login from "./pages/context/login";

// ============================================================
// IMPORT PAGES DARI FOLDER ADMIN (Sesuai screenshot)
// ============================================================
import AdminDashboard from "./pages/admin/Dashboard";
import Template from "./pages/admin/Template";
import DataMahasiswa from "./pages/admin/DataMahasiswa";
import DetailBatch from "./pages/admin/DetailBatch";
import DetailMahasiswa from "./pages/admin/DetailMahasiswa"; 
import DaftarUnit from "./pages/admin/DaftarUnit";
import DaftarPengguna from "./pages/admin/DaftarPengguna";
import Profile from "./pages/admin/Profile";

// ============================================================
// IMPORT DARI FOLDER IJAZAH (Ternyata ada di dalam components)
// ============================================================
import IjazahTerbit from "./components/ijazah/IjazahTerbit";
import IjazahProses from "./components/ijazah/IjazahProses";
import IjazahReject from "./components/ijazah/IjazahReject";
import IjazahRevoke from "./components/ijazah/IjazahRevoke";

// ============================================================
// IMPORT DARI FOLDER BATCH (Ternyata ada di dalam components)
// ============================================================
import BatchTerbit from "./components/batch/BatchTerbit";
import BatchProses from "./components/batch/BatchProses";
import BatchReject from "./components/batch/BatchReject";
import BatchRevoke from "./components/batch/BatchRevoke";

// ============================================================
// IMPORT DASHBOARD ROLE LAIN
// ============================================================
import OperatorDashboard from "./pages/operator/OperatorDashboard";
// import VerifikatorDashboard from "./pages/verifikator/VerifikatorDashboard"; // Pastikan file ini ada
// import RektorDashboard from "./pages/rektor/RektorDashboard"; // Pastikan file ini ada

// SEMUA ROLE YANG ADA DI SISTEM
const ALL_ROLES = [
  "admin", "operator", "operator_data", "verifikator",
  "rektor", "wakil_rektor", "dekan", "wakil_dekan",
  "tu_fakultas", "tu_rektorat"
];

// PROTECTED ROUTE
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

// REDIRECT BERDASARKAN ROLE
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "admin")         return <Navigate to="/admin-dashboard" replace />;
  if (user.role === "operator")      return <Navigate to="/operator-dashboard" replace />;
  if (user.role === "operator_data") return <Navigate to="/operator-dashboard" replace />;
  if (user.role === "rektor")        return <Navigate to="/rektor-dashboard" replace />;
  if (user.role === "verifikator")   return <Navigate to="/verifikator-dashboard" replace />;

  // Role lain → admin-dashboard (sementara)
  return <Navigate to="/admin-dashboard" replace />;
};

function App() {
  const adminDashboardRoles = [
    "admin", "dekan", "wakil_rektor", "wakil_dekan",
    "tu_fakultas", "tu_rektorat", "rektor"
  ];

  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* PUBLIC ROUTE */}
          <Route path="/login" element={<Login />} />

          {/* DASHBOARD ROUTES */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={adminDashboardRoles}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/operator-dashboard" element={
            <ProtectedRoute allowedRoles={["operator", "operator_data"]}>
              <OperatorDashboard />
            </ProtectedRoute>
          } />
          {/* Hapus komentar jika file sudah ada */}
          {/* <Route path="/verifikator-dashboard" element={
            <ProtectedRoute allowedRoles={["verifikator"]}>
              <VerifikatorDashboard />
            </ProtectedRoute>
          } /> */}
          {/* <Route path="/rektor-dashboard" element={
            <ProtectedRoute allowedRoles={["rektor"]}>
              <RektorDashboard />
            </ProtectedRoute>
          } /> */}

          {/* FITUR IJAZAH (DAFTAR BATCH) */}
          <Route path="/ijazah-terbit" element={<ProtectedRoute allowedRoles={ALL_ROLES}><IjazahTerbit /></ProtectedRoute>} />
          <Route path="/ijazah-proses" element={<ProtectedRoute allowedRoles={ALL_ROLES}><IjazahProses /></ProtectedRoute>} />
          <Route path="/ijazah-reject" element={<ProtectedRoute allowedRoles={ALL_ROLES}><IjazahReject /></ProtectedRoute>} />
          <Route path="/ijazah-revoke" element={<ProtectedRoute allowedRoles={ALL_ROLES}><IjazahRevoke /></ProtectedRoute>} />
          
          {/* FITUR BATCH (DAFTAR MAHASISWA DALAM BATCH) */}
          <Route path="/batch-terbit/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><BatchTerbit /></ProtectedRoute>} />
          <Route path="/batch-proses/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><BatchProses /></ProtectedRoute>} />
          <Route path="/batch-reject/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><BatchReject /></ProtectedRoute>} />
          <Route path="/batch-revoke/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><BatchRevoke /></ProtectedRoute>} />

          {/* FITUR UMUM */}
          <Route path="/template" element={<ProtectedRoute allowedRoles={ALL_ROLES}><Template /></ProtectedRoute>} />
          <Route path="/data-mahasiswa" element={<ProtectedRoute allowedRoles={ALL_ROLES}><DataMahasiswa /></ProtectedRoute>} />
          <Route path="/detail-batch/:id" element={<ProtectedRoute allowedRoles={ALL_ROLES}><DetailBatch /></ProtectedRoute>} />
          <Route path="/detail-mahasiswa/:nim" element={<ProtectedRoute allowedRoles={ALL_ROLES}><DetailMahasiswa /></ProtectedRoute>} />
          
          <Route path="/daftar-unit" element={<ProtectedRoute allowedRoles={ALL_ROLES}><DaftarUnit /></ProtectedRoute>} />
          <Route path="/daftar-pengguna" element={<ProtectedRoute allowedRoles={["admin"]}><DaftarPengguna /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={ALL_ROLES}><Profile /></ProtectedRoute>} />
       
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