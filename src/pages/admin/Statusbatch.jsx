import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDetailBatch } from "@/services/daftarbatch.api";

// 1. Standarisasi status dari URL agar selalu seragam
const normalizeStatus = (status) => {
  const value = status?.toString().toLowerCase().trim();
  if (value === "terbit" || value === "approved" || value === "valid") return "terbit";
  if (value === "proses" || value === "pending") return "proses";
  if (value === "reject" || value === "rejected" || value === "ditolak") return "reject";
  if (value === "revoke" || value === "revoked" || value === "dicabut") return "revoke";
  return value || "";
};

const formatMahasiswa = (item, index, batchData, targetStatus) => {
  return {
    ...item,
    id: item.id || item.id_mahasiswa || index + 1,
    id_mahasiswa: item.id_mahasiswa,
    nim: item.nim || item.npm || "-",
    nama: item.nama || item.nama_mahasiswa || "-",
    nama_mahasiswa: item.nama_mahasiswa || item.nama || "-",
    prodi: item.prodi || item.program_studi || "-",
    program_studi: item.program_studi || item.prodi || "-",
    fakultas: item.fakultas || batchData?.fakultas || "-",
    tahun: item.tahun || item.tahun_lulus || batchData?.tahun_lulus || "-",
    tahun_lulus: item.tahun_lulus || item.tahun || batchData?.tahun_lulus || "-",
    periode: item.periode || batchData?.periode_label || "-",
    status: item.status || targetStatus, // Set default status ke status halaman
    batch: item.nama_batch || batchData?.nama_batch || "-",
    raw: item.raw || item,
  };
};

const getBadgeColor = (status) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case "terbit": return "bg-[#27AE60] text-white";
    case "proses": return "bg-[#3B82F6] text-white";
    case "reject": return "bg-[#EF4444] text-white";
    case "revoke": return "bg-[#F59E0B] text-white";
    default: return "bg-gray-400 text-white";
  }
};

const getBadgeLabel = (status) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case "terbit": return "Terbit";
    case "proses": return "Proses";
    case "reject": return "Reject";
    case "revoke": return "Revoke";
    default: return status || "-";
  }
};

