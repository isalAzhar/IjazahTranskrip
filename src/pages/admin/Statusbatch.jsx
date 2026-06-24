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
        const rawItem = firstItem.raw || firstItem || {}; 
        
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

        // 🔥 LOGIC JARING PENANGKAP DATA (AMAN DARI BUG REFRESH EXTENSION MOBILE)
        const rawBatchName =
          batchFromState.nama_batch ||
          batchFromState.batch ||
          batchFromState.nomor_batch_upload ||
          bData.nama_batch ||
          bData.batch ||
          bData.batch_name ||
          bData.nomor_batch_upload ||
          firstItem.nama_batch ||
          firstItem.batch ||
          firstItem.batch_name ||
          firstItem.nomor_batch_upload ||
          rawItem.nama_batch ||
          rawItem.batch ||
          rawItem.batch_name ||
          rawItem.nomor_batch_upload ||
          currentBatchCode;

        const rawPeriode = 
          batchFromState.periode_label ||
          batchFromState.periode ||
          batchFromState.semester ||
          bData.periode_label || 
          bData.periode || 
          bData.semester ||
          firstItem.periode_label || 
          firstItem.periode || 
          firstItem.semester ||
          rawItem.periode_label || 
          rawItem.periode || 
          rawItem.semester ||
          "-";

        const rawTahunLulus = 
          batchFromState.tahun_lulus ||
          batchFromState.tahun ||
          bData.tahun_lulus || 
          bData.tahun ||
          firstItem.tahun_lulus || 
          firstItem.tahun || 
          rawItem.tahun_lulus ||
          rawItem.tahun ||
          "-";

        const batchEmailStatus = batchFromState.status_email || formatStatusEmail(bData.status_email || bData.status_kirim);

        const mappedBatchData = {
          nama_batch: formatNamaBatch(rawBatchName),
          fakultas: extractedFakultas,
          tahun_lulus: rawTahunLulus,
          periode_label: formatPeriode(rawPeriode),
          total_record_label: mList.length > 0 ? `${mList.length} Mahasiswa` : "-",
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
  }, [currentBatchCode, currentStatus, batchFromState]);

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
        source: "status_batch" 
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
      <div className="w-full pb-10">
        
        {/* HEADER TITLE */}
        <div className="mb-6 px-1 sm:px-0">
          <h1 className="text-xl sm:text-[28px] font-bold text-gray-900 tracking-tight capitalize">
            Detail Batch {displayLabel}
          </h1>
          <p className="text-[#9CA3AF] text-xs sm:text-[14px] font-medium capitalize mt-1">
            Daftar Mahasiswa dengan Status {displayLabel}
          </p>
          {apiError && <p className="text-sm text-red-500 font-semibold mt-2">{apiError}</p>}
        </div>

        {/* 🔥 HEADER INFO BOX (Layout Persis Sesuai Gambar) 🔥 */}
        <div className="mb-6 px-6 py-4 bg-white border border-gray-200 rounded-xl flex flex-wrap items-center gap-x-12 gap-y-4 shadow-sm relative overflow-hidden">
          {/* Garis Hijau di sebelah kiri */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#117065]"></div>
          
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">No Batch</span>
            <span className="text-[14px] font-bold text-gray-800">{batchData.nama_batch}</span>
          </div>

          <div className="flex flex-col max-w-md">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Fakultas</span>
            <span className="text-[14px] font-bold text-gray-800 break-words">{batchData.fakultas}</span>
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
       

       {/* 🔥 TAMPILAN KARTU (Hanya untuk Mobile) 🔥 */}
        <div className="block md:hidden space-y-4">
          {sortedMahasiswa.length > 0 ? (
            sortedMahasiswa.map((mhs, i) => (
              <div key={mhs.id || mhs.id_mahasiswa || i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <span className="font-bold text-gray-400 mt-0.5">{i + 1}.</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-[16px] leading-tight pr-2">{mhs.nama || "-"}</h3>
                      <p className="text-[13px] text-gray-500 mt-1">{mhs.nim || "-"}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDetailMahasiswa(mhs)} className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center text-gray-500 bg-white shadow-sm hover:bg-gray-50 shrink-0">
                     <div className="w-4 h-3.5 border-t-2 border-b-2 border-gray-400"></div>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Program Studi</p>
                    <p className="text-[13px] font-bold text-gray-800">{mhs.prodi || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tahun Lulus</p>
                    <p className="text-[13px] font-bold text-gray-800">{mhs.tahun || mhs.tahun_lulus || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${getBadgeColor(mhs.status)}`}>
                    {getBadgeLabel(mhs.status)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-xl">
              Data mahasiswa {currentStatus} tidak ditemukan.
            </div>
          )}
        </div>

        {/* 🔥 TAMPILAN TABEL UNTUK DESKTOP (DISEMBUNYIKAN DI HP) 🔥 */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left table-fixed">
              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[25%]" />
                <col className="w-[17%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-center whitespace-nowrap">No</th>
                  <th className="px-6 py-4 text-left whitespace-nowrap">Nama</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">NIM</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Program Studi</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Tahun Lulus</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Detail</th>
                </tr>
              </thead>
              <tbody>
                {sortedMahasiswa.length > 0 ? (
                  sortedMahasiswa.map((mhs, i) => (
                    <tr key={mhs.id || mhs.id_mahasiswa || i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-gray-800">{i + 1}.</td>
                      <td className="px-6 py-4 font-bold text-gray-900 truncate" title={mhs.nama}>{mhs.nama || "-"}</td>
                      <td className="px-6 py-4 text-center text-gray-800 truncate" title={mhs.nim}>{mhs.nim || "-"}</td>
                      <td className="px-6 py-4 text-center text-gray-800 truncate" title={mhs.prodi}>{mhs.prodi || "-"}</td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{mhs.tahun || mhs.tahun_lulus || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold shadow-sm whitespace-nowrap ${getBadgeColor(mhs.status)}`}>
                          {getBadgeLabel(mhs.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button type="button" onClick={() => handleDetailMahasiswa(mhs)} className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition">
                          <div className="w-3.5 h-3.5 border-t-2 border-b-2 border-gray-500"></div>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium capitalize">
                      Data mahasiswa {currentStatus} tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  );
};

export default Statusbatch;