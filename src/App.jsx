import React from "react";
import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./pages/context/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import StudentDownloadPage from "./pages/public/StudentDownloadPage";

// Public
import Login from "./pages/context/login";

// Shared Admin
import Template from "./pages/admin/Template";
import DataMahasiswa from "./pages/admin/DataMahasiswa";
import DetailBatch from "./pages/admin/DetailBatch";
import DaftarUnit from "./pages/admin/DaftarUnit";
import DaftarPengguna from "./pages/admin/DaftarPengguna";
import Profile from "./pages/admin/Profile";

// NEW: Ijazah & Batch Components
import StatusIjazah from "./pages/admin/StatusIjazah";
import Statusbatch from "./pages/admin/Statusbatch";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";

// Operator
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import ManajemenData from "./pages/operator/ManajemenData";
import Pelaporan from "./pages/operator/Pelaporan";
import OperatorProfile from "./pages/operator/OperatorProfile";
import DokumenValid from "./pages/operator/DokumenValid";
import DetailMahasiswa from "@/pages/admin/DetailMahasiswa";
import IjazahDigital from "./pages/operator/IjazahDigital";
import DetailPelaporan from "./pages/operator/DetailPelaporan";
import DetailDokumenValid from "./pages/operator/DetailDokumenValid";
import ScanQRResult from "./pages/operator/ScanQRResult";

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

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  const localToken = localStorage.getItem("authToken");
  if (!localToken) return <Navigate to="/login" replace />;

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#117065]" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.toLowerCase() || "";
  if (["admin", "admin_sistem"].includes(role)) return <Navigate to="/admin/dashboard" replace />;
  if (["operator", "operator_data"].includes(role)) return <Navigate to="/operator/dashboard" replace />;
  if (role === "rektor") return <Navigate to="/rektor/dashboard" replace />;
  return <Navigate to="/verifikator/dashboard" replace />;
};

