// src/pages/operator/DetailDokumenValid.jsx

import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiUser, FiBook, FiFileText, FiExternalLink } from "react-icons/fi";
import DashboardLayout from "@/components/ui/DashboardLayout";

const getMatkulByProdi = (prodi) => {
  const matkulUmum = ["Pendidikan Agama", "Pancasila", "Kewarganegaraan", "Bahasa Indonesia", "Bahasa Inggris"];
  
  const matkulByProdi = {
    "Teknik Informatika": [...matkulUmum, "Kalkulus I", "Algoritma Pemrograman", "Struktur Data", "Basis Data", "Jaringan Komputer", "Pemrograman Web", "Rekayasa Perangkat Lunak", "Sistem Operasi", "Skripsi"],
    "Teknik Mesin": [...matkulUmum, "Kalkulus I", "Fisika Dasar", "Gambar Teknik", "Termodinamika", "Mekanika Fluida", "Kekuatan Material", "Proses Manufaktur", "Skripsi"],
    "Teknik Sipil": [...matkulUmum, "Kalkulus I", "Fisika Dasar", "Mekanika Bahan", "Mekanika Tanah", "Struktur Beton", "Hidrolika", "Transportasi", "Skripsi"],
    "Sistem Informasi": [...matkulUmum, "Kalkulus I", "Algoritma Pemrograman", "Basis Data", "Sistem Informasi Manajemen", "Analisis Sistem", "Pemrograman Web", "Skripsi"],
    "Manajemen": [...matkulUmum, "Pengantar Ekonomi", "Manajemen Keuangan", "Manajemen Pemasaran", "Manajemen SDM", "Akuntansi Dasar", "Bisnis Digital", "Skripsi"],
    "Akuntansi": [...matkulUmum, "Pengantar Akuntansi I", "Akuntansi Keuangan", "Akuntansi Biaya", "Perpajakan", "Auditing", "Skripsi"],
    "Bisnis Digital": [...matkulUmum, "Pengantar Bisnis", "E-Commerce", "Digital Marketing", "Analisis Bisnis", "Manajemen E-Bisnis", "Skripsi"],
    "Ilmu Hukum": [...matkulUmum, "Pengantar Ilmu Hukum", "Hukum Perdata", "Hukum Pidana", "Hukum Tata Negara", "Hukum Internasional", "Skripsi"],
    "Pendidikan Agama Islam": [...matkulUmum, "Ulumul Qur'an", "Ulumul Hadits", "Fiqh Ibadah", "Tauhid", "Sejarah Peradaban Islam", "Skripsi"],
    "Ekonomi Syariah": [...matkulUmum, "Pengantar Ekonomi Islam", "Fiqh Muamalah", "Lembaga Keuangan Syariah", "Akuntansi Syariah", "Skripsi"],
    "Kesehatan Masyarakat": [...matkulUmum, "Anatomi", "Epidemiologi", "Biostatistik", "Promosi Kesehatan", "Kesehatan Lingkungan", "Skripsi"],
    "Ilmu Gizi": [...matkulUmum, "Anatomi", "Ilmu Gizi Dasar", "Gizi Klinik", "Teknologi Pangan", "Evaluasi Gizi", "Skripsi"],
    "Pendidikan Bahasa Inggris": [...matkulUmum, "Structure", "Speaking", "Listening", "Writing", "Psikologi Pendidikan", "Microteaching", "Skripsi"],
    "Teknologi Pendidikan": [...matkulUmum, "Media Pembelajaran", "Desain Pembelajaran", "Evaluasi Pembelajaran", "Manajemen Pendidikan", "Skripsi"]
  };
  
  return matkulByProdi[prodi] || [...matkulUmum, "Skripsi"];
};

