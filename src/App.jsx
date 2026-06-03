import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./pages/context/AuthContext";

// Public
import Login from "./pages/context/login";

// Shared Admin
import Template from "./pages/admin/Template";
import DataMahasiswa from "./pages/admin/DataMahasiswa";
import DetailBatch from "./pages/admin/DetailBatch";
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
import DetailMahasiswa from "./pages/DetailMahasiswa"; // 🔥 SATU KOMPONEN UNTUK SEMUA ROLE
import IjazahDigital from "./pages/operator/IjazahDigital";
import DetailPelaporan from "./pages/operator/DetailPelaporan";
import DetailBatchDokumenValid from "./pages/operator/DetailBatchDokumenValid";
import DetailDokumenValid from "./pages/operator/DetailDokumenValid";

// Verifikator
import VerifikatorDashboard from "./pages/verifikator/VerifikatorDashboard.jsx";
import VerifikatorProfile from "./pages/verifikator/Profile.jsx";
import VerifikatorDaftarBatch from "./pages/verifikator/DaftarBatch.jsx";
import VerifikatorPelaporan from "./pages/verifikator/PelaporanVerifikator";
import VerifikatorDetailBatch from "./pages/verifikator/DetailBatchVerifikator"; 

// Rektor
import RektorDashboard from "./pages/rektor/RektorDashboard";
import RektorProfile from "./pages/rektor/Profile";
import RektorDaftarBatch from "./pages/verifikator/DaftarBatch";
import RektorPelaporan from "./pages/verifikator/PelaporanVerifikator"; 
import RektorDokumenValid from "./pages/rektor/DokumenValid"; 
import RektorDetailDokumenValid from "./pages/rektor/DetailDokumenValid";

// 🔥 Pengecekan Role Dinamis
const isAdmin = (role) => ["admin", "admin_sistem"].includes(role);
const isOperator = (role) => ["operator", "operator_data"].includes(role);  
const isRektor = (role) => role === "rektor";
const isVerifikator = (role) => !isAdmin(role) && !isOperator(role) && !isRektor(role);

