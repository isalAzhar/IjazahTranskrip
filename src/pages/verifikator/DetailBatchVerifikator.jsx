import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { BsSendFill } from "react-icons/bs";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getBatchDetail, revokeMahasiswa, approveBatch } from "@/services/api"; 
import { Icons } from "@/components/icon/DashboardIcons"; // Import ikon dari file terpisah

// Role level rektorat — backend handle
const REKTORAT_ROLES = ["tu_rektorat", "wakil_rektor_1", "rektor"];

// Deskripsi halaman
const ROLE_DESCRIPTION = {
  tu_fakultas:    "Kelola validasi dan kirim data mahasiswa ke Wakil Dekan",
  wakil_dekan_1:  "Kelola validasi dan kirim data mahasiswa ke Dekan",
  dekan:          "Kelola validasi dan kirim data mahasiswa ke TU Rektorat",
  tu_rektorat:    "Kelola validasi dan kirim data mahasiswa ke Wakil Rektor",
  wakil_rektor_1: "Kelola validasi dan kirim data mahasiswa ke Rektor",
  rektor:         "Kelola validasi dan penerbitan ijazah digital",
};

const DetailBatchVerifikator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { batchId } = useParams();
  const { user } = useAuth();

  const userRole = user?.role?.toLowerCase() || "";
  const isRektorat = REKTORAT_ROLES.includes(userRole);
  const pageDescription = ROLE_DESCRIPTION[userRole] ?? "Kelola validasi dan kirim data mahasiswa";

  // Tangkap data batch dari halaman Daftar Batch sebagai Fallback (Penyelamat)
  const batchFromState = location.state || {};

  const [students, setStudents] = useState([]);
  const [batchInfo, setBatchInfo] = useState({
    nomor_batch_upload: batchFromState.nomor_batch_upload || "-",
    nama_file: batchFromState.nama_file || "-",
    tahun_lulus: batchFromState.tahun_lulus || "-",
    periode: batchFromState.periode || "-",
    total_record: batchFromState.pending_count || 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // States Revoke
  const [showRevokeReason, setShowRevokeReason] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showRevokeSuccess, setShowRevokeSuccess] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // States Validasi
  const [showValConfirm, setShowValConfirm] = useState(false);
  const [showValSuccess, setShowValSuccess] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const fetchBatchDetail = async () => {
    setIsLoading(true);
    try {
      const response = await getBatchDetail(batchId);
      // Deteksi struktur data dari backend
      const dataApi = response.data?.batch || response.data || {};
      const rawStudents = response.data?.mahasiswa || response.data?.data || [];

      // Update Header Info
      setBatchInfo(prev => ({
        nomor_batch_upload: dataApi.nomor_batch_upload || prev.nomor_batch_upload,
        nama_file: dataApi.nama_file || prev.nama_file,
        tahun_lulus: dataApi.tahun_lulus || prev.tahun_lulus,
        periode: dataApi.periode || prev.periode,
        total_record: dataApi.total_record || prev.total_record,
      }));

      // 🔥 JURUS RAHASIA: Membuang mahasiswa yang statusnya revoke
      const activeStudents = rawStudents.filter((mhs) => {
        const isLocallyRevoked = sessionStorage.getItem(`revoked_${mhs.nim}`) === "true";
        const statusAPI = String(mhs.status || mhs.status_validasi || mhs.status_approval || "").toLowerCase();
        const isApiRevoked = statusAPI.includes("revoke") || statusAPI.includes("reject");
        
        return !isLocallyRevoked && !isApiRevoked;
      });

      setStudents(activeStudents);
      
      // Update sisa angka mahasiswa
      setBatchInfo(prev => ({ ...prev, total_record: activeStudents.length }));

    } catch (error) {
      console.error("Gagal mengambil detail batch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) fetchBatchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  // Handler Detail Mahasiswa 
  const handleDetailMahasiswa = (item) => {
    const safeNim = encodeURIComponent(item.nim);
    
    if (userRole === "rektor") {
      navigate(`/rektor/detail-mahasiswa/${safeNim}`, { state: { mahasiswa: item, batch: batchInfo } });
    } else if (userRole.includes("operator")) {
      navigate(`/operator/detail-mahasiswa/${safeNim}`, { state: { mahasiswa: item, batch: batchInfo } });
    } else {
      navigate(`/verifikator/detail-mahasiswa/${safeNim}`, { state: { mahasiswa: item, batch: batchInfo } });
    }
  };

  // --- LOGIKA REVOKE ---
  const handleOpenRevoke = (student) => { 
    setSelectedStudent(student); 
    setRevokeReason(""); 
    setShowRevokeReason(true); 
  };
  
  const handleSubmitRevokeReason = () => { 
    setShowRevokeReason(false); 
    setShowRevokeConfirm(true); 
  };
  
  const handleConfirmRevoke = async () => {
    if (!selectedStudent) return;
    setIsRevoking(true);
    try {
      await revokeMahasiswa(selectedStudent.nim, revokeReason);
      
      sessionStorage.setItem(`revoked_${selectedStudent.nim}`, "true");

      setStudents(prev => {
        const newStudents = prev.filter(s => s.nim !== selectedStudent.nim);
        setBatchInfo(info => ({ ...info, total_record: newStudents.length }));
        return newStudents;
      });

      setShowRevokeConfirm(false);
      setShowRevokeSuccess(true);
    } catch (error) {
      console.error("Gagal me-revoke mahasiswa:", error);
      alert(error.message || "Gagal me-revoke data.");
      setShowRevokeConfirm(false);
    } finally {
      setIsRevoking(false);
    }
  };
  
  const handleFinishRevoke = () => { 
    setShowRevokeSuccess(false); 
    setSelectedStudent(null); 
  };

  // --- LOGIKA VALIDASI ---
  const handleConfirmValidasi = async () => {
    setIsApproving(true);
    try {
      await approveBatch(batchId);
      setShowValConfirm(false);
      setShowValSuccess(true);
    } catch (error) {
      console.error("Gagal memvalidasi batch:", error);
      alert(error.message || "Gagal memvalidasi batch.");
      setShowValConfirm(false);
    } finally {
      setIsApproving(false);
    }
  };

  const handleFinishValidasi = () => {
    setShowValSuccess(false);
    navigate(userRole === "rektor" ? "/rektor/daftar-batch" : "/verifikator/daftar-batch");
  };

  const DetailIcon = () => <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>;

  return (
    <DashboardLayout title="Manajemen Data">
      <div className="w-full pb-10">

        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Manajemen Data</h1>
          <p className="text-[#9CA3AF] text-[14px] font-medium mt-1">{pageDescription}</p>
        </div>

        {/* INFO BATCH */}
        <div className="mb-6 px-6 py-4 bg-white border border-gray-200 rounded-xl flex flex-wrap items-center gap-x-12 gap-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#117065]"></div>
          
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Nama Batch</span>
            <span className="text-[14px] font-bold text-gray-800">{batchInfo.nomor_batch_upload}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Tahun Lulus</span>
            <span className="text-[14px] font-bold text-gray-800">{batchInfo.tahun_lulus}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Periode</span>
            <span className="text-[14px] font-bold text-gray-800">{batchInfo.periode}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Record</span>
            <span className="text-[14px] font-bold text-[#117065] bg-teal-50 px-2 py-0.5 rounded-md inline-block text-center w-fit">
              {batchInfo.total_record} Mahasiswa
            </span>
          </div>
        </div>

        {/* TABEL MAHASISWA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 w-[200px]">Nama</th>
                  <th className="py-4 px-6 text-center w-[160px]">NIM</th>
                  <th className="py-4 px-6 text-center">Program Studi</th>
                  <th className="py-4 px-6 text-center">Fakultas</th>
                  <th className="py-4 px-6 text-center w-[120px]">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center w-20">Detail</th>
                  <th className="py-4 px-6 text-center w-20">Revoke</th>
                </tr>
              </thead>
              <tbody className={`${isLoading ? "opacity-50" : ""} transition-opacity duration-200`}>
                {students.map((item, i) => (
                  <tr key={item.nim} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{i + 1}.</td>
                    <td className="py-4 px-6 font-bold text-gray-900">{item.nama_mahasiswa}</td>
                    <td className="py-4 px-6 text-center font-normal text-gray-800">{item.nim}</td>
                    <td className="py-4 px-6 text-center font-normal text-gray-800">{item.program_studi || "-"}</td>
                    <td className="py-4 px-6 text-center font-normal text-gray-800">{item.fakultas || "-"}</td>
                    <td className="py-4 px-6 text-center font-semibold text-gray-700">{item.tahun_lulus}</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => handleDetailMahasiswa(item)}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition flex-shrink-0">
                        <DetailIcon />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => handleOpenRevoke(item)}
                        className="inline-flex items-center justify-center p-1.5 w-8 h-8 rounded-md hover:bg-orange-200 bg-orange-100 transition-colors flex-shrink-0"
                        title="Revoke Mahasiswa">
                        {/* 🔥 2. PEMANGGILAN ICON YANG BENAR */}
                        <div className="scale-[0.85] flex items-center justify-center">
                          {Icons.Revoke}
                        </div>
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500 font-medium">
                      Semua data mahasiswa telah divalidasi atau di-revoke.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-5 border-t border-gray-100 flex justify-end bg-white">
            <button onClick={() => setShowValConfirm(true)} disabled={students.length === 0 || isLoading}
              className="bg-[#117065] text-white px-7 py-2.5 rounded-lg font-bold hover:bg-teal-800 transition shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <BsSendFill size={16} />
              Validasi Data
            </button>
          </div>
        </div>

        {/* MODAL 1: ALASAN REVOKE */}
        {showRevokeReason && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Alasan Revoke</h2>
              <p className="text-sm text-gray-400 mb-4">Mahasiswa: <span className="font-semibold text-gray-600">{selectedStudent?.nama_mahasiswa}</span></p>
              <textarea value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Berikan alasan revoke mahasiswa ini..."
                className="w-full bg-[#F3F4F6] border border-transparent focus:border-[#117065] focus:bg-white rounded-xl p-4 text-sm font-medium outline-none resize-none h-32 transition-colors placeholder-gray-400" />
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowRevokeReason(false)}
                  className="px-6 py-2.5 rounded-lg font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={handleSubmitRevokeReason} disabled={!revokeReason.trim()}
                  className="px-6 py-2.5 rounded-lg font-bold text-white bg-[#117065] hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Konfirmasi</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: KONFIRMASI REVOKE */}
        {showRevokeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="text-orange-500 text-3xl" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Apakah Anda yakin ingin melakukan revoke?</h2>
              <div className="flex justify-center gap-3 mt-8">
                <button onClick={() => setShowRevokeConfirm(false)} disabled={isRevoking}
                  className="flex-1 px-4 py-2.5 rounded-lg font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Batal</button>
                <button onClick={handleConfirmRevoke} disabled={isRevoking}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-75 disabled:cursor-wait">
                  {isRevoking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : "Revoke"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: REVOKE BERHASIL */}
        {showRevokeSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-8 text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-sm">
                <FiCheckCircle className="text-[#117065] text-5xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Revoke Berhasil</h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">Validasi dokumen telah berhasil dibatalkan dan status telah diperbarui</p>
              <button onClick={handleFinishRevoke}
                className="w-full px-4 py-3 rounded-xl font-bold text-white bg-[#117065] hover:bg-teal-800 transition-colors">Selesai</button>
            </div>
          </div>
        )}

        {/* MODAL VALIDASI 1: KONFIRMASI */}
        {showValConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-8 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-8">Apakah Anda yakin data ini sudah benar dan siap divalidasi?</h2>
              <div className="flex justify-center gap-3">
                <button onClick={() => setShowValConfirm(false)} disabled={isApproving}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Batal</button>
                <button onClick={handleConfirmValidasi} disabled={isApproving}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-[#117065] hover:bg-teal-800 disabled:opacity-75 disabled:cursor-wait">
                  {isApproving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : "Konfirmasi Validasi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL VALIDASI 2: SUKSES */}
        {showValSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-8 text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-sm">
                <FiCheckCircle className="text-[#117065] text-5xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Validasi Berhasil</h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">Data mahasiswa telah berhasil divalidasi dan diteruskan ke tahap berikutnya</p>
              <button onClick={handleFinishValidasi}
                className="w-full px-4 py-3 rounded-xl font-bold text-white bg-[#117065] hover:bg-teal-800 transition-colors">Selesai</button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default DetailBatchVerifikator;