const Statusbatch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { status, id } = useParams(); // Mengambil status (terbit/proses/dll) & id batch dari URL
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || "";

  // Decode parameter URL
  const decodedId = decodeURIComponent(id || "");
  const currentStatus = normalizeStatus(status);
  const displayLabel = getBadgeLabel(currentStatus);

  const [batchData, setBatchData] = useState({
    nama_batch: "-",
    fakultas: "-",
    tahun_lulus: "-",
    periode_label: "-",
    total_record_label: "-",
    status: displayLabel,
  });

  const [mahasiswa, setMahasiswa] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const fetchDetailBatch = async () => {
      try {
        setIsLoading(true);
        setApiError("");

        // 🔥 FIX UTAMA: Melempar currentStatus (terbit/proses/reject/revoke) ke API Service
        const result = await getDetailBatch(decodedId, currentStatus);
        
        let bData = {};
        let mList = [];

        // Ekstraksi data
        if (result && result.batch) {
          bData = result.batch;
          mList = result.mahasiswa || [];
        } else if (Array.isArray(result?.data)) {
          mList = result.data;
        } else if (Array.isArray(result)) {
          mList = result;
        }

        const extractedFakultas = bData.fakultas || mList[0]?.fakultas || mList[0]?.prodi?.fakultas || "-";

        const mappedBatchData = {
          nama_batch: bData.nama_batch || bData.nomor_batch_upload || "-",
          fakultas: extractedFakultas,
          tahun_lulus: bData.tahun_lulus || mList[0]?.tahun_lulus || "-",
          periode_label: bData.periode_label || bData.periode || mList[0]?.periode || "-",
          total_record_label: bData.total_record_label || `${mList.length} Mahasiswa`,
          status: displayLabel,
        };

        setBatchData(mappedBatchData);
        // Format ulang setiap mahasiswa agar statusnya mengikuti label halaman (jika kosong dari API)
        setMahasiswa(mList.map((m, index) => formatMahasiswa(m, index, mappedBatchData, displayLabel)));

      } catch (error) {
        console.error(`Gagal mengambil detail batch ${currentStatus}:`, error);
        setApiError(error.message || "Gagal mengambil data dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    if (decodedId) fetchDetailBatch();
  }, [decodedId, currentStatus]);

  const sortedMahasiswa = useMemo(() => {
    return [...mahasiswa].sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
  }, [mahasiswa]);

  const handleDetailMahasiswa = (item) => {
    const safeNim = encodeURIComponent(item.nim || "-");
    const formattedMahasiswa = {
      ...item,
      nama_mahasiswa: item.nama_mahasiswa || item.nama,
      program_studi: item.program_studi || item.prodi,
      tahun_lulus: item.tahun_lulus || item.tahun,
      fakultas: item.fakultas || batchData?.fakultas,
      batch: item.batch || batchData?.nama_batch,
    };

    const navState = { state: { mahasiswa: formattedMahasiswa, batch: batchData } };

    if (userRole === "rektor") navigate(`/rektor/detail-mahasiswa/${safeNim}`, navState);
    else if (userRole.includes("operator")) navigate(`/operator/detail-mahasiswa/${safeNim}`, navState);
    else if (userRole.includes("admin")) navigate(`/admin/detail-mahasiswa/${safeNim}`, navState);
    else navigate(`/verifikator/detail-mahasiswa/${safeNim}`, navState);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${currentStatus === "terbit" ? "border-[#27AE60]" : "border-[#3B82F6]"}`}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full pb-10">
        
        {/* HEADER TITLE */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight capitalize">
            Detail Batch {displayLabel}
          </h1>
          <p className="text-[#9CA3AF] text-[14px] font-medium capitalize mt-1">
            Daftar Mahasiswa dengan Status {displayLabel}
          </p>
          {apiError && <p className="text-sm text-red-500 font-semibold mt-2">{apiError}</p>}
        </div>

        {/* HEADER INFO */}
        <div className="mb-6 px-6 py-4 bg-white border border-gray-200 rounded-xl flex flex-wrap items-center gap-x-12 gap-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#117065]"></div>
          
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">No Batch</span>
            <span className="text-[14px] font-bold text-gray-800">{batchData.nama_batch}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Fakultas</span>
            <span className="text-[14px] font-bold text-gray-800">{batchData.fakultas}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Tahun Lulus</span>
            <span className="text-[14px] font-bold text-gray-800">{batchData.tahun_lulus}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Periode</span>
            <span className="text-[14px] font-bold text-gray-800">{batchData.periode_label}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Record</span>
            <span className="text-[14px] font-bold text-[#117065] bg-teal-50 px-2 py-0.5 rounded-md inline-block text-center w-fit">
              {batchData.total_record_label}
            </span>
          </div>
        </div>

        {/* TABEL MAHASISWA */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-center w-16">No</th>
                <th className="px-6 py-4 text-left">Nama</th>
                <th className="px-6 py-4 text-center">NIM</th>
                <th className="px-6 py-4 text-center">Program Studi</th>
                <th className="px-6 py-4 text-center">Tahun Lulus</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center w-20">Detail</th>
              </tr>
            </thead>
            <tbody>
              {sortedMahasiswa.length > 0 ? (
                sortedMahasiswa.map((mhs, i) => (
                  <tr key={mhs.id || mhs.id_mahasiswa || i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-gray-800">{i + 1}.</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{mhs.nama || "-"}</td>
                    <td className="px-6 py-4 text-center text-gray-800">{mhs.nim || "-"}</td>
                    <td className="px-6 py-4 text-center text-gray-800">{mhs.prodi || "-"}</td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">{mhs.tahun || mhs.tahun_lulus || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block min-w-[86px] px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(mhs.status)}`}>
                        {getBadgeLabel(mhs.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => handleDetailMahasiswa(mhs)} className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition">
                        <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400 capitalize">
                    Data mahasiswa {currentStatus} tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Statusbatch;