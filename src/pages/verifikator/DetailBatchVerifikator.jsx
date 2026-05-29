import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { TbArrowBackUp } from "react-icons/tb";
import { BsSendFill } from "react-icons/bs";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { useAuth } from "../context/AuthContext"; // 🔥 sesuaikan path auth kamu

// 🔥 Mapping role → deskripsi tujuan kirim data
const ROLE_DESCRIPTION = {
  verifikator:   "Kelola validasi dan kirim data mahasiswa ke Dekan Fakultas",
  dekan:         "Kelola validasi dan kirim data mahasiswa ke TU Rektorat",
  tu_fakultas:   "Kelola validasi dan kirim data mahasiswa ke Verifikator",
  tu_rektorat:   "Kelola validasi dan kirim data mahasiswa ke Arsip Pusat",
  // tambahkan role lain sesuai kebutuhan
};

const DUMMY_STUDENTS = [
  { no: 1,  nama: "Adi Saputra",      nim: "231106040902", prodi: "Teknik Informatika", tahun: 2026, status: "Proses" },
  { no: 2,  nama: "Rani Maharani",    nim: "231106040903", prodi: "Teknik Mesin",        tahun: 2026, status: "Proses" },
  { no: 3,  nama: "Budi Pratama",     nim: "231106040910", prodi: "Teknik Sipil",        tahun: 2026, status: "Proses" },
  { no: 4,  nama: "Kayla Key",        nim: "231106040912", prodi: "Sistem Informasi",    tahun: 2026, status: "Proses" },
  { no: 5,  nama: "Rizky Gusti A",    nim: "231106040839", prodi: "Teknik Informatika",  tahun: 2026, status: "Proses" },
  { no: 6,  nama: "Risma Puspita",    nim: "231106040290", prodi: "Teknik Elektro",      tahun: 2026, status: "Proses" },
  { no: 7,  nama: "Dimas Anggara",    nim: "231106040291", prodi: "Manajemen",           tahun: 2026, status: "Proses" },
  { no: 8,  nama: "Siti Nurhaliza",   nim: "231106040292", prodi: "Pendidikan Agama Islam", tahun: 2026, status: "Proses" },
  { no: 9,  nama: "Ahmad Fauzi",      nim: "231106040293", prodi: "Manajemen Haji",      tahun: 2026, status: "Proses" },
  { no: 10, nama: "Chelsea Islan",    nim: "231106040294", prodi: "Akuntansi",           tahun: 2026, status: "Proses" },
];

