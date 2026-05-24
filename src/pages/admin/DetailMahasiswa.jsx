import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiUser, FiBook, FiFileText, FiArrowLeft } from "react-icons/fi";

const DetailMahasiswa = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { nim } = useParams(); // ← ROUTE DARI KODE 1 (menggunakan param NIM)

  // ==========================================================================
  // 🟢 TODO [API] LANGKAH 1: BUKA STATE INI JIKA API SUDAH SIAP
  // ==========================================================================
  // const [dataAPI, setDataAPI] = useState(null);
  // const [isLoading, setIsLoading] = useState(false);

  // Mengambil data yang dilempar dari navigasi tabel sebelumnya
  // Kode 1: state: item (langsung), Kode 2: state: { mahasiswa: item }
  // Supaya kompatibel dengan kedua cara
  const dataDariTabel = location.state?.mahasiswa || location.state;
  const mahasiswa = dataDariTabel;

  // ==========================================================================
  // 🟢 TODO [API] LANGKAH 2: BUKA USE-EFFECT INI UNTUK HIT API DETAIL
  // ==========================================================================
  /*
  useEffect(() => {
    const fetchDetailMahasiswa = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://API_BACKEND_ANDA/api/mahasiswa/${nim}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
        });
        const result = await response.json();
        
        if (result.status === "success") {
          setDataAPI(result.data); 
        }
      } catch (error) {
        console.error("Gagal mengambil data detail:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetailMahasiswa();
  }, [nim]);
  */

  // 🔥 LOGIKA DUMMY (DATA PENDUKUNG PROFIL) - dari Kode 1 (lebih lengkap)
  const ceweList = ["Rani", "Siti", "Putri", "Nabila", "Citra", "Dewi", "Aulia", "Zahra"];
  const isCewe = ceweList.some((nama) => mahasiswa?.nama?.includes(nama));
  const email = mahasiswa?.nama?.toLowerCase().replace(/\s+/g, ".") + "@gmail.com";
  const telp = "08" + Math.floor(Math.random() * 9000000000 + 1000000000);
  const tempatList = ["Bogor", "Jakarta", "Bandung", "Depok", "Bekasi"];
  const tempat = tempatList[Math.floor(Math.random() * tempatList.length)];
  const tanggalList = ["12 Mei 2004", "18 Oktober 2004", "21 Januari 2003", "9 Agustus 2004", "5 Februari 2003"];
  const tanggal = tanggalList[Math.floor(Math.random() * tanggalList.length)];
  const ipk = (Math.random() * (4.0 - 3.2) + 3.2).toFixed(2);
  const totalSks = Math.floor(Math.random() * 10) + 140;

  if (!mahasiswa) {
    return (
      <DashboardLayout>
        <div className="w-full text-center py-10">
          <p className="text-gray-500 mb-3">Data tidak ditemukan</p>
          <button onClick={() => navigate(-1)} className="text-[#115E59] font-bold hover:underline">
            ← Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // 🔥 FUNGSI GET MATKUL (dari Kode 2 - lebih terstruktur dan lengkap per fakultas)
  const getMatkul = () => {
    const f = (mahasiswa.fakultas || "").toLowerCase();
    
    if (f.includes("teknik") || f.includes("sains")) {
      return [
        "Algoritma dan Pemrograman", "Struktur Data", "Basis Data", "Sistem Operasi",
        "Organisasi Komputer", "Arsitektur Komputer", "Jaringan Komputer", "Keamanan Jaringan",
        "Sistem Informasi Geografis", "Rekayasa Perangkat Lunak", "Rekayasa Perangkat Lunak Lanjut",
        "Analisis dan Perancangan Sistem", "Pemrograman Berorientasi Objek", "Pemrograman Web",
        "Pemrograman Mobile", "Kecerdasan Buatan", "Machine Learning", "Data Mining", "Big Data",
        "Cloud Computing", "Internet of Things", "Interaksi Manusia dan Komputer", "Grafika Komputer",
        "Pengolahan Citra Digital", "Pengolahan Sinyal Digital", "Sistem Tertanam", "Sistem Terdistribusi",
        "Parallel Computing", "Kriptografi", "Keamanan Informasi", "Manajemen Basis Data",
        "Administrasi Jaringan", "Etika Profesi", "Metode Penelitian", "Statistika", "Matematika Diskrit",
        "Aljabar Linear", "Kalkulus", "Kapita Selekta", "Manajemen Proyek", "Technopreneurship",
        "Sistem Pendukung Keputusan", "Sistem Pakar", "Enterprise Resource Planning", "E-Commerce",
        "Audit Sistem Informasi", "Tata Kelola TI", "Data Warehouse", "Business Intelligence",
      ];
    }
    
    if (f.includes("ekonomi") || f.includes("bisnis")) {
      return [
        "Pengantar Akuntansi", "Akuntansi Keuangan", "Akuntansi Biaya", "Akuntansi Manajemen",
        "Akuntansi Perpajakan", "Auditing", "Sistem Informasi Akuntansi", "Manajemen Keuangan",
        "Manajemen Pemasaran", "Manajemen Operasional", "Manajemen Sumber Daya Manusia",
        "Manajemen Strategi", "Perilaku Organisasi", "Ekonomi Mikro", "Ekonomi Makro",
        "Ekonomi Internasional", "Ekonometrika", "Statistika Bisnis", "Matematika Ekonomi",
        "Kewirausahaan", "Studi Kelayakan Bisnis", "Pasar Modal", "Investasi dan Portofolio",
        "Perbankan", "Manajemen Risiko", "Bisnis Digital", "E-Commerce", "Pengantar Bisnis",
        "Etika Bisnis", "Komunikasi Bisnis", "Hukum Bisnis", "Perpajakan", "Riset Operasi",
        "Manajemen Proyek", "Business Intelligence", "Analisis Laporan Keuangan",
        "Pengambilan Keputusan Bisnis", "Supply Chain Management", "Corporate Finance",
        "Ekonomi Syariah", "Manajemen Retail", "Leadership", "Financial Technology",
        "Data Analytics Bisnis", "Metode Penelitian", "Skripsi",
      ];
    }
    
    if (f.includes("hukum")) {
      return [
        "Pengantar Ilmu Hukum", "Pengantar Hukum Indonesia", "Hukum Perdata", "Hukum Perdata Lanjutan",
        "Hukum Pidana", "Hukum Pidana Lanjutan", "Hukum Tata Negara", "Hukum Administrasi Negara",
        "Hukum Internasional", "Hukum Islam", "Hukum Adat", "Hukum Dagang", "Hukum Pajak",
        "Hukum Acara Perdata", "Hukum Acara Pidana", "Hukum Lingkungan", "Hukum Ketenagakerjaan",
        "Hukum Agraria", "Hukum Laut", "Hukum Udara", "Hukum Hak Asasi Manusia", "Kriminologi",
        "Etika Profesi Hukum", "Advokasi dan Litigasi", "Legal Drafting", "Hukum Perusahaan",
        "Hukum Perlindungan Konsumen", "Hukum Cyber", "Hukum Bisnis", "Hukum Konstitusi",
        "Sosiologi Hukum", "Filsafat Hukum", "Politik Hukum", "Metode Penelitian Hukum",
        "Perbandingan Hukum", "Hukum Pembuktian", "Teknik Perancangan Peraturan", "Moot Court",
        "Hukum Acara Mahkamah Konstitusi", "Hukum Keuangan Negara", "Tindak Pidana Korupsi",
        "Hukum Perbankan", "Hukum Asuransi", "Hukum Investasi", "Arbitrase dan Alternatif Penyelesaian Sengketa",
        "Hukum Teknologi Informasi", "Magang Profesi Hukum", "Skripsi",
      ];
    }
    
    if (f.includes("kesehatan")) {
      return [
        "Anatomi dan Fisiologi", "Biokimia", "Mikrobiologi", "Patofisiologi", "Farmakologi",
        "Ilmu Gizi", "Dasar Keperawatan", "Keperawatan Medikal Bedah", "Keperawatan Anak",
        "Keperawatan Maternitas", "Keperawatan Jiwa", "Keperawatan Komunitas", "Keperawatan Gawat Darurat",
        "Keperawatan Gerontik", "Kesehatan Masyarakat", "Epidemiologi", "Promosi Kesehatan",
        "Keselamatan dan Kesehatan Kerja", "Etika Keperawatan", "Komunikasi Keperawatan",
        "Manajemen Keperawatan", "Keperawatan Keluarga", "Dasar Kebidanan", "Kesehatan Reproduksi",
        "Kesehatan Lingkungan", "Statistika Kesehatan", "Metodologi Penelitian", "Sistem Informasi Kesehatan",
        "Administrasi Rumah Sakit", "Keperawatan ICU", "Keperawatan Hemodialisa", "Ilmu Penyakit Dalam",
        "Ilmu Bedah Dasar", "Psikologi Kesehatan", "Pendidikan Kesehatan", "Kesehatan Mental",
        "Praktik Klinik", "Praktik Profesi", "Seminar Kesehatan", "Skripsi",
      ];
    }
    
    if (f.includes("agama") || f.includes("islam")) {
      return [
        "Pendidikan Agama Islam", "Pancasila", "Kewarganegaraan", "Bahasa Indonesia", "Bahasa Arab Dasar",
        "Bahasa Inggris Dasar", "Ulumul Qur'an", "Ulumul Hadits", "Sejarah Peradaban Islam",
        "Pengantar Studi Islam", "Fiqh Ibadah", "Tauhid / Ilmu Kalam", "Akhlak Tasawuf", "Filsafat Ilmu",
        "Bahasa Arab Lanjut", "Ushul Fiqh", "Tafsir Ahkam", "Hadits Ahkam", "Metodologi Penelitian Agama",
        "Ilmu Dakwah", "Psikologi Agama", "Sosiologi Agama", "Ilmu Falak", "Perbandingan Madzhab",
        "Hukum Keluarga Islam", "Ekonomi Islam", "Lembaga Keuangan Syariah", "Akuntansi Syariah",
        "Manajemen Zakat dan Wakaf", "Pendidikan Agama Islam Transformatif", "Komunikasi Penyiaran Islam",
        "Jurnalistik Islam", "Bimbingan Konseling Islam", "Psikoterapi Islam", "Manajemen Pendidikan Islam",
        "Strategi Pembelajaran", "Media dan Teknologi Pendidikan", "Evaluasi Pendidikan", "Microteaching",
        "Praktik Pengalaman Lapangan (PPL)", "Kuliah Kerja Nyata (KKN)", "Skripsi",
      ];
    }
    
    return ["Mata Kuliah Umum 1", "Mata Kuliah Umum 2", "Pendidikan Agama", "Pancasila", "Kewarganegaraan", "Bahasa Indonesia", "Bahasa Inggris"];
  };

  // Nilai Data - menggunakan useMemo dari kedua kode
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

  // Fungsi getStatusUI - dari Kode 1 (lebih lengkap informasinya)
  const getStatusUI = (status) => {
    const s = (status || "terbit").toLowerCase();
    if (s.includes("terbit")) return { bg: "bg-[#22C55E]", text: "Terbit", sub1: "Di Validasi oleh Rektor", sub2: "Data terverifikasi sah dalam pangkalan data universitas" };
    if (s.includes("proses")) return { bg: "bg-[#2879B9]", text: "Proses", sub1: "Proses Validasi oleh Operator", sub2: "Data masih dalam pengecekan dan proses validasi" };
    if (s.includes("reject")) return { bg: "bg-[#DC2626]", text: "Reject", sub1: "Ditolak oleh Verifikator", sub2: "Terdapat ketidaksesuaian data yang perlu diperbaiki" };
    if (s.includes("revoke")) return { bg: "bg-[#EAB308]", text: "Revoke", sub1: "Di Revoke oleh Wakil Dekan", sub2: "Kesalahan pada penulisan nama Mahasiswa" };
    return { bg: "bg-[#22C55E]", text: "Terbit", sub1: "Di Validasi oleh Rektor", sub2: "Data terverifikasi sah dalam pangkalan data universitas" };
  };

  const statusUI = getStatusUI(mahasiswa?.status);

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* PROFILE CARD DINAMIS - dari Kode 1 */}
        <div className="bg-white rounded-xl px-8 py-6 flex justify-between items-center mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-6">
            <div className="w-22 h-22 rounded-full bg-[#E5F3EB] overflow-hidden flex items-center justify-center border-4 border-[#E5F3EB]">
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
                  {mahasiswa?.batch ? mahasiswa.batch.split(" - ")[0] : "Batch 15"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-1">
            <span className={`${statusUI.bg} text-white text-[13px] px-8 py-1.5 rounded-full font-bold shadow-sm`}>
              {statusUI.text}
            </span>
            <p className="text-[12px] text-gray-800 font-bold mt-1">{statusUI.sub1}</p>
            <p className="text-[11px] text-gray-400">{statusUI.sub2}</p>
          </div>
        </div>

        {/* INFO GRID DINAMIS - dari Kode 1 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* INFORMASI PRIBADI */}
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
              <div><p className="text-gray-500 mb-1.5">No Telpon</p><p className="font-bold text-gray-800">{telp}</p></div>
            </div>
          </div>

          {/* INFORMASI AKADEMIK */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-[#F3F4F6] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
              <FiBook size={16} className="text-gray-800" />
              <h3 className="text-[14px] font-bold text-gray-800">Informasi Akademik</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8 text-[14px]">
              <div><p className="text-gray-500 mb-1.5">Fakultas</p><p className="font-bold text-gray-800">{mahasiswa.fakultas}</p></div>
              <div><p className="text-gray-500 mb-1.5">Program Studi</p><p className="font-bold text-gray-800">{mahasiswa.prodi}</p></div>
              <div><p className="text-gray-500 mb-1.5">Tahun Masuk</p><p className="font-bold text-gray-800">2022</p></div>
              <div><p className="text-gray-500 mb-1.5">IPK</p><p className="font-bold text-[#115E59]">{ipk} <span className="text-gray-800">/ 4.00</span></p></div>
              <div><p className="text-gray-500 mb-1.5">Tahun Lulus</p><p className="font-bold text-gray-800">{mahasiswa.tahun || "2025"}</p></div>
              <div><p className="text-gray-500 mb-1.5">Total SKS</p><p className="font-bold text-gray-800">{totalSks} SKS</p></div>
            </div>
          </div>
        </div>

        {/* TRANSKRIP NILAI - dari Kode 1 */}
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

export default DetailMahasiswa;