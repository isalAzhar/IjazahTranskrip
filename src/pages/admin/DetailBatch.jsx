import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { useAuth } from "../../pages/context/AuthContext";
import { getDetailBatch } from "../../services/dashboard.api";

// ==========================================
// KUMPULAN FUNGSI HELPER / FORMATTER
// ==========================================
const formatPeriode = (periode) => {
  if (!periode || periode === "-") return "-";
  const raw = periode.toString().replace(/_/g, " ").toLowerCase();
  return raw
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatSingkatanFakultas = (namaFakultas) => {
  if (!namaFakultas) return "-";
  const namaLower = namaFakultas.toLowerCase();
  
  if (namaLower.includes("agama islam")) return "FAI";
  if (namaLower.includes("keguruan") || namaLower.includes("pendidikan")) return "FKIP";
  if (namaLower.includes("ekonomi") || namaLower.includes("bisnis")) return "FEB";
  if (namaLower.includes("hukum")) return "FH";
  if (namaLower.includes("teknik") || namaLower.includes("sains")) return "FTS";
  if (namaLower.includes("kesehatan")) return "FIKES";
  
  return namaFakultas; 
};

const getBatchFromState = (state) => {
  if (!state) return null;

  if (state.batch && typeof state.batch === "object") {
    return state.batch;
  }

  if (typeof state === "object") {
    return state;
  }

  return null;
};

const normalizeStatus = (status) => {
  const value = status?.toString().toLowerCase();

  if (value === "approved" || value === "terbit" || value === "valid") {
    return "terbit";
  }

  if (value === "pending" || value === "proses") {
    return "proses";
  }

  if (value === "rejected" || value === "reject" || value === "ditolak") {
    return "reject";
  }

  if (value === "revoked" || value === "revoke" || value === "dicabut") {
    return "revoke";
  }

  return value || "proses";
};

const getBadgeColor = (status) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "terbit":
      return "bg-[#27AE60] text-white";
    case "proses":
      return "bg-[#3B82F6] text-white";
    case "reject":
      return "bg-[#EF4444] text-white";
    case "revoke":
      return "bg-[#F59E0B] text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

const getBadgeLabel = (status) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "terbit":
      return "Terbit";
    case "proses":
      return "Proses";
    case "reject":
      return "Reject";
    case "revoke":
      return "Revoke";
    default:
      return status || "Proses";
  }
};

