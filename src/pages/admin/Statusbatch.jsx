import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// 🔥 KEMBALI MENGGUNAKAN getLatestValidations
import { getLatestValidations } from "../../services/dashboard.api";

const normalizeStatus = (status) => {
  const value = status?.toString().toLowerCase();
  if (value === "terbit" || value === "approved" || value === "valid") return "terbit";
  if (value === "proses" || value === "pending") return "proses";
  if (value === "reject" || value === "rejected" || value === "ditolak") return "reject";
  if (value === "revoke" || value === "revoked" || value === "dicabut") return "revoke";
  return value || "";
};

const getBatchIdentity = (item = {}) => {
  const batchName = item.batch || "Tanpa Batch";
  const fakultas = item.fakultas || "-";
  const tahun = item.tahun_lulus?.toString() || item.tahun?.toString() || "-";
  const periode = item.periode || "-";
  const key = `${batchName}-${fakultas}-${tahun}-${periode}`;
  return { batchName, fakultas, tahun, periode, key };
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
    tahun: item.tahun || item.tahun_lulus || batchData?.tahun || "-",
    tahun_lulus: item.tahun_lulus || item.tahun || batchData?.tahun || "-",
    periode: item.periode || batchData?.periode || "-",
    status: item.status || batchData?.status || targetStatus,
    batch: item.batch || batchData?.batch || "-",
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
  const { status, id } = useParams();
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || "";

  const decodedId = decodeURIComponent(id || "");
  const currentStatus = normalizeStatus(status);
  const displayLabel = getBadgeLabel(currentStatus);

  const [batchData, setBatchData] = useState({
    batch: `Batch ${decodedId || "-"}`,
    fakultas: "-",
    tahun: "-",
    periode: "-",
    status: displayLabel,
  });

  const [mahasiswa, setMahasiswa] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const fetchBatchDynamic = async () => {
      try {
        setIsLoading(true);
        setApiError("");

        // 🔥 FIX: Pakai getLatestValidations
        const result = await getLatestValidations({
          page: 1,
          limit: 10000,
          status: currentStatus
        });

        const rows = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];

        const filteredRows = rows.filter(
          (item) => normalizeStatus(item.status) === currentStatus
        );

        const selectedRows = filteredRows.filter((item) => {
          const identity = getBatchIdentity(item);
          const possibleIds = [
            item.id_batch,
            item.id_batch_upload,
            item.batch_id,
            identity.key,
            identity.batchName,
          ].filter(Boolean).map((value) => String(value));

          return possibleIds.includes(decodedId);
        });

        if (selectedRows.length === 0) {
          setMahasiswa([]);
          return;
        }

        const firstIdentity = getBatchIdentity(selectedRows[0]);
        const newBatchData = {
          batch: firstIdentity.batchName,
          fakultas: firstIdentity.fakultas,
          tahun: firstIdentity.tahun,
          periode: firstIdentity.periode,
          status: displayLabel,
        };

        setBatchData(newBatchData);
        setMahasiswa(
          selectedRows.map((item, index) =>
            formatMahasiswa(item, index, newBatchData, displayLabel)
          )
        );
      } catch (error) {
        console.error(`Gagal mengambil detail batch ${currentStatus}:`, error);
        setApiError(error.message || "Gagal mengambil data dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchDynamic();
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
      batch: item.batch || batchData?.batch,
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
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            currentStatus === "terbit" ? "border-[#27AE60]" : 
            currentStatus === "reject" ? "border-[#EF4444]" :
            currentStatus === "revoke" ? "border-[#F59E0B]" : "border-[#3B82F6]"
          }`}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full pb-10">
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[24px] md:text-[28px] font-bold text-gray-900 tracking-tight capitalize">
              Detail Batch {displayLabel}
            </h1>
            <p className="text-[#9CA3AF] text-[13px] md:text-[14px] font-medium capitalize">
              Daftar Mahasiswa dengan Status {displayLabel}
            </p>
            {apiError && <p className="text-sm text-red-500 mt-1 font-semibold">{apiError}</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F7F7] text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-center">No</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-center">NIM</th>
                <th className="px-4 py-3 text-center">Program Studi</th>
                <th className="px-4 py-3 text-center">Tahun Lulus</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Detail</th>
              </tr>
            </thead>
            <tbody>
              {sortedMahasiswa.length > 0 ? (
                sortedMahasiswa.map((mhs, i) => (
                  <tr key={mhs.id || mhs.id_mahasiswa || i} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{mhs.nama || "-"}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-center">{mhs.nim || "-"}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-center">{mhs.prodi || "-"}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-center">{mhs.tahun || mhs.tahun_lulus || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block min-w-[86px] px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(mhs.status)}`}>
                        {getBadgeLabel(mhs.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => handleDetailMahasiswa(mhs)} className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-100 transition">
                        <div className="w-3 h-3 border-t-2 border-b-2 border-gray-400"></div>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-400 capitalize">
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