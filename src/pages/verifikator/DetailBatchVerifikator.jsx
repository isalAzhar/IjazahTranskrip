import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { BsSendFill } from "react-icons/bs";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getBatchDetail, revokeMahasiswa, approveBatch } from "@/services/api";
import { Icons } from "@/components/icon/DashboardIcons";

const REKTORAT_ROLES = ["tu_rektorat", "wakil_rektor_1", "rektor"];

const formatPeriode = (periode) => {
  const map = {
    semester_ganjil: "Semester Ganjil",
    semester_genap: "Semester Genap",
    semester_pendek: "Semester Pendek",
  };
  return map[periode?.toLowerCase()] || periode || "-";
};

// 🔥 FIX: Kembalikan format ke aslinya (BATCH-20260605-I2Q2), gausah mapping tanggal
const formatNamaBatch = (kode) => {
  return kode || "-";
};

const ROLE_DESCRIPTION = {
  tu_fakultas: "Kelola validasi dan kirim data mahasiswa ke Wakil Dekan",
  wakil_dekan_1: "Kelola validasi dan kirim data mahasiswa ke Dekan",
  dekan: "Kelola validasi dan kirim data mahasiswa ke TU Rektorat",
  tu_rektorat: "Kelola validasi dan kirim data mahasiswa ke Wakil Rektor",
  wakil_rektor_1: "Kelola validasi dan kirim data mahasiswa ke Rektor",
  rektor: "Kelola validasi dan penerbitan ijazah digital",
};

const DetailBatchVerifikator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { batchCode, batchId, id } = useParams();
  const currentBatchCode = decodeURIComponent(batchCode || batchId || id || "");
  const { user } = useAuth();

  const userRole = user?.role?.toLowerCase() || "";
  const isRektor = userRole === "rektor";
  const pageDescription = ROLE_DESCRIPTION[userRole] ?? "Kelola validasi dan kirim data mahasiswa";

  const batchFromState = location.state?.batch || location.state || {};
  const [students, setStudents] = useState([]);
  const [batchInfo, setBatchInfo] = useState({
  nomor_batch_upload: batchFromState.nomor_batch_upload || batchFromState.batch || "-",
  nama_file:  batchFromState.nama_file || "-",
  tahun_lulus: batchFromState.tahun_lulus || batchFromState.tahun || "-",
  periode: batchFromState.periode || "-",
  total_record: batchFromState.pending_count || batchFromState.total || 0,
});
 
  const [isLoading, setIsLoading] = useState(true);

  const [showRevokeReason, setShowRevokeReason] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showRevokeSuccess, setShowRevokeSuccess] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const [showValConfirm, setShowValConfirm] = useState(false);
  const [showValSuccess, setShowValSuccess] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalResult, setApprovalResult] = useState(null);
  const [finalProcess, setFinalProcess] = useState(null);

 const fetchBatchDetail = async () => {
  if (!currentBatchCode) {
    console.error("Kode batch tidak ditemukan.");
    setIsLoading(false);
    return;
  }

  setIsLoading(true);

  try {
    const response = await getBatchDetail(currentBatchCode);

    const dataApi =
      response.data?.batch ||
      response.data ||
      {};

    const rawStudents =
      response.data?.mahasiswa ||
      response.data?.data ||
      [];

    setBatchInfo((prev) => ({
      nomor_batch_upload:
        dataApi.nomor_batch_upload ||
        prev.nomor_batch_upload,

      nama_file:
        dataApi.nama_file ||
        prev.nama_file,

      tahun_lulus:
        dataApi.tahun_lulus ||
        prev.tahun_lulus,

      periode:
        dataApi.periode ||
        prev.periode,

      total_record:
        dataApi.total_record ||
        dataApi.pending_count ||
        prev.total_record,
    }));

    const activeStudents = rawStudents.filter((mhs) => {
      const isLocallyRevoked =
        sessionStorage.getItem(`revoked_${mhs.nim}`) === "true";

      const statusAPI = String(
        mhs.status ||
        mhs.status_validasi ||
        mhs.status_approval ||
        ""
      ).toLowerCase();

      const isApiRevoked =
        statusAPI.includes("revoke") ||
        statusAPI.includes("reject");

      return !isLocallyRevoked && !isApiRevoked;
    });

    setStudents(activeStudents);

    setBatchInfo((prev) => ({
      ...prev,
      total_record: activeStudents.length,
    }));
  } catch (error) {
    console.error("Gagal mengambil detail batch:", error);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchBatchDetail();
  }, [currentBatchCode, location.state?.refresh]);

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

  const path =
    userRole === "rektor"
      ? "/rektor"
      : userRole.includes("operator")
      ? "/operator"
      : "/verifikator";

  navigate(`${path}/detail-mahasiswa/${encodeURIComponent(mahasiswaCode)}`, {
    state: {
      mahasiswa: item,
      batch: batchInfo,
    },
  });
};

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
      const mahasiswaCode =
      selectedStudent.mahasiswa_code ||
      selectedStudent.mahasiswaCode ||
      selectedStudent.uuid ||
      selectedStudent.mahasiswa_uuid ||
      selectedStudent.raw?.mahasiswa_code ||
      selectedStudent.raw?.uuid;
    if (!mahasiswaCode) {
   throw new Error("Kode mahasiswa tidak ditemukan dari response API.");
}