const DetailBatchVerifikator = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 🔥 ambil user dari auth — { role: "dekan", nama: "..." }

  // 🔥 Ambil deskripsi sesuai role, fallback kalau role tidak dikenali
  const pageDescription = ROLE_DESCRIPTION[user?.role] ?? "Kelola validasi dan kirim data mahasiswa";

  const [students, setStudents] = useState(DUMMY_STUDENTS);

  const [showRevokeReason, setShowRevokeReason] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showRevokeSuccess, setShowRevokeSuccess] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [showValConfirm, setShowValConfirm] = useState(false);
  const [showValSuccess, setShowValSuccess] = useState(false);

  const handleOpenRevoke = (student) => { setSelectedStudent(student); setRevokeReason(""); setShowRevokeReason(true); };
  const handleSubmitRevokeReason = () => { setShowRevokeReason(false); setShowRevokeConfirm(true); };
  const handleConfirmRevoke = () => {
    setShowRevokeConfirm(false);
    setStudents(prev => prev.map(s => s.nim === selectedStudent.nim ? { ...s, status: "Revoke" } : s));
    setShowRevokeSuccess(true);
  };
  const handleFinishRevoke = () => { setShowRevokeSuccess(false); setSelectedStudent(null); };
  const handleConfirmValidasi = () => { setShowValConfirm(false); setShowValSuccess(true); };
  const handleFinishValidasi = () => { setShowValSuccess(false); navigate("/verifikator/daftar-batch"); };

  const DetailIcon = () => <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>;

  return (
    <DashboardLayout title="Manajemen Data">
      <div className="w-full pb-10">

        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Manajemen Data</h1>
          {/* 🔥 Teks menyesuaikan role login */}
          <p className="text-[#9CA3AF] text-[14px] font-medium mt-1">{pageDescription}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 w-[200px]">Nama</th>
                  <th className="py-4 px-6 text-center w-[160px]">NIM</th>
                  <th className="py-4 px-6 text-center">Program Studi</th>
                  <th className="py-4 px-6 text-center w-[120px]">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center w-[120px]">Status</th>
                  <th className="py-4 px-6 text-center w-20">Detail</th>
                  <th className="py-4 px-6 text-center w-20">Revoke</th>
                </tr>
              </thead>
              <tbody>
                {students.map((item, i) => (
                  <tr key={item.nim} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{i + 1}.</td>
                    <td className="py-4 px-6 font-bold text-gray-900">{item.nama}</td>
                    <td className="py-4 px-6 text-center font-normal text-gray-800">{item.nim}</td>
                    <td className="py-4 px-6 text-center font-normal text-gray-800">{item.prodi}</td>
                    <td className="py-4 px-6 text-center font-semibold text-gray-700">{item.tahun}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-5 py-1.5 rounded-full text-xs font-bold text-white ${item.status === 'Proses' ? 'bg-[#3B82F6]' : 'bg-[#F59E0B]'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => navigate(`/detail-mahasiswa/${item.nim}`, { state: item })}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition flex-shrink-0">
                        <DetailIcon />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => handleOpenRevoke(item)} disabled={item.status !== "Proses"}
                        className="inline-flex items-center justify-center p-1.5 w-8 h-8 rounded-md hover:bg-orange-200 bg-orange-100 text-orange-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Revoke Mahasiswa">
                        <TbArrowBackUp size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-5 border-t border-gray-100 flex justify-end bg-white">
            <button onClick={() => setShowValConfirm(true)}
              className="bg-[#117065] text-white px-7 py-2.5 rounded-lg font-bold hover:bg-teal-800 transition shadow-sm flex items-center gap-2">
              <BsSendFill size={16} />
              Validasi
            </button>
          </div>
        </div>

        {/* MODAL 1: ALASAN REVOKE */}
        {showRevokeReason && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Alasan Revoke</h2>
              <textarea value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Berikan Alasan Revoke..."
                className="w-full bg-[#F3F4F6] border border-transparent focus:border-[#117065] focus:bg-white rounded-xl p-4 text-sm font-medium outline-none resize-none h-32 transition-colors placeholder-gray-400">
              </textarea>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowRevokeReason(false)} className="px-6 py-2.5 rounded-lg font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={handleSubmitRevokeReason} disabled={!revokeReason.trim()} className="px-6 py-2.5 rounded-lg font-bold text-white bg-[#117065] hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Konfirmasi</button>
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
                <button onClick={() => setShowRevokeConfirm(false)} className="flex-1 px-4 py-2.5 rounded-lg font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={handleConfirmRevoke} className="flex-1 px-4 py-2.5 rounded-lg font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors">Revoke</button>
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
              <button onClick={handleFinishRevoke} className="w-full px-4 py-3 rounded-xl font-bold text-white bg-[#117065] hover:bg-teal-800 transition-colors">Selesai</button>
            </div>
          </div>
        )}

        {/* MODAL VALIDASI 1: KONFIRMASI */}
        {showValConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-8 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-8">Apakah Anda yakin data ini sudah benar dan siap di Validasi?</h2>
              <div className="flex justify-center gap-3">
                <button onClick={() => setShowValConfirm(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={handleConfirmValidasi} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[#117065] hover:bg-teal-800 transition-colors">Konfirmasi Validasi</button>
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
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">Data mahasiswa telah berhasil di Validasi dan melanjutkan proses Validasi ke TU Rektorat</p>
              <button onClick={handleFinishValidasi} className="w-full px-4 py-3 rounded-xl font-bold text-white bg-[#117065] hover:bg-teal-800 transition-colors">Selesai</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DetailBatchVerifikator;