// ✅ Ganti BrowserRouter ke createHashRouter
// URL jadi: http://localhost:5173/#/admin/dashboard
const router = createHashRouter([
  { path: "/login", element: <Login /> },
  { path: "/download/:token", element: <StudentDownloadPage /> },

  // ADMIN ROUTES
  { path: "/admin/dashboard", element: <ProtectedRoute allowedGroup="ADMIN"><AdminDashboard /></ProtectedRoute> },
  { path: "/admin/profile", element: <ProtectedRoute allowedGroup="ADMIN"><Profile /></ProtectedRoute> },
  { path: "/admin/template", element: <ProtectedRoute allowedGroup="ADMIN"><Template /></ProtectedRoute> },
  { path: "/admin/data-mahasiswa", element: <ProtectedRoute allowedGroup="ADMIN"><DataMahasiswa /></ProtectedRoute> },
  { path: "/admin/daftar-unit", element: <ProtectedRoute allowedGroup="ADMIN"><DaftarUnit /></ProtectedRoute> },
  { path: "/admin/daftar-pengguna", element: <ProtectedRoute allowedGroup="ADMIN"><DaftarPengguna /></ProtectedRoute> },
  { path: "/admin/detail-batch/:batchCode", element: <ProtectedRoute allowedGroup="ADMIN"><DetailBatch /></ProtectedRoute> },
  { path: "/admin/detail-mahasiswa/:mahasiswaCode", element: <ProtectedRoute allowedGroup="ADMIN"><DetailMahasiswa /></ProtectedRoute> },

  // OPERATOR ROUTES
  { path: "/operator/dashboard", element: <ProtectedRoute allowedGroup="OPERATOR"><OperatorDashboard /></ProtectedRoute> },
  { path: "/operator/profile", element: <ProtectedRoute allowedGroup="OPERATOR"><OperatorProfile /></ProtectedRoute> },
  { path: "/operator/upload-data", element: <ProtectedRoute allowedGroup="OPERATOR"><ManajemenData /></ProtectedRoute> },
  { path: "/operator/pelaporan", element: <ProtectedRoute allowedGroup="OPERATOR"><Pelaporan /></ProtectedRoute> },
  { path: "/operator/detail-pelaporan/:mahasiswaCode", element: <ProtectedRoute allowedGroup="OPERATOR"><DetailPelaporan /></ProtectedRoute> },
  { path: "/operator/dokumen-valid", element: <ProtectedRoute allowedGroup="OPERATOR"><DokumenValid /></ProtectedRoute> },
  { path: "/operator/detail-dokumen-valid/:batchCode", element: <ProtectedRoute allowedGroup="OPERATOR"><DetailDokumenValid /></ProtectedRoute> },
  { path: "/operator/ijazah-digital/:nim", element: <ProtectedRoute allowedGroup="OPERATOR"><IjazahDigital /></ProtectedRoute> },
  { path: "/operator/batch/:status/:batchCode", element: <ProtectedRoute allowedGroup="OPERATOR"><Statusbatch /></ProtectedRoute> },
  { path: "/operator/detail-mahasiswa/:mahasiswaCode", element: <ProtectedRoute allowedGroup="OPERATOR"><DetailMahasiswa /></ProtectedRoute> },

  // SCAN QR — public, tanpa protected
  { path: "/verify/:kodeQr", element: <ScanQRResult /> },

  { path: "/scan-result/:kodeQr", element: <ScanQRResult /> },

  // VERIFIKATOR ROUTES
  { path: "/verifikator/dashboard", element: <ProtectedRoute allowedGroup="VERIFIKATOR"><VerifikatorDashboard /></ProtectedRoute> },
  { path: "/verifikator/profile", element: <ProtectedRoute allowedGroup="VERIFIKATOR"><VerifikatorProfile /></ProtectedRoute> },
  { path: "/verifikator/daftar-batch", element: <ProtectedRoute allowedGroup="VERIFIKATOR"><VerifikatorDaftarBatch /></ProtectedRoute> },
  { path: "/verifikator/pelaporan", element: <ProtectedRoute allowedGroup="VERIFIKATOR"><VerifikatorPelaporan /></ProtectedRoute> },
  { path: "/verifikator/detail-batch/:batchCode", element: <ProtectedRoute allowedGroup="VERIFIKATOR"><VerifikatorDetailBatch /></ProtectedRoute> },
  { path: "/verifikator/detail-mahasiswa/:mahasiswaCode", element: <ProtectedRoute allowedGroup="VERIFIKATOR"><DetailMahasiswa /></ProtectedRoute> },

  // REKTOR ROUTES
  { path: "/rektor/dashboard", element: <ProtectedRoute allowedGroup="REKTOR"><RektorDashboard /></ProtectedRoute> },
  { path: "/rektor/profile", element: <ProtectedRoute allowedGroup="REKTOR"><RektorProfile /></ProtectedRoute> },
  { path: "/rektor/daftar-batch", element: <ProtectedRoute allowedGroup="REKTOR"><RektorDaftarBatch /></ProtectedRoute> },
  { path: "/rektor/detail-batch/:batchCode", element: <ProtectedRoute allowedGroup="REKTOR"><VerifikatorDetailBatch /></ProtectedRoute> },
  { path: "/rektor/pelaporan", element: <ProtectedRoute allowedGroup="REKTOR"><RektorPelaporan /></ProtectedRoute> },
  { path: "/rektor/dokumen-valid", element: <ProtectedRoute allowedGroup="REKTOR"><RektorDokumenValid /></ProtectedRoute> },
  { path: "/rektor/detail-dokumen-valid/:batchCode", element: <ProtectedRoute allowedGroup="REKTOR"><RektorDetailDokumenValid /></ProtectedRoute> },
  { path: "/rektor/detail-mahasiswa/:mahasiswaCode", element: <ProtectedRoute allowedGroup="REKTOR"><DetailMahasiswa /></ProtectedRoute> },

  // SHARED ROUTES
  { path: "/ijazah/:status", element: <ProtectedRoute allowedGroup="ALL"><StatusIjazah /></ProtectedRoute> },
  { path: "/batch/:status/:batchCode", element: <ProtectedRoute allowedGroup="ALL"><Statusbatch /></ProtectedRoute> },
  { path: "/ijazah-digital/:nim", element: <ProtectedRoute allowedGroup="ALL"><IjazahDigital /></ProtectedRoute> },

  // REDIRECTS
  { path: "/dashboard", element: <RoleBasedRedirect /> },
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

function App() {
  return (
    <AuthProvider>
      {/* ✅ RouterProvider menggantikan <Router> + <Routes> */}
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;