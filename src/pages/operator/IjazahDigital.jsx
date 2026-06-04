import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiPrinter, FiDownload } from "react-icons/fi"; // FiArrowLeft dihapus
import DashboardLayout from "../../components/ui/DashboardLayout";

const IjazahDigital = () => {
  const navigate = useNavigate();
  const { nim } = useParams();
  const { state } = useLocation();
  const ijazahRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Data dari state atau fallback
  const data = state || {
    nama: "Muhammad Jameson",
    nim: nim || "2311002040506",
    fakultas: "Fakultas Teknik dan Sains",
    prodi: "Teknik Informatika",
    tahunLulus: "2026",
    tempatLahir: "Bogor",
    tanggalLahir: "18 Oktober 2004",
    batch: "Batch 3 - FTS",
    jenisKelamin: "Laki-laki",
    email: "muhammad.jameson@student.uika.ac.id",
    noTelp: "081234567890",
    tahunMasuk: "2022",
    ipk: "3.85",
    totalSks: "144",
    status: "Terbit"
  };

  const {
    nama = "Muhammad Jameson",
    nim: nimVal = nim || "2311002040506",
    fakultas = "Fakultas Teknik dan Sains",
    prodi = "Teknik Informatika",
    tahunLulus = "2026",
    tempatLahir = "Bogor",
    tanggalLahir = "18 Oktober 2004",
    batch = "Batch 3 - FTS",
    jenisKelamin = "Laki-laki",
    email = `${nama?.toLowerCase().replace(/\s/g, '.') || 'muhammad.jameson'}@student.uika.ac.id`,
    noTelp = "081234567890",
    tahunMasuk = "2022",
    ipk = "3.85",
    totalSks = "144"
  } = data;

  const noSeriIjazah = `077/S.4.0/UIKA/${tahunLulus}`;
  const tanggalKelulusan = `24 Juni ${tahunLulus}`;

  const getGelar = () => {
    const p = prodi.toLowerCase();
    if (p.includes("informatika") || p.includes("mesin") || p.includes("sipil")) return "Sarjana Teknik (S.T.)";
    if (p.includes("manajemen") || p.includes("akuntansi") || p.includes("bisnis digital")) return "Sarjana Ekonomi (S.E.)";
    if (p.includes("hukum")) return "Sarjana Hukum (S.H.)";
    if (p.includes("agama") || p.includes("syariah")) return "Sarjana Agama (S.Ag.)";
    if (p.includes("kesehatan") || p.includes("gizi")) return "Sarjana Kesehatan Masyarakat (S.K.M.)";
    if (p.includes("pendidikan")) return "Sarjana Pendidikan (S.Pd.)";
    return "Sarjana (S.1)";
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    alert("🚀 Fitur download sedang dalam tahap pengembangan. Mohon bersabar, akan segera tersedia!");
  };

  if (loading) {
    return (
      <DashboardLayout title="Ijazah Digital">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Ijazah Digital">
      <div className="w-full">
        <div className="flex items-center justify-end mb-5">
          {/* TOMBOL KEMBALI SUDAH DIHAPUS, hanya tombol Print & Download yang tersisa */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FiPrinter size={15} /> Print
            </button>
            <button 
              onClick={handleDownload} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B4B48] text-white text-sm font-semibold hover:bg-[#093b38]"
            >
              <FiDownload size={15} /> Download
            </button>
          </div>
        </div>

        <div ref={ijazahRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="border-4 border-[#0B4B48] rounded-xl p-8 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%)" }}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <div className="w-96 h-96 rounded-full border-8 border-[#0B4B48]" />
              </div>

              {/* Header */}
              <div className="flex flex-wrap items-start justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#0B4B48] flex items-center justify-center">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="2" />
                      <text x="24" y="30" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">U</text>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#0B4B48]">Universitas Ibn Khaldun Bogor</h1>
                    <p className="text-sm text-gray-600 italic">IJAZAH</p>
                    <p className="text-xs text-gray-500 italic">Certificate of Graduation</p>
                  </div>
                </div>
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <svg width="50" height="50" viewBox="0 0 50 50" fill="#0B4B48">
                    <rect x="5" y="5" width="40" height="40" rx="3" fill="#0B4B48" />
                    <rect x="10" y="10" width="30" height="30" rx="2" fill="white" />
                    <rect x="15" y="15" width="20" height="20" fill="#0B4B48" />
                  </svg>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-[#0B4B48] to-transparent mb-6" />

              <p className="text-sm text-center text-gray-600 mb-6 leading-relaxed">
                Berkat Rahmat Allah Yang Maha Kuasa, dengan ini memberikan ijazah kepada:<br />
                <span className="text-xs italic text-gray-400">By the Grace of Almighty Allah, this certificate is hereby awarded to:</span>
              </p>

              {/* Data Mahasiswa 2 Kolom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm mb-6">
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Tanggal Kelulusan</span><span className="font-semibold">: {tanggalKelulusan}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Nama</span><span className="font-semibold">: {nama}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">NIM</span><span className="font-semibold">: {nimVal}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Tempat & Tanggal Lahir</span><span className="font-semibold">: {tempatLahir}, {tanggalLahir}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Jenis Kelamin</span><span className="font-semibold">: {jenisKelamin}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Nomor Seri Ijazah</span><span className="font-semibold">: {noSeriIjazah}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Fakultas</span><span className="font-semibold">: {fakultas}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Program Studi</span><span className="font-semibold">: {prodi}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Batch</span><span className="font-semibold">: {batch}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Tahun Masuk</span><span className="font-semibold">: {tahunMasuk}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Tahun Lulus</span><span className="font-semibold">: {tahunLulus}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">IPK</span><span className="font-semibold">: {ipk} / 4.00</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Total SKS</span><span className="font-semibold">: {totalSks} SKS</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">Email</span><span className="font-semibold">: {email}</span></div>
                <div className="flex items-baseline gap-2"><span className="text-gray-500 w-36">No Telepon</span><span className="font-semibold">: {noTelp}</span></div>
              </div>

              <div className="mb-6"><span className="inline-block border-2 border-[#0B4B48] text-[#0B4B48] text-xs font-bold px-4 py-1 rounded">Unggul</span></div>

              <p className="text-xs text-center text-gray-600 mb-4 leading-relaxed px-4">
                Kepadanya dilimpahkan segala wewenang dan hak yang berhubungan dengan ijazah ini, serta berhak menyandang gelar:<br />
                <span className="italic text-gray-400">Therefore he/she has the authority and rights associated with the certificate, including the right to bear the academic degree of:</span>
              </p>

              <p className="text-center text-base font-bold text-[#0B4B48] mb-8">{getGelar()}</p>

              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="w-24 h-32 border-2 border-gray-300 rounded bg-gray-100 flex flex-col items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <p className="text-[9px] text-gray-400 mt-1">{nama.split(" ")[0]}</p>
                </div>
                <div className="flex flex-wrap gap-8">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Bogor, {tanggalKelulusan}</p>
                    <p className="text-sm font-semibold text-gray-500 mt-2">Rektor</p>
                    <div className="h-10 flex items-center justify-center"><span className="text-2xl font-bold text-[#0B4B48]" style={{ fontFamily: "cursive" }}>Rektor</span></div>
                    <div className="h-px w-40 bg-gray-400 my-1" />
                    <p className="text-xs font-bold text-gray-700">Prof. Dr. H. L. Mujahidin, M.Si.</p>
                    <p className="text-[10px] text-gray-500">NIK. 410 100 562</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">&nbsp;</p>
                    <p className="text-sm font-semibold text-gray-500 mt-2">Dekan</p>
                    <div className="h-10 flex items-center justify-center"><span className="text-2xl font-bold text-[#0B4B48]" style={{ fontFamily: "cursive" }}>Dekan</span></div>
                    <div className="h-px w-40 bg-gray-400 my-1" />
                    <p className="text-xs font-bold text-gray-700">Dr. Lumie Lumine, M.T.</p>
                    <p className="text-[10px] text-gray-500">NIK. 410 100 000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IjazahDigital;