const ProtectedRoute = ({ children, allowedGroup }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d6b5e]" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedGroup === "ADMIN" && !isAdmin(user.role)) return <Navigate to="/dashboard" replace />;
  if (allowedGroup === "OPERATOR" && !isOperator(user.role)) return <Navigate to="/dashboard" replace />;
  if (allowedGroup === "REKTOR" && !isRektor(user.role)) return <Navigate to="/dashboard" replace />;
  if (allowedGroup === "VERIFIKATOR" && !isVerifikator(user.role)) return <Navigate to="/dashboard" replace />;
  
  return children;
};

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  if (isAdmin(user.role)) return <Navigate to="/admin/dashboard" replace />;
  if (isOperator(user.role)) return <Navigate to="/operator/dashboard" replace />;
  if (isRektor(user.role)) return <Navigate to="/rektor/dashboard" replace />;
  
  return <Navigate to="/verifikator/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedGroup="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedGroup="ADMIN"><Profile /></ProtectedRoute>} />
          <Route path="/admin/template" element={<ProtectedRoute allowedGroup="ADMIN"><Template /></ProtectedRoute>} />
          <Route path="/admin/data-mahasiswa" element={<ProtectedRoute allowedGroup="ADMIN"><DataMahasiswa /></ProtectedRoute>} />
          <Route path="/admin/daftar-unit" element={<ProtectedRoute allowedGroup="ADMIN"><DaftarUnit /></ProtectedRoute>} />
          <Route path="/admin/daftar-pengguna" element={<ProtectedRoute allowedGroup="ADMIN"><DaftarPengguna /></ProtectedRoute>} />
          <Route path="/admin/detail-batch/:id" element={<ProtectedRoute allowedGroup="ADMIN"><DetailBatch /></ProtectedRoute>} />
          {/* 🔥 Admin menggunakan komponen yang sama */}
          <Route path="/admin/detail-mahasiswa/:nim" element={<ProtectedRoute allowedGroup="ADMIN"><DetailMahasiswa /></ProtectedRoute>} />

          {/* OPERATOR ROUTES */}
          <Route path="/operator/dashboard" element={<ProtectedRoute allowedGroup="OPERATOR"><OperatorDashboard /></ProtectedRoute>} />
          <Route path="/operator/profile" element={<ProtectedRoute allowedGroup="OPERATOR"><OperatorProfile /></ProtectedRoute>} />
          <Route path="/operator/upload-data" element={<ProtectedRoute allowedGroup="OPERATOR"><ManajemenData /></ProtectedRoute>} />
          <Route path="/operator/pelaporan" element={<ProtectedRoute allowedGroup="OPERATOR"><Pelaporan /></ProtectedRoute>} />
          <Route path="/operator/detail-pelaporan/:nim" element={<ProtectedRoute allowedGroup="OPERATOR"><DetailPelaporan /></ProtectedRoute>} />
          <Route path="/operator/dokumen-valid" element={<ProtectedRoute allowedGroup="OPERATOR"><DokumenValid /></ProtectedRoute>} />
          <Route path="/operator/dokumen-valid/batch/:batchId" element={<ProtectedRoute allowedGroup="OPERATOR"><DetailBatchDokumenValid /></ProtectedRoute>} />
          <Route path="/operator/detail-dokumen-valid/:nim" element={<ProtectedRoute allowedGroup="OPERATOR"><DetailDokumenValid /></ProtectedRoute>} />
          <Route path="/operator/ijazah-digital/:nim" element={<ProtectedRoute allowedGroup="OPERATOR"><IjazahDigital /></ProtectedRoute>} />
          <Route path="/operator/batch/terbit/:id" element={<ProtectedRoute allowedGroup="OPERATOR"><BatchTerbit /></ProtectedRoute>} />
          <Route path="/operator/batch/proses/:id" element={<ProtectedRoute allowedGroup="OPERATOR"><BatchProses /></ProtectedRoute>} />
          <Route path="/operator/batch/reject/:id" element={<ProtectedRoute allowedGroup="OPERATOR"><BatchReject /></ProtectedRoute>} />
          <Route path="/operator/batch/revoke/:id" element={<ProtectedRoute allowedGroup="OPERATOR"><BatchRevoke /></ProtectedRoute>} />
          {/* 🔥 Rute spesifik Operator yang memanggil DetailMahasiswa */}
          <Route path="/operator/detail-mahasiswa/:nim" element={<ProtectedRoute allowedGroup="OPERATOR"><DetailMahasiswa /></ProtectedRoute>} />
       
          {/* 🔥 VERIFIKATOR ROUTES */}
          <Route path="/verifikator/dashboard" element={<ProtectedRoute allowedGroup="VERIFIKATOR"><VerifikatorDashboard /></ProtectedRoute>} />
          <Route path="/verifikator/profile" element={<ProtectedRoute allowedGroup="VERIFIKATOR"><VerifikatorProfile /></ProtectedRoute>} />
          <Route path="/verifikator/daftar-batch" element={<ProtectedRoute allowedGroup="VERIFIKATOR"><VerifikatorDaftarBatch /></ProtectedRoute>} />
          <Route path="/verifikator/pelaporan" element={<ProtectedRoute allowedGroup="VERIFIKATOR"><VerifikatorPelaporan /></ProtectedRoute>} />
          <Route path="/verifikator/detail-batch/:batchId" element={<ProtectedRoute allowedGroup="VERIFIKATOR"><VerifikatorDetailBatch /></ProtectedRoute>} />
          {/* 🔥 Rute spesifik Verifikator yang memanggil DetailMahasiswa */}
          <Route path="/verifikator/detail-mahasiswa/:nim" element={<ProtectedRoute allowedGroup="VERIFIKATOR"><DetailMahasiswa /></ProtectedRoute>} />

          {/* 🔥 REKTOR ROUTES */}
          <Route path="/rektor/dashboard" element={<ProtectedRoute allowedGroup="REKTOR"><RektorDashboard /></ProtectedRoute>} />
          <Route path="/rektor/profile" element={<ProtectedRoute allowedGroup="REKTOR"><RektorProfile /></ProtectedRoute>} />
          <Route path="/rektor/daftar-batch" element={<ProtectedRoute allowedGroup="REKTOR"><RektorDaftarBatch /></ProtectedRoute>} />
          <Route path="/rektor/detail-batch/:batchId" element={<ProtectedRoute allowedGroup="REKTOR"><VerifikatorDetailBatch /></ProtectedRoute>} />
          <Route path="/rektor/pelaporan" element={<ProtectedRoute allowedGroup="REKTOR"><RektorPelaporan /></ProtectedRoute>} />
          <Route path="/rektor/dokumen-valid" element={<ProtectedRoute allowedGroup="REKTOR"><RektorDokumenValid /></ProtectedRoute>} />  
          <Route path="/rektor/detail-dokumen-valid/:id" element={<ProtectedRoute allowedGroup="REKTOR"><RektorDetailDokumenValid /></ProtectedRoute>} />
          {/* 🔥 Rute spesifik Rektor yang memanggil DetailMahasiswa */}
          <Route path="/rektor/detail-mahasiswa/:nim" element={<ProtectedRoute allowedGroup="REKTOR"><DetailMahasiswa /></ProtectedRoute>} />

          {/* SHARED ROUTES (Tanpa Detail Mahasiswa karena sudah dipisah per role) */}
          <Route path="/ijazah/terbit" element={<ProtectedRoute allowedGroup="ALL"><IjazahTerbit /></ProtectedRoute>} />
          <Route path="/ijazah/proses" element={<ProtectedRoute allowedGroup="ALL"><IjazahProses /></ProtectedRoute>} />
          <Route path="/ijazah/reject" element={<ProtectedRoute allowedGroup="ALL"><IjazahReject /></ProtectedRoute>} />
          <Route path="/ijazah/revoke" element={<ProtectedRoute allowedGroup="ALL"><IjazahRevoke /></ProtectedRoute>} />
          <Route path="/ijazah-digital/:nim" element={<ProtectedRoute allowedGroup="ALL"><IjazahDigital /></ProtectedRoute>} />
          <Route path="/batch/terbit/:id" element={<ProtectedRoute allowedGroup="ALL"><BatchTerbit /></ProtectedRoute>} />
          <Route path="/batch/proses/:id" element={<ProtectedRoute allowedGroup="ALL"><BatchProses /></ProtectedRoute>} />
          <Route path="/batch/reject/:id" element={<ProtectedRoute allowedGroup="ALL"><BatchReject /></ProtectedRoute>} />
          <Route path="/batch/revoke/:id" element={<ProtectedRoute allowedGroup="ALL"><BatchRevoke /></ProtectedRoute>} />
          
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