const DetailDokumenValid = () => {
  const navigate = useNavigate();
  const { nim } = useParams();
  const { state } = useLocation();
  const mahasiswa = state;

  if (!mahasiswa) {
    return (
      <DashboardLayout title="Detail Dokumen Valid">
        <div className="w-full text-center py-10">
          <p className="text-gray-500 mb-3">Data tidak ditemukan.</p>
          <button 
            onClick={() => navigate("/operator/dokumen-valid")} 
            className="text-[#115E59] font-bold hover:underline"
          >
            ← Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const nilaiData = useMemo(() => {
    const getRandomGrade = () => {
      const grades = ["A", "A-", "B+", "B"];
      return grades[Math.floor(Math.random() * grades.length)];
    };
    
    const getMutu = (grade) => {
      const mutuMap = { "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0 };
      return mutuMap[grade] || 3.0;
    };
    
    const matkulList = getMatkulByProdi(mahasiswa.prodi);
    
    return matkulList.map((nama, idx) => {
      const grade = getRandomGrade();
      const mutu = getMutu(grade);
      return {
        kode: `MK${String(idx + 101).slice(-3)}`,
        nama: nama,
        sks: 3,
        grade: grade,
        mutu: mutu.toFixed(2),
        bobot: (mutu * 3).toFixed(0)
      };
    });
  }, [mahasiswa.prodi]);

  const tempatLahir = mahasiswa.tempatLahir || "Bogor";
  const tanggalLahir = mahasiswa.tanggalLahir || "15 Januari 2004";
  const jenisKelamin = mahasiswa.jenisKelamin || "Laki-laki";
  const email = mahasiswa.email || `${mahasiswa.nama.toLowerCase().replace(/\s+/g, ".")}@student.uika.ac.id`;
  const noTelp = mahasiswa.noTelp || "081234567890";
  const tahunMasuk = mahasiswa.tahunMasuk || "2022";
  const ipk = mahasiswa.ipk || "3.75";
  const totalSks = mahasiswa.totalSks || "144";
  const batch = mahasiswa.batch || "Batch";

  const handleLinkIjazah = () => {
    navigate(`/operator/ijazah-digital/${mahasiswa.nim}`, { 
      state: { 
        nama: mahasiswa.nama,
        nim: mahasiswa.nim,
        fakultas: mahasiswa.fakultas,
        prodi: mahasiswa.prodi,
        tahunLulus: mahasiswa.tahunLulus,
        tempatLahir: mahasiswa.tempatLahir,
        tanggalLahir: mahasiswa.tanggalLahir,
        batch: mahasiswa.batch,
        jenisKelamin: mahasiswa.jenisKelamin,
        email: mahasiswa.email,
        noTelp: mahasiswa.noTelp,
        tahunMasuk: mahasiswa.tahunMasuk,
        ipk: mahasiswa.ipk,
        totalSks: mahasiswa.totalSks
      } 
    });
  };

  return (
    <DashboardLayout title={`Detail Dokumen Valid - ${mahasiswa.nama}`}>
      <div className="w-full">
        {/* TOMBOL KEMBALI SUDAH DIHAPUS */}

        <div className="bg-white rounded-xl px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-6">
            <div className="w-[88px] h-[88px] rounded-full bg-[#E5F3EB] overflow-hidden flex items-center justify-center border-4 border-[#E5F3EB]">
              <svg viewBox="0 0 36 36" fill="none" width="88" height="88">
                <rect width="36" height="36" fill="#84cc16"></rect>
                <rect x="0" y="0" width="36" height="36" transform="translate(6 6) rotate(194 18 18)" fill="#fde047" rx="36"></rect>
                <g transform="translate(0 2) rotate(-4 18 18)">
                  <path d="M13,21 a1,1 0 0,0 10,0" fill="#000000"></path>
                  <rect x="11" y="14" width="1.5" height="2" rx="1" fill="#000000"></rect>
                  <rect x="23" y="14" width="1.5" height="2" rx="1" fill="#000000"></rect>
                </g>
              </svg>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <h2 className="font-bold text-[20px] text-gray-900">{mahasiswa.nama}</h2>
              <p className="text-[14px] text-gray-600">NIM: {mahasiswa.nim}</p>
              <div>
                <span className="inline-block bg-[#115E59] text-white text-[12px] px-4 py-1.5 rounded-full font-bold shadow-sm">
                  {typeof batch === 'string' ? batch.split(" - ")[0] : "Batch"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-1 max-w-[320px]">
            <span className="bg-[#16A36B] text-white text-[13px] px-6 py-1.5 rounded-full font-bold shadow-sm inline-block">
              Terbit
            </span>
            <p className="text-[11px] text-gray-500 font-medium">Telah di Validasi Oleh Rektor</p>
            <p className="text-[10px] text-gray-400 italic leading-relaxed text-right">
              Ijazah telah berhasil diterbitkan dan terverifikasi. Dokumen dapat diunduh melalui link di bawah.
            </p>
            <button 
              onClick={handleLinkIjazah}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#0B4B48] hover:underline mt-1"
            >
              <FiExternalLink size={12} />
              Link Dokumen Valid
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-[#F3F4F6] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
              <FiUser size={16} className="text-gray-800" />
              <h3 className="text-[14px] font-bold text-gray-800">Informasi Pribadi</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8 text-[14px]">
              <div><p className="text-gray-500 mb-1.5">Nama</p><p className="font-bold text-gray-800">{mahasiswa.nama}</p></div>
              <div><p className="text-gray-500 mb-1.5">NIM</p><p className="font-bold text-gray-800">{mahasiswa.nim}</p></div>
              <div><p className="text-gray-500 mb-1.5">Tempat, Tanggal Lahir</p><p className="font-bold text-gray-800">{tempatLahir}, {tanggalLahir}</p></div>
              <div><p className="text-gray-500 mb-1.5">Jenis Kelamin</p><p className="font-bold text-gray-800">{jenisKelamin}</p></div>
              <div><p className="text-gray-500 mb-1.5">Email</p><p className="font-bold text-gray-800">{email}</p></div>
              <div><p className="text-gray-500 mb-1.5">No Telepon</p><p className="font-bold text-gray-800">{noTelp}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-[#F3F4F6] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
              <FiBook size={16} className="text-gray-800" />
              <h3 className="text-[14px] font-bold text-gray-800">Informasi Akademik</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8 text-[14px]">
              <div><p className="text-gray-500 mb-1.5">Fakultas</p><p className="font-bold text-gray-800">{mahasiswa.fakultas}</p></div>
              <div><p className="text-gray-500 mb-1.5">Program Studi</p><p className="font-bold text-gray-800">{mahasiswa.prodi}</p></div>
              <div><p className="text-gray-500 mb-1.5">Tahun Masuk</p><p className="font-bold text-gray-800">{tahunMasuk}</p></div>
              <div><p className="text-gray-500 mb-1.5">IPK</p><p className="font-bold text-[#115E59]">{ipk} <span className="text-gray-800">/ 4.00</span></p></div>
              <div><p className="text-gray-500 mb-1.5">Tahun Lulus</p><p className="font-bold text-gray-800">{mahasiswa.tahunLulus}</p></div>
              <div><p className="text-gray-500 mb-1.5">Total SKS</p><p className="font-bold text-gray-800">{totalSks} SKS</p></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-[#F3F4F6] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
            <FiFileText size={16} className="text-gray-800" />
            <h3 className="text-[15px] font-bold text-gray-800">Transkrip Nilai</h3>
          </div>
          
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-[14px] text-gray-800">
              <thead className="sticky top-0 bg-[#F9FAFB] border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold text-center">Kode</th>
                  <th className="px-6 py-4 font-bold text-left">Nama Mata Kuliah</th>
                  <th className="px-6 py-4 font-bold text-center">SKS</th>
                  <th className="px-6 py-4 font-bold text-center">Nilai Mutu</th>
                  <th className="px-6 py-4 font-bold text-center">Bobot</th>
                  <th className="px-6 py-4 font-bold text-center">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {nilaiData.map((n, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-center">{n.kode}</td>
                    <td className="px-6 py-4 font-semibold">{n.nama}</td>
                    <td className="px-6 py-4 font-semibold text-center">{n.sks}</td>
                    <td className="px-6 py-4 font-semibold text-center">{n.mutu}</td>
                    <td className="px-6 py-4 font-semibold text-center">{n.bobot}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-[#115E59] text-white px-4 py-1 rounded-full font-bold text-[12px]">{n.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DetailDokumenValid;