// src/pages/operator/DetailMahasiswaOperator.jsx

import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiUser, FiBook, FiFileText, FiArrowLeft } from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";

const DetailMahasiswaOperator = () => {
  const navigate = useNavigate();
  const { nim } = useParams();
  const { state } = useLocation();

  // Cari data dari state (dikirim via navigate)
  const mahasiswa = state;

  if (!mahasiswa) {
    return (
      <DashboardLayout title="Detail Mahasiswa">
        <div className="w-full text-center py-10">
          <p className="text-gray-500 mb-3">Data tidak ditemukan</p>
          <button onClick={() => navigate(-1)} className="text-[#115E59] font-bold hover:underline">
            ← Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Data pendukung profil
  const ceweList = ["Rani", "Siti", "Putri", "Nabila", "Citra", "Dewi", "Aulia", "Zahra"];
  const isCewe = ceweList.some((nama) => mahasiswa?.nama?.includes(nama));
  const email = mahasiswa?.email || mahasiswa?.nama?.toLowerCase().replace(/\s+/g, ".") + "@gmail.com";
  const telp = mahasiswa?.noTelp || "08" + Math.floor(Math.random() * 9000000000 + 1000000000);
  const tempatList = ["Bogor", "Jakarta", "Bandung", "Depok", "Bekasi"];
  const tempat = mahasiswa?.tempatLahir || tempatList[Math.floor(Math.random() * tempatList.length)];
  const tanggalList = ["12 Mei 2004", "18 Oktober 2004", "21 Januari 2003", "9 Agustus 2004", "5 Februari 2003"];
  const tanggal = mahasiswa?.tanggalLahir || tanggalList[Math.floor(Math.random() * tanggalList.length)];
  const ipk = mahasiswa?.ipk || (Math.random() * (4.0 - 3.2) + 3.2).toFixed(2);
  const totalSks = mahasiswa?.totalSks || (Math.floor(Math.random() * 10) + 140);

  // LOGIKA MATKUL (SESUAI FAKULTAS)
  const getMatkul = () => {
    const f = (mahasiswa.fakultas || "").toLowerCase();
    
    if (f.includes("teknik") || f.includes("sains")) {
      return ["Pendidikan Agama", "Pancasila", "Kewarganegaraan", "Bahasa Indonesia", "Bahasa Inggris", "Kalkulus I", "Fisika Dasar I", "Kimia Dasar", "Pengantar Teknologi Informasi", "Algoritma dan Pemrograman", "Kalkulus II", "Fisika Dasar II", "Matematika Diskrit", "Aljabar Linear", "Struktur Data", "Sistem Operasi", "Organisasi Komputer", "Arsitektur Komputer", "Basis Data", "Jaringan Komputer", "Pemrograman Berorientasi Objek", "Statistika dan Probabilitas", "Rekayasa Perangkat Lunak", "Desain dan Analisis Algoritma", "Pemrograman Web", "Pemrograman Mobile", "Interaksi Manusia dan Komputer", "Kecerdasan Buatan", "Keamanan Jaringan", "Machine Learning", "Data Mining", "Etika Profesi", "Metode Penelitian", "Kerja Praktik", "Skripsi"];
    }
    if (f.includes("ekonomi") || f.includes("bisnis")) {
      return ["Pendidikan Agama", "Pancasila", "Kewarganegaraan", "Bahasa Indonesia", "Bahasa Inggris", "Pengantar Ekonomi Mikro", "Pengantar Ekonomi Makro", "Pengantar Akuntansi I", "Pengantar Bisnis", "Matematika Ekonomi", "Pengantar Akuntansi II", "Statistika Ekonomi I", "Pengantar Manajemen", "Hukum Bisnis", "Akuntansi Keuangan Menengah I", "Statistika Ekonomi II", "Manajemen Keuangan", "Manajemen Pemasaran", "Manajemen Sumber Daya Manusia", "Akuntansi Keuangan Menengah II", "Akuntansi Biaya", "Manajemen Operasional", "Sistem Informasi Manajemen", "Perekonomian Indonesia", "Akuntansi Manajemen", "Perpajakan", "Ekonomi Internasional", "Manajemen Strategi", "Perilaku Organisasi", "Kewirausahaan", "Bisnis Digital", "Etika Bisnis", "Metode Penelitian", "Skripsi"];
    }
    if (f.includes("hukum")) {
      return ["Pendidikan Agama", "Pancasila", "Kewarganegaraan", "Bahasa Indonesia", "Bahasa Inggris", "Pengantar Ilmu Hukum", "Pengantar Hukum Indonesia", "Ilmu Negara", "Hukum Perdata", "Hukum Pidana", "Hukum Tata Negara", "Hukum Administrasi Negara", "Hukum Internasional", "Hukum Islam", "Hukum Dagang", "Hukum Acara Perdata", "Hukum Acara Pidana", "Etika Profesi Hukum", "Hukum Bisnis", "Legal Drafting", "Metode Penelitian Hukum", "Skripsi"];
    }
    if (f.includes("agama") || f.includes("islam")) {
      return ["Pendidikan Agama Islam", "Pancasila", "Kewarganegaraan", "Bahasa Indonesia", "Bahasa Arab Dasar", "Bahasa Inggris", "Ulumul Qur'an", "Ulumul Hadits", "Sejarah Peradaban Islam", "Pengantar Studi Islam", "Fiqh Ibadah", "Tauhid / Ilmu Kalam", "Akhlak Tasawuf", "Ushul Fiqh", "Tafsir Ahkam", "Hadits Ahkam", "Ilmu Dakwah", "Hukum Keluarga Islam", "Ekonomi Islam", "Skripsi"];
    }
    if (f.includes("kesehatan")) {
      return ["Pendidikan Agama", "Pancasila", "Kewarganegaraan", "Bahasa Indonesia", "Bahasa Inggris", "Anatomi", "Fisiologi", "Biokimia Kesehatan", "Mikrobiologi Dasar", "Ilmu Gizi Dasar", "Farmakologi Dasar", "Dasar Kesehatan Masyarakat", "Epidemiologi Dasar", "Promosi Kesehatan", "Kesehatan Lingkungan", "Manajemen Kesehatan", "Kesehatan Reproduksi", "Kesehatan Ibu dan Anak", "Metodologi Penelitian Kesehatan", "Skripsi"];
    }
    
    return ["Pendidikan Agama", "Pancasila", "Kewarganegaraan", "Bahasa Indonesia", "Bahasa Inggris", "Skripsi"];
  };

  const nilaiData = useMemo(() => {
    const getRandomNilai = () => {
      const list = ["A", "A-", "B+", "B"];
      return list[Math.floor(Math.random() * list.length)];
    };
    const getMutu = (n) => {
      if (n === "A") return 4.0;
      if (n === "A-") return 3.7;
      if (n === "B+") return 3.3;
      return 3.0;
    };
    return getMatkul().map((nama, i) => {
      const grade = getRandomNilai();
      const mutu = getMutu(grade);
      return { 
        kode: `MK${String(i + 101).padStart(3, '0')}`, 
        nama, 
        sks: 3, 
        grade, 
        mutu: mutu.toFixed(2), 
        bobot: (mutu * 3).toFixed(0) 
      };
    });
  }, [mahasiswa]);

  return (
    <DashboardLayout title={`Detail Mahasiswa - ${mahasiswa.nama}`}>
      <div className="w-full">
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#0B6B63] mb-4 transition-colors"
        >
          <FiArrowLeft size={18} />
          <span className="text-sm font-medium">Kembali</span>
        </button>

        {/* PROFILE CARD */}
        <div className="bg-white rounded-xl px-8 py-6 flex items-center mb-6 shadow-sm border border-gray-200">
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
              </div>
            </div>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Informasi Pribadi */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-[#F3F4F6] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
              <FiUser size={16} className="text-gray-800" />
              <h3 className="text-[14px] font-bold text-gray-800">Informasi Pribadi</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8 text-[14px]">
              <div><p className="text-gray-500 mb-1.5">Nama</p><p className="font-bold text-gray-800">{mahasiswa.nama}</p></div>
              <div><p className="text-gray-500 mb-1.5">NIM</p><p className="font-bold text-gray-800">{mahasiswa.nim}</p></div>
              <div><p className="text-gray-500 mb-1.5">Tempat, Tanggal Lahir</p><p className="font-bold text-gray-800">{tempat}, {tanggal}</p></div>
              <div><p className="text-gray-500 mb-1.5">Jenis Kelamin</p><p className="font-bold text-gray-800">{isCewe ? "Perempuan" : "Laki-laki"}</p></div>
              <div><p className="text-gray-500 mb-1.5">Email</p><p className="font-bold text-gray-800">{email}</p></div>
              <div><p className="text-gray-500 mb-1.5">No Telepon</p><p className="font-bold text-gray-800">{telp}</p></div>
            </div>
          </div>

          {/* Informasi Akademik */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-[#F3F4F6] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
              <FiBook size={16} className="text-gray-800" />
              <h3 className="text-[14px] font-bold text-gray-800">Informasi Akademik</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8 text-[14px]">
              <div><p className="text-gray-500 mb-1.5">Fakultas</p><p className="font-bold text-gray-800">{mahasiswa.fakultas}</p></div>
              <div><p className="text-gray-500 mb-1.5">Program Studi</p><p className="font-bold text-gray-800">{mahasiswa.prodi}</p></div>
              <div><p className="text-gray-500 mb-1.5">Tahun Masuk</p><p className="font-bold text-gray-800">{mahasiswa.tahunMasuk || "2022"}</p></div>
              <div><p className="text-gray-500 mb-1.5">IPK</p><p className="font-bold text-[#115E59]">{ipk} <span className="text-gray-800">/ 4.00</span></p></div>
              <div><p className="text-gray-500 mb-1.5">Tahun Lulus</p><p className="font-bold text-gray-800">{mahasiswa.tahunLulus}</p></div>
              <div><p className="text-gray-500 mb-1.5">Total SKS</p><p className="font-bold text-gray-800">{totalSks} SKS</p></div>
            </div>
          </div>
        </div>

        {/* TRANSKRIP NILAI */}
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
                {nilaiData.map((n, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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

export default DetailMahasiswaOperator;