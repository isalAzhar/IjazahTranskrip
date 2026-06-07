import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
// 🔥 Pastikan path ke DashboardLayout sudah benar
import DashboardLayout from "@/components/ui/DashboardLayout";
import { FiUser, FiBook, FiFileText, FiArrowLeft, FiAlertCircle, FiExternalLink } from "react-icons/fi";
import { getAkademikProfile } from "@/services/api"; 
import { useAuth } from "../context/AuthContext"; // 🔥 Pastikan path ke AuthContext benar

// Helper untuk format tanggal dari backend
const formatTanggal = (value) => {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    return "-";
  }
};

const DetailMahasiswa = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { nim } = useParams();
  const auth = useAuth();

  const user = auth?.user || null;
  const userRole = user?.role?.toLowerCase() || "";

  // Tangkap data state dari halaman RektorDokumenValid atau Pelaporan (termasuk properti source)
  const laporanState = location.state?.mahasiswa || location.state || {};

  // 🔥 Logika Role & Konteks untuk Link Dokumen Valid
  // Hanya muncul jika role adalah operator/rektor DAN datang dari halaman "dokumen_valid"
  const isFromDokumenValid = location.state?.source === "dokumen_valid" || laporanState?.source === "dokumen_valid";
  const showLinkDokumen = ["rektor", "operator", "operator_data"].includes(userRole) && isFromDokumenValid;

  // States Komponen
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fungsi fetch data ke backend
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getAkademikProfile(nim);
      setProfile(result.data);
    } catch (err) {
      console.error("Gagal mengambil detail mahasiswa:", err);
      setError(
        err?.message ||
        err?.response?.data?.message ||
        "Gagal mengambil detail mahasiswa dari server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (nim) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nim]);

  // 🔥 STRATEGI BINDING AMAN: 
  // Ekstrak data dari API ATAU gunakan state navigasi sebagai fallback sementara
  const mahasiswa = profile?.mahasiswa || {
    nama_mahasiswa: laporanState.nama_mahasiswa || laporanState.nama,
    nim: laporanState.nim,
    foto: laporanState.foto
  };
  
  const akademik = profile?.akademik || {
    fakultas: laporanState.fakultas,
    program_studi: laporanState.program_studi || laporanState.prodi,
  };
  
  const batch = profile?.batch || {
    nomor_batch_upload: laporanState.batch || laporanState.nomor_batch_upload
  };

  const statusInfo = profile?.status || {};
  const rawTranskrip = profile?.transkrip;
  const transkrip = Array.isArray(rawTranskrip) ? rawTranskrip : []; 

  // Sinkronisasi status validasi
  const laporanStatus = laporanState?.status || (statusInfo?.status_validasi === "approved" ? "Proses" : statusInfo?.status_validasi) || "terbit";
  const laporanKeterangan = laporanState?.keterangan || statusInfo?.catatan || "Data mahasiswa dalam proses validasi";

  const getStatusUI = (statusValue) => {
    const s = String(statusValue || "").toLowerCase(); 
    if (s.includes("terbit")) return { bg: "bg-[#22C55E]", text: "Terbit", sub1: "Di Validasi oleh Rektor", sub2: "Data terverifikasi sah dalam pangkalan data universitas" };
    if (s.includes("proses") || s.includes("approved") || s.includes("pending")) return { bg: "bg-[#2879B9]", text: "Proses", sub1: "Proses Validasi oleh Operator", sub2: "Data masih dalam pengecekan dan proses validasi" };
    if (s.includes("reject") || s.includes("rejected")) return { bg: "bg-[#DC2626]", text: "Reject", sub1: "Ditolak oleh Verifikator", sub2: statusInfo?.catatan || "Terdapat ketidaksesuaian data yang perlu diperbaiki" };
    if (s.includes("revoke") || s.includes("revoked")) return { bg: "bg-[#EAB308]", text: "Revoke", sub1: "Di Revoke oleh Wakil Dekan", sub2: statusInfo?.catatan || "Mahasiswa dikeluarkan dari proses validasi" };
    return { bg: "bg-gray-400", text: statusValue || "-", sub1: laporanKeterangan || "-", sub2: statusInfo?.catatan || "-" };
  };

  const statusUI = getStatusUI(laporanStatus);

  // VIEW: LOADING
  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#115E59] mx-auto mb-4"></div>
          <p className="text-gray-500 font-semibold text-sm">Memuat data dari server...</p>
        </div>
      </DashboardLayout>
    );
  }

  // VIEW: ERROR (Tombol kembali tetap disisakan di sini agar user tidak terjebak jika error)
  if (error) {
    return (
      <DashboardLayout>
        <div className="w-full text-center py-16 px-4">
          <p className="text-red-500 mb-4 font-bold text-lg">{error}</p>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm">
            <FiArrowLeft /> Kembali ke halaman sebelumnya
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // 🔥 VIEW: DATA KOSONG 
  // Sekarang mengecek: Jika profile API kosong DAN data navigasi (nim) juga kosong, baru tampilkan "Tidak Ditemukan"
  if (!profile && !mahasiswa.nim) {
    return (
      <DashboardLayout>
        <div className="w-full text-center py-16">
          <p className="text-gray-500 mb-4 font-medium text-base">Data mahasiswa tidak ditemukan.</p>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm">
            <FiArrowLeft /> Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full pb-10 pt-2">
        
        {/* PROFILE CARD */}
        <div className="bg-white rounded-xl px-8 py-6 flex justify-between items-center mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-6">
            <div className="w-[85px] h-[85px] rounded-full bg-[#E5F3EB] text-gray-800 overflow-hidden flex items-center justify-center font-medium text-sm">
              {mahasiswa.foto ? (
                <img src={mahasiswa.foto} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                "-Foto"
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-bold text-[20px] text-gray-900">{mahasiswa.nama_mahasiswa || "-"}</h2>
              <p className="text-[13px] text-gray-500 font-medium">NIM: {mahasiswa.nim || "-"}</p>
              <div className="mt-0.5">
                <span className="inline-block bg-[#117065] text-white text-[11px] px-4 py-1.5 rounded-full font-bold shadow-sm tracking-wide">
                  {batch.nomor_batch_upload || "BELUM TERDAFTAR"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-1.5">
            <span className={`${statusUI.bg} text-white text-[12px] px-6 py-1.5 rounded-full font-bold shadow-sm`}>
              {statusUI.text}
            </span>
            <p className="text-[12px] text-gray-900 font-bold mt-1">{statusUI.sub1}</p>
            <p className="text-[11px] text-gray-400 font-medium">{statusUI.sub2}</p>

            {/* 🔥 FILTER LINK DOKUMEN VALID HANYA UNTUK OPERATOR & REKTOR DARI KONTEKS DOKUMEN VALID */}
            {showLinkDokumen && (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const targetRoute = userRole.includes("operator") ? "/operator/dokumen-valid" : "/rektor/dokumen-valid";
                  navigate(targetRoute);
                }}
                className="mt-2 flex items-center gap-1.5 text-[#117065] text-[12px] font-bold hover:underline hover:text-teal-800 transition-colors"
              >
                Link Dokumen Valid  
                <FiExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* INFORMASI PRIBADI */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-[#F9FAFB] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
              <FiUser size={16} className="text-gray-700" />
              <h3 className="text-[14px] font-bold text-gray-800">Informasi Pribadi</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4 text-[13px]">
              <div><p className="text-gray-400 mb-1.5 font-medium">Nama</p><p className="font-bold text-gray-900">{mahasiswa.nama_mahasiswa || "-"}</p></div>
              <div><p className="text-gray-400 mb-1.5 font-medium">NIM</p><p className="font-bold text-gray-900">{mahasiswa.nim || "-"}</p></div>
              
              <div><p className="text-gray-400 mb-1.5 font-medium">NIK</p><p className="font-bold text-gray-900">{mahasiswa.nik || "-"}</p></div>
              <div><p className="text-gray-400 mb-1.5 font-medium">Nomor Seri Ijazah</p><p className="font-bold text-gray-900">{mahasiswa.nomor_seri_ijazah || "-"}</p></div>
              
              <div><p className="text-gray-400 mb-1.5 font-medium">PISN</p><p className="font-bold text-gray-900">{mahasiswa.pisn || "-"}</p></div>
              <div><p className="text-gray-400 mb-1.5 font-medium">Tempat, Tanggal Lahir</p><p className="font-bold text-gray-900">{mahasiswa.tempat_lahir || "-"}, {formatTanggal(mahasiswa.tanggal_lahir)}</p></div>
              
              <div><p className="text-gray-400 mb-1.5 font-medium">Jenis Kelamin</p><p className="font-bold text-gray-900">{mahasiswa.jenis_kelamin || "-"}</p></div>
              <div><p className="text-gray-400 mb-1.5 font-medium">Email</p><p className="font-bold text-gray-900">{mahasiswa.email || "-"}</p></div>
              
              <div><p className="text-gray-400 mb-1.5 font-medium">No Telepon</p><p className="font-bold text-gray-900">{mahasiswa.telepon || "-"}</p></div>
            </div>
          </div>

          {/* INFORMASI AKADEMIK */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-[#F9FAFB] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
              <FiBook size={16} className="text-gray-700" />
              <h3 className="text-[14px] font-bold text-gray-800">Informasi Akademik</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4 text-[13px]">
              <div><p className="text-gray-400 mb-1.5 font-medium">Fakultas</p><p className="font-bold text-gray-900">{akademik.fakultas || "-"}</p></div>
              <div><p className="text-gray-400 mb-1.5 font-medium">Program Studi</p><p className="font-bold text-gray-900">{akademik.program_studi || "-"}</p></div>
              
              <div><p className="text-gray-400 mb-1.5 font-medium">Tahun Masuk</p><p className="font-bold text-gray-900">{akademik.tahun_masuk || "-"}</p></div>
              <div><p className="text-gray-400 mb-1.5 font-medium">Tahun Lulus</p><p className="font-bold text-gray-900">{akademik.tahun_lulus || "-"}</p></div>
              
              <div><p className="text-gray-400 mb-1.5 font-medium">Tanggal Kelulusan</p><p className="font-bold text-gray-900">{formatTanggal(akademik.tanggal_kelulusan)}</p></div>
              <div><p className="text-gray-400 mb-1.5 font-medium">IPK</p><p className="font-bold text-[#117065]">{akademik.ipk !== undefined && akademik.ipk !== null ? akademik.ipk : "-"} <span className="text-gray-900">/ 4.00</span></p></div>
              
              <div><p className="text-gray-400 mb-1.5 font-medium">Total SKS</p><p className="font-bold text-gray-900">{akademik.total_sks !== undefined && akademik.total_sks !== null ? `${akademik.total_sks} SKS` : "-"}</p></div>
              <div><p className="text-gray-400 mb-1.5 font-medium">Total Bobot</p><p className="font-bold text-gray-900">{akademik.total_bobot || "-"}</p></div>
              
              <div><p className="text-gray-400 mb-1.5 font-medium">Predikat</p><p className="font-bold text-gray-900">{akademik.predikat || "-"}</p></div>
              <div><p className="text-gray-400 mb-1.5 font-medium">Status Kelulusan</p><p className="font-bold text-gray-900">{akademik.status_kelulusan || "-"}</p></div>
            </div>
          </div>
        </div>

        {/* CATATAN VERIFIKASI */}
        {statusInfo?.catatan && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-yellow-600 text-lg mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-yellow-800 mb-1">Catatan Verifikasi</h4>
                <p className="text-sm text-yellow-700">{statusInfo.catatan}</p>
              </div>
            </div>
          </div>
        )}

        {/* TRANSKRIP NILAI DARI API */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-[#F9FAFB] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
            <FiFileText size={16} className="text-gray-700" />
            <h3 className="text-[14px] font-bold text-gray-800">Transkrip Nilai</h3>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full text-[13px] text-gray-800 relative">
              <thead className="sticky top-0 bg-[#F9FAFB] border-b border-gray-200 text-gray-500 z-10">
                <tr>
                  <th className="px-6 py-4 font-bold text-left">Kode</th>
                  <th className="px-6 py-4 font-bold text-left">Nama Mata Kuliah</th>
                  <th className="px-6 py-4 font-bold text-center">SKS (K)</th>
                  <th className="px-6 py-4 font-bold text-center">Nilai Mutu (AM)</th>
                  <th className="px-6 py-4 font-bold text-center">Bobot (T)</th>
                  <th className="px-6 py-4 font-bold text-center">Nilai (HM)</th>
                </tr>
              </thead>
              <tbody>
                {transkrip.length > 0 ? (
                  transkrip.map((n, i) => (
                    <tr key={`${n.kode || i}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-left">{n.kode || "-"}</td>
                      <td className="px-6 py-4 font-semibold text-left">{n.nama || "-"}</td>
                      <td className="px-6 py-4 font-semibold text-center">{n.k ?? n.sks ?? "-"}</td>
                      <td className="px-6 py-4 font-semibold text-center">{n.am ?? n.mutu ?? "-"}</td>
                      <td className="px-6 py-4 font-semibold text-center">{n.t ?? n.bobot ?? "-"}</td>
                      <td className="px-6 py-4 font-semibold text-center text-[#117065]">
                        {n.hm || n.grade || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">
                      Data transkrip tidak ditemukan.
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

export default DetailMahasiswa;