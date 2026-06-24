import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDetailBatch } from "../../services/dashboard.api";

// ==========================================
// KUMPULAN FUNGSI HELPER / FORMATTER
// ==========================================
const normalizeStatus = (status) => {
  const value = status?.toString().toLowerCase().trim();
  if (value === "terbit" || value === "approved" || value === "valid") return "terbit";
  if (value === "proses" || value === "pending") return "proses";
  if (value === "reject" || value === "rejected" || value === "ditolak") return "reject";
  if (value === "revoke" || value === "revoked" || value === "dicabut") return "revoke";
  return value || "";
};

const formatNamaBatch = (kode) => {
  return kode || "-";
};

const formatPeriode = (periode) => {
  const map = {
    semester_ganjil: "Semester Ganjil",
    semester_genap: "Semester Genap",
    semester_pendek: "Semester Pendek",
  };
  return map[periode?.toString().toLowerCase()] || periode?.toString().replace(/_/g, ' ') || "-";
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

const formatStatusEmail = (statusKirimRaw) => {
  const raw = String(statusKirimRaw || "").toLowerCase();
  if (
    raw.includes("sudah") ||
    (raw.includes("terkirim") && !raw.includes("belum"))
  ) {
    return "Terkirim";
  }
  return "Belum Terkirim";
};

const formatMahasiswa = (item, index, batchData, targetStatus) => {
  const coreMhs = item?.mahasiswa || item || {};
  
  const rawStatusKirim = 
    item.status_email ||
    item.status_kirim ||
    item.statusKirim ||
    coreMhs.status_email ||
    coreMhs.status_kirim ||
    item.raw?.status_email ||
    item.raw?.status_kirim;

  return {
    ...item,
    id:
      item.mahasiswa_code ||
      item.mahasiswaCode ||
      item.uuid ||
      item.mahasiswa_uuid ||
      item.id ||
      item.id_mahasiswa ||
      index + 1,
    id_mahasiswa: item.id_mahasiswa,
    mahasiswa_code:
      item.mahasiswa_code ||
      item.mahasiswaCode ||
      item.uuid ||
      item.mahasiswa_uuid ||
      item.raw?.mahasiswa_code ||
      item.raw?.uuid ||
      null,
    nim: item.nim || item.npm || coreMhs.nim || "-",
    nama: item.nama || item.nama_mahasiswa || coreMhs.nama || "-",
    nama_mahasiswa: item.nama_mahasiswa || item.nama || coreMhs.nama || "-",
    prodi: item.prodi || item.program_studi || item.nama_prodi || coreMhs.program_studi || "-",
    program_studi: item.program_studi || item.prodi || item.nama_prodi || coreMhs.program_studi || "-",
    fakultas: item.fakultas || batchData?.fakultas || "-",
    tahun: item.tahun || item.tahun_lulus || batchData?.tahun_lulus || "-",
    tahun_lulus: item.tahun_lulus || item.tahun || batchData?.tahun_lulus || "-",
    periode: item.periode || batchData?.periode_label || "-",
    status: targetStatus,
    batch: item.nama_batch || batchData?.nama_batch || "-",
    status_email: rawStatusKirim ? formatStatusEmail(rawStatusKirim) : (batchData?.status_email || "Belum Terkirim"),
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

// ==========================================
// KOMPONEN KARTU MAHASISWA (Mobile View)
// ==========================================
const MahasiswaCard = ({ mhs, index, onDetail }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0">{index + 1}.</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-tight truncate">{mhs.nama || "-"}</p>
          <p className="text-xs text-gray-500 mt-0.5">{mhs.nim || "-"}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDetail(mhs)}
        className="shrink-0 w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition"
        aria-label="Lihat detail"
      >
        <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
      </button>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
      <div>
        <span className="text-gray-400 uppercase tracking-wide font-semibold text-[10px]">Program Studi</span>
        <p className="text-gray-800 font-medium mt-0.5 leading-tight">{mhs.prodi || "-"}</p>
      </div>
      <div>
        <span className="text-gray-400 uppercase tracking-wide font-semibold text-[10px]">Tahun Lulus</span>
        <p className="text-gray-800 font-semibold mt-0.5">{mhs.tahun || mhs.tahun_lulus || "-"}</p>
      </div>
      <div className="col-span-2">
        <span className="text-gray-400 uppercase tracking-wide font-semibold text-[10px]">Status</span>
        <div className="mt-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(mhs.status)}`}>
            {getBadgeLabel(mhs.status)}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// KOMPONEN UTAMA
// ==========================================
const Statusbatch = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { status, batchCode, id } = useParams();  
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || "";

  const currentBatchCode = decodeURIComponent(batchCode || id || "" );
  const currentStatus = normalizeStatus(status);
  const displayLabel = getBadgeLabel(currentStatus);

  const batchFromState = location.state?.batch || location.state || {};

  const [batchData, setBatchData] = useState({
    nama_batch: batchFromState.batch || batchFromState.nomor_batch_upload || "-",
    fakultas: formatSingkatanFakultas(batchFromState.fakultas) || "-",
    tahun_lulus: batchFromState.tahun || batchFromState.tahun_lulus || "-",
    periode_label: batchFromState.periode || "-",
    total_record_label: batchFromState.total ? `${batchFromState.total} Mahasiswa` : "-",
    status: displayLabel,
    status_email: batchFromState.status_email || "Belum Terkirim",
  });

  const [mahasiswa, setMahasiswa] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const fetchDetailBatch = async () => {
      if (!currentBatchCode) {
        setApiError("Kode Batch tidak valid.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setApiError("");

        let bData = {};
        let mList = [];

        const result = await getDetailBatch(currentBatchCode, currentStatus);
        
        if (result) {
          if (Array.isArray(result)) mList = result;
          else if (Array.isArray(result.mahasiswa)) { bData = result.batch || {}; mList = result.mahasiswa; }
          else if (Array.isArray(result.data)) mList = result.data;
          else if (result.data && typeof result.data === "object") { 
            bData = result.data.batch || {}; 
            mList = result.data.mahasiswa || result.data.data || []; 
          }
          else if (typeof result === "object") { bData = result.batch || {}; mList = result.mahasiswa || []; }
        }

        if (!Array.isArray(mList)) mList = [];

        if (currentStatus && mList.length > 0) {
          const filteredList = mList.filter(item => {
            const rawStatus = 
              item.status || 
              item.status_dashboard || 
              item.status_validasi || 
              item.status_approval || 
              item.approval?.status || 
              item.mahasiswa?.status || 
              item.mahasiswa?.approval?.status || 
              item.raw?.status || 
              ""; 

            const itemStatus = String(rawStatus).toLowerCase().trim();
            
            if (currentStatus === "terbit") return ["terbit", "valid", "approved"].includes(itemStatus);
            if (currentStatus === "proses") return ["proses", "pending", ""].includes(itemStatus);
            if (currentStatus === "reject") return ["reject", "ditolak", "rejected"].includes(itemStatus);
            if (currentStatus === "revoke") return ["revoke", "dicabut", "revoked"].includes(itemStatus);
            
            return itemStatus === currentStatus;
          });

          if (filteredList.length > 0) {
              mList = filteredList;
          }
        }

        const firstItem = mList[0] || {};
        const rawItem = firstItem.raw || {};
        
        const allFaculties = mList.map(item => 
          item.fakultas || 
          item.nama_fakultas || 
          item.raw?.fakultas || 
          item.raw?.nama_fakultas || 
          item.mahasiswa?.prodi?.unit?.nama_unit
        ).filter(f => f && f !== "-" && f.trim() !== "");

        const mappedFaculties = allFaculties.map(f => formatSingkatanFakultas(f));
        const uniqueFaculties = [...new Set(mappedFaculties)];

        let extractedFakultas = "-";
        if (uniqueFaculties.length > 0) {
            extractedFakultas = uniqueFaculties.join(", "); 
        } else {
            extractedFakultas = formatSingkatanFakultas(bData.fakultas || batchFromState.fakultas) || "-";
        }

        const rawBatchName =
        bData.nama_batch ||
        bData.nomor_batch_upload ||
        firstItem.batch ||
        rawItem.nomor_batch_upload ||
        batchFromState.batch ||
        batchFromState.nomor_batch_upload ||
        currentBatchCode;

        const rawPeriode = bData.periode_label 
          || bData.periode 
          || firstItem.periode 
          || batchFromState.periode
          || "-";

        const rawTahunLulus = bData.tahun_lulus 
          || firstItem.tahun_lulus 
          || firstItem.tahun 
          || batchFromState.tahun
          || "-";

        const batchEmailStatus = batchFromState.status_email || formatStatusEmail(bData.status_email || bData.status_kirim);

        const mappedBatchData = {
          nama_batch: formatNamaBatch(rawBatchName),
          fakultas: extractedFakultas,
          tahun_lulus: rawTahunLulus,
          periode_label: formatPeriode(rawPeriode),
          total_record_label: `${mList.length} Mahasiswa`,
          status: displayLabel,
          status_email: batchEmailStatus, 
        };

        setBatchData(mappedBatchData);
        setMahasiswa(mList.map((m, index) => formatMahasiswa(m, index, mappedBatchData, displayLabel)));

      } catch (error) {
        console.error(`Gagal mengambil detail batch ${currentStatus}:`, error);
        setApiError(error.message || "Gagal mengambil data dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailBatch();
  }, [currentBatchCode, currentStatus]);

  const sortedMahasiswa = useMemo(() => {
    return [...mahasiswa].sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
  }, [mahasiswa]);

  const handleDetailMahasiswa = (item) => {
    const mahasiswaCode =
      item.mahasiswa_code ||
      item.mahasiswaCode ||
      item.uuid ||
      item.mahasiswa_uuid ||
      item.raw?.mahasiswa_code ||
      item.raw?.uuid ||
      item.id;

    if (!mahasiswaCode) {
      console.error("Mahasiswa code tidak ditemukan:", item);
      alert("Kode mahasiswa tidak ditemukan, gagal membuka detail.");
      return;
    }

    const safeMahasiswaCode = encodeURIComponent(mahasiswaCode);
        
    const formattedMahasiswa = {
      ...item,
      nama_mahasiswa: item.nama_mahasiswa || item.nama,
      program_studi: item.program_studi || item.prodi,
      tahun_lulus: item.tahun_lulus || item.tahun,
      fakultas: item.fakultas || batchData?.fakultas,
      batch: item.batch || batchData?.nama_batch,
    };

    const navState = { 
      state: { 
        mahasiswa: formattedMahasiswa, 
        batch: batchData,
        source: "dokumen_valid" 
      } 
    };

    if (userRole === "rektor") {
      navigate(`/rektor/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    } else if (userRole.includes("operator")) {
      navigate(`/operator/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    } else if (userRole.includes("admin")) {
      navigate(`/admin/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    } else {
      navigate(`/verifikator/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    }
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
      <div className="w-full pb-10 px-0 sm:px-0">

        {/* HEADER TITLE */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-[22px] sm:text-[28px] font-bold text-gray-900 tracking-tight capitalize">
            Detail Batch {displayLabel}
          </h1>
          <p className="text-[#9CA3AF] text-[13px] sm:text-[14px] font-medium capitalize mt-1">
            Daftar Mahasiswa dengan Status {displayLabel}
          </p>
          {apiError && (
            <p className="text-sm text-red-500 font-semibold mt-2">{apiError}</p>
          )}
        </div>

        {/* HEADER INFO — scroll horizontal di mobile, grid di tablet+ */}
        <div className="mb-5 sm:mb-6 px-4 sm:px-6 py-4 bg-white border border-gray-200 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#117065] rounded-l-xl"></div>

          {/* Mobile: 2-kolom grid rapi */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:hidden pl-2">
            <InfoItem label="No Batch" value={batchData.nama_batch} />
            <InfoItem label="Tahun Lulus" value={batchData.tahun_lulus} />
            <InfoItem label="Fakultas" value={batchData.fakultas} wide />
            <InfoItem label="Periode" value={batchData.periode_label} />
            <div className="col-span-2">
              <InfoItem label="Total Record" value={batchData.total_record_label} highlight />
            </div>
          </div>

          {/* Tablet/Desktop: flex row seperti semula */}
          <div className="hidden sm:flex flex-wrap items-center gap-x-12 gap-y-4 pl-2">
            <InfoItem label="No Batch" value={batchData.nama_batch} />
            <InfoItem label="Fakultas" value={batchData.fakultas} wide />
            <InfoItem label="Tahun Lulus" value={batchData.tahun_lulus} />
            <InfoItem label="Periode" value={batchData.periode_label} />
            <InfoItem label="Total Record" value={batchData.total_record_label} highlight />
          </div>
        </div>

        {/* TABEL — hanya tampil di md ke atas */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Wrapper scroll horizontal untuk layar sedang */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left" style={{ minWidth: "640px" }}>
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-center w-12 lg:w-16">No</th>
                  <th className="px-4 lg:px-6 py-4 text-left">Nama</th>
                  <th className="px-4 lg:px-6 py-4 text-center">NIM</th>
                  <th className="px-4 lg:px-6 py-4 text-center">Program Studi</th>
                  <th className="px-4 lg:px-6 py-4 text-center">Tahun Lulus</th>
                  <th className="px-4 lg:px-6 py-4 text-center">Status</th>
                  <th className="px-4 lg:px-6 py-4 text-center w-16 lg:w-20">Detail</th>
                </tr>
              </thead>
              <tbody>
                {sortedMahasiswa.length > 0 ? (
                  sortedMahasiswa.map((mhs, i) => (
                    <tr
                      key={mhs.id || mhs.id_mahasiswa || i}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-4 text-center font-bold text-gray-800">{i + 1}.</td>
                      <td className="px-4 lg:px-6 py-4 font-bold text-gray-900 max-w-[200px] lg:max-w-none truncate">{mhs.nama || "-"}</td>
                      <td className="px-4 lg:px-6 py-4 text-center text-gray-800 whitespace-nowrap">{mhs.nim || "-"}</td>
                      <td className="px-4 lg:px-6 py-4 text-center text-gray-800">{mhs.prodi || "-"}</td>
                      <td className="px-4 lg:px-6 py-4 text-center font-semibold text-gray-700 whitespace-nowrap">{mhs.tahun || mhs.tahun_lulus || "-"}</td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <span className={`inline-block min-w-[80px] lg:min-w-[86px] px-3 lg:px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(mhs.status)}`}>
                          {getBadgeLabel(mhs.status)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDetailMahasiswa(mhs)}
                          className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition"
                        >
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

        {/* KARTU LIST — hanya tampil di bawah md (mobile & small tablet) */}
        <div className="md:hidden space-y-3">
          {sortedMahasiswa.length > 0 ? (
            sortedMahasiswa.map((mhs, i) => (
              <MahasiswaCard
                key={mhs.id || mhs.id_mahasiswa || i}
                mhs={mhs}
                index={i}
                onDetail={handleDetailMahasiswa}
              />
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-8 text-center text-gray-400 capitalize shadow-sm">
              Data mahasiswa {currentStatus} tidak ditemukan.
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

// ==========================================
// HELPER KOMPONEN INFO ITEM
// ==========================================
const InfoItem = ({ label, value, wide = false, highlight = false }) => (
  <div className={wide ? "col-span-2 sm:col-span-1" : ""}>
    <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5 block">
      {label}
    </span>
    {highlight ? (
      <span className="text-[13px] sm:text-[14px] font-bold text-[#117065] bg-teal-50 px-2 py-0.5 rounded-md inline-block text-center w-fit">
        {value}
      </span>
    ) : (
      <span className="text-[13px] sm:text-[14px] font-bold text-gray-800 break-words">
        {value}
      </span>
    )}
  </div>
);

export default Statusbatch;