await revokeMahasiswa(mahasiswaCode, revokeReason);
      sessionStorage.setItem(`revoked_${selectedStudent.nim}`, "true");
      setStudents(prev => {
        const newStudents = prev.filter(s => s.nim !== selectedStudent.nim);
        setBatchInfo(info => ({ ...info, total_record: newStudents.length }));
        return newStudents;
      });
      setShowRevokeConfirm(false);
      setShowRevokeSuccess(true);
    } catch (error) {
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

  const getFinalProcessFromResponse = (response) => {
    return response?.data?.final_process || response?.data?.approval?.final_process || response?.final_process || null;
  };

  const handleConfirmValidasi = async () => {
    setIsApproving(true);
    try {
      const response = await approveBatch(currentBatchCode);
      setApprovalResult(response);
      setFinalProcess(getFinalProcessFromResponse(response));
      setShowValConfirm(false);
      setShowValSuccess(true);
    } catch (error) {
      alert(error.message || error?.response?.data?.message || "Gagal memvalidasi batch.");
      setShowValConfirm(false);
    } finally {
      setIsApproving(false);
    }
  };

  const handleFinishValidasi = () => {
    setShowValSuccess(false);
    navigate(isRektor ? "/rektor/daftar-batch" : "/verifikator/daftar-batch", {
      replace: true,
      state: { refresh: true, message: isRektor ? "Dokumen berhasil diterbitkan." : "Data berhasil divalidasi." },
    });
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
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">No Batch</span>
           <span className="text-[14px] font-bold text-gray-800">{formatNamaBatch(batchInfo.nomor_batch_upload)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Tahun Lulus</span>
            <span className="text-[14px] font-bold text-gray-800">{batchInfo.tahun_lulus}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Periode</span>
            <span className="text-[14px] font-bold text-gray-800">{formatPeriode(batchInfo.periode)}</span>
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
              <tbody className={`${isLoading ? "opacity-50" : ""}`}>
                {students.map((item, i) => (
                  <tr key={item.nim} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{i + 1}.</td>
                    <td className="py-4 px-6 font-bold text-gray-900">{item.nama_mahasiswa}</td>
                    <td className="py-4 px-6 text-center text-gray-800">{item.nim}</td>
                    <td className="py-4 px-6 text-center text-gray-800">{item.program_studi || "-"}</td>
                    <td className="py-4 px-6 text-center text-gray-800">{item.fakultas || "-"}</td>
                    <td className="py-4 px-6 text-center font-semibold text-gray-700">{item.tahun_lulus}</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => handleDetailMahasiswa(item)} className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto hover:bg-gray-200">
                        <DetailIcon />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => handleOpenRevoke(item)} className="p-1.5 w-8 h-8 rounded-md hover:bg-orange-200 bg-orange-100 text-orange-500 flex items-center justify-center mx-auto" title="Revoke Mahasiswa">
                        <div className="scale-[0.85]">{Icons.Revoke}</div>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5 border-t border-gray-100 flex justify-end bg-white">
            <button onClick={() => setShowValConfirm(true)} disabled={students.length === 0 || isLoading}
              className="bg-[#117065] text-white px-7 py-2.5 rounded-lg font-bold hover:bg-teal-800 flex items-center gap-2 disabled:opacity-50">
              <BsSendFill size={16} /> {isRektor ? "Validasi Dokumen" : "Validasi Data"}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: INPUT ALASAN REVOKE */}
      {showRevokeReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <FiAlertTriangle className="text-yellow-500" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-[16px]">Revoke Mahasiswa</h3>
                <p className="text-gray-500 text-[13px]">{selectedStudent?.nama_mahasiswa} — {selectedStudent?.nim}</p>
              </div>
            </div>
            <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Alasan Revoke</label>
            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Tuliskan alasan revoke mahasiswa ini..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 resize-none"
            />
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowRevokeReason(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleSubmitRevokeReason} disabled={!revokeReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-yellow-500 text-white font-bold text-sm hover:bg-yellow-600 disabled:opacity-50">
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI REVOKE */}
      {showRevokeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <FiAlertTriangle className="text-yellow-500" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-[16px]">Konfirmasi Revoke</h3>
                <p className="text-gray-500 text-[13px]">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-[13px] text-gray-700 mb-2">Mahasiswa: <span className="font-bold">{selectedStudent?.nama_mahasiswa}</span></p>
            <p className="text-[13px] text-gray-700 mb-4">Alasan: <span className="font-bold">{revokeReason}</span></p>
            <div className="flex gap-3">
              <button onClick={() => setShowRevokeConfirm(false)} disabled={isRevoking}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleConfirmRevoke} disabled={isRevoking}
                className="flex-1 py-2.5 rounded-xl bg-yellow-500 text-white font-bold text-sm hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center gap-2">
                {isRevoking ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> : "Ya, Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVOKE BERHASIL */}
      {showRevokeSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-md mx-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-green-500" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-[17px] mb-2">Revoke Berhasil</h3>
            <p className="text-gray-500 text-[13px] mb-6">Data mahasiswa berhasil di-revoke dari batch ini.</p>
            <button onClick={handleFinishRevoke}
              className="w-full py-2.5 rounded-xl bg-[#117065] text-white font-bold text-sm hover:bg-teal-800">
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI VALIDASI */}
      {showValConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <BsSendFill className="text-[#117065]" size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-[16px]">{isRektor ? "Validasi Dokumen" : "Validasi Data"}</h3>
                <p className="text-gray-500 text-[13px]">Total {batchInfo.total_record} mahasiswa akan divalidasi</p>
              </div>
            </div>
            <p className="text-[13px] text-gray-600 mb-5">Pastikan semua data sudah benar sebelum melanjutkan proses validasi.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowValConfirm(false)} disabled={isApproving}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleConfirmValidasi} disabled={isApproving}
                className="flex-1 py-2.5 rounded-xl bg-[#117065] text-white font-bold text-sm hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center gap-2">
                {isApproving ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> : "Ya, Validasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VALIDASI BERHASIL */}
      {showValSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-md mx-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-green-500" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-[17px] mb-2">
              {isRektor ? "Dokumen Berhasil Diterbitkan!" : "Data Berhasil Divalidasi!"}
            </h3>
            <p className="text-gray-500 text-[13px] mb-6">
              {isRektor ? "Ijazah digital telah resmi diterbitkan." : "Data batch telah dikirim ke tahap validasi berikutnya."}
            </p>
            <button onClick={handleFinishValidasi}
              className="w-full py-2.5 rounded-xl bg-[#117065] text-white font-bold text-sm hover:bg-teal-800">
              Selesai
            </button>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default DetailBatchVerifikator;