const DetailBatch = () => {
  const { batchCode, id } = useParams();
  const currentBatchCode = decodeURIComponent(batchCode || id || "");
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || "";

  const batchFromState = useMemo(() => {
    return getBatchFromState(location.state);
  }, [location.state]);

  const [batchData, setBatchData] = useState(batchFromState || null);
  const [mahasiswa, setMahasiswa] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const fetchDetailBatch = async () => {
      try {
        setIsInitialLoading(true);
        setApiError("");

        const result = await getDetailBatch(currentBatchCode);

        // Support 2 bentuk response:
        // 1. result.data.batch + result.data.mahasiswa
        // 2. result.batch + result.mahasiswa
        const payload = result?.data || result;

        const batchInfo = payload?.batch || {};
        const rows = Array.isArray(payload?.mahasiswa) ? payload.mahasiswa : [];

        // Deteksi & Ekstrak Fakultas jika tidak ada di Batch Info tapi ada di mahasiswa
        let extractedFakultas = batchInfo?.fakultas || batchFromState?.fakultas;
        if (!extractedFakultas && rows.length > 0) {
          const mhsFakultas = rows.find(m => m.fakultas || m.nama_fakultas);
          extractedFakultas = mhsFakultas ? (mhsFakultas.fakultas || mhsFakultas.nama_fakultas) : "-";
        }

        const newBatchData = {
          batch_code:
            batchInfo?.batch_code ||
            batchInfo?.uuid ||
            batchFromState?.batch_code ||
            batchFromState?.uuid ||
            currentBatchCode,

          id: batchInfo?.id || batchInfo?.id_batch_upload || batchFromState?.id || null,

          id_batch_upload:
            batchInfo?.id_batch_upload ||
            batchFromState?.id_batch_upload ||
            null,

          batch:
            batchInfo?.nomor_batch_upload ||
            batchInfo?.batch ||
            batchFromState?.nomor_batch_upload ||
            batchFromState?.batch ||
            "Batch",

          nomor_batch_upload:
            batchInfo?.nomor_batch_upload ||
            batchInfo?.batch ||
            batchFromState?.nomor_batch_upload ||
            batchFromState?.batch ||
            "Batch",

          nama_file: batchInfo?.nama_file || batchFromState?.nama_file || "-",

          // 🔥 FORMAT FAKULTAS (Singkatan)
          fakultas: formatSingkatanFakultas(extractedFakultas || "-"),

          tahun:
            batchInfo?.tahun?.toString() ||
            batchInfo?.tahun_lulus?.toString() ||
            batchFromState?.tahun?.toString() ||
            batchFromState?.tahun_lulus?.toString() ||
            "-",

          tahun_lulus:
            batchInfo?.tahun_lulus ||
            batchInfo?.tahun ||
            batchFromState?.tahun_lulus ||
            batchFromState?.tahun ||
            "-",

          // 🔥 FORMAT PERIODE (Semester Genap)
          periode: formatPeriode(batchInfo?.periode || batchFromState?.periode || "-"),

          total: batchInfo?.total || rows.length,
        };

        setBatchData(newBatchData);
        const formattedMahasiswa = rows.map((item, index) => ({
          ...item,

          mahasiswa_code:
            item.mahasiswa_code ||
            item.mahasiswaCode ||
            item.uuid ||
            item.mahasiswa_uuid ||
            item.raw?.mahasiswa_code ||
            item.raw?.uuid ||
            null,

          id: item.id || item.id_mahasiswa || index + 1,
          id_mahasiswa: item.id_mahasiswa,

          nama: item.nama || item.nama_mahasiswa || "-",
          nama_mahasiswa: item.nama_mahasiswa || item.nama || "-",

          nim: item.nim || item.npm || "-",

          prodi: item.prodi || item.program_studi || item.nama_prodi || "-",
          program_studi: item.program_studi || item.prodi || item.nama_prodi || "-",

          fakultas: formatSingkatanFakultas(item.fakultas || newBatchData.fakultas || "-"),

          tahun: item.tahun || item.tahun_lulus || newBatchData.tahun || "-",
          tahun_lulus: item.tahun_lulus || item.tahun || newBatchData.tahun || "-",

          status: item.status || item.status_validasi || "proses",

          batch: newBatchData.batch,
        }));

        setMahasiswa(formattedMahasiswa);
      } catch (error) {
        console.error("Gagal mengambil detail batch:", error);
        setApiError(error.message || "Gagal mengambil detail batch dari server.");
        setMahasiswa([]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchDetailBatch();
  }, [currentBatchCode, batchFromState]);

  const sortedMahasiswa = useMemo(() => {
    return [...mahasiswa].sort((a, b) => {
      return (a.nama || "").localeCompare(b.nama || "");
    });
  }, [mahasiswa]);

  const handleDetailMahasiswa = (item) => {
    const mahasiswaCode =
      item.mahasiswa_code ||
      item.mahasiswaCode ||
      item.uuid ||
      item.mahasiswa_uuid ||
      item.raw?.mahasiswa_code ||
      item.raw?.uuid;

    if (!mahasiswaCode) {
      console.error("Mahasiswa code tidak ditemukan:", item);
      alert("Kode mahasiswa tidak ditemukan.");
      return;
    }

    const safeMahasiswaCode = encodeURIComponent(mahasiswaCode);

    const formattedMahasiswa = {
      ...item,
      nama_mahasiswa: item.nama_mahasiswa || item.nama,
      program_studi: item.program_studi || item.prodi,
      tahun_lulus: item.tahun_lulus || item.tahun,
      batch: batchData?.batch,
      fakultas: item.fakultas || batchData?.fakultas,
    };

    const navState = {
      state: {
        mahasiswa: formattedMahasiswa,
        batch: batchData,
      },
    };

    if (userRole === "admin") {
      navigate(`/admin/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    } else if (userRole.includes("operator")) {
      navigate(`/operator/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    } else if (userRole.includes("rektor")) {
      navigate(`/rektor/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    } else {
      navigate(`/verifikator/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    }
  };

  if (isInitialLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#117065]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full pb-10">
        <div className="mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
              Detail Batch
            </h1>

            <p className="text-[#9CA3AF] text-[14px] font-medium">
              Daftar Mahasiswa Berdasarkan Batch
            </p>

            {apiError && (
              <p className="text-sm text-red-500 mt-2 font-semibold">
                {apiError}
              </p>
            )}
          </div>
        </div>

        {/* 🔥 HEADER INFO CARD (Diambil dari StatusBatch) */}
        <div className="mb-6 px-6 py-4 bg-white border border-gray-200 rounded-xl flex flex-wrap items-center gap-x-12 gap-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#117065]"></div>
          
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">No Batch</span>
            <span className="text-[14px] font-bold text-gray-800">{batchData?.nomor_batch_upload || batchData?.batch || "-"}</span>
          </div>

          <div className="flex flex-col max-w-md">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Fakultas</span>
            <span className="text-[14px] font-bold text-gray-800 break-words">{batchData?.fakultas || "-"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Tahun Lulus</span>
            <span className="text-[14px] font-bold text-gray-800">{batchData?.tahun_lulus || batchData?.tahun || "-"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Periode</span>
            <span className="text-[14px] font-bold text-gray-800">{batchData?.periode || "-"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Record</span>
            <span className="text-[14px] font-bold text-[#117065] bg-teal-50 px-2 py-0.5 rounded-md inline-block text-center w-fit">
              {batchData?.total || 0} Mahasiswa
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
                sortedMahasiswa.map((item, i) => (
                  <tr
                    key={item.id_mahasiswa || item.id || i}
                    className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-center">{i + 1}</td>

                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {item.nama || "-"}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800 text-center">
                      {item.nim || "-"}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800 text-center">
                      {item.prodi || "-"}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800 text-center">
                      {item.tahun || "-"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block min-w-[86px] px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(
                          item.status
                        )}`}
                      >
                        {getBadgeLabel(item.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDetailMahasiswa(item)}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-100 transition"
                        title="Lihat Detail Mahasiswa"
                      >
                        <div className="w-3 h-3 border-t-2 border-b-2 border-gray-400"></div>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Data mahasiswa tidak ditemukan.
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

export default DetailBatch;