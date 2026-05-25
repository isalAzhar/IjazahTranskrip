// src/pages/operator/DokumenValid.jsx

import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// ==================== DATA BATCH LENGKAP ====================
const generateBatchData = () => {
  const data = [];
  let id = 1;
  
  // PERUBAHAN: Tahun dari 2021 sampai 2026
  const tahunRandom = ["2021", "2022", "2023", "2024", "2025", "2026"];
  
  // Daftar nama mahasiswa
  const daftarNama = [
    "Adi Saputra", "Rani Maharani", "Budi Pratama", "Kayla Keyla", "Rizky Gusti A",
    "Risma Puspita", "Budi Doremi", "Siti Aisyah", "Eagle Al-Haikal", "Zahra Nabil",
    "Dila Fadilla", "Nayla Nim", "Samsul Jun", "Rayyan Hesa", "Zahra Nur",
    "Zulvikri", "Tasya Cantika", "Baedilah", "Mutqin", "Husni Haqiqi"
  ];
  
  // FAKULTAS TEKNIK DAN SAINS (FTS) - Batch 1 s/d 10
  const ftsBatch = ["Batch 1 - FTS", "Batch 2 - FTS", "Batch 3 - FTS", "Batch 4 - FTS", "Batch 5 - FTS", 
                    "Batch 6 - FTS", "Batch 7 - FTS", "Batch 8 - FTS", "Batch 9 - FTS", "Batch 10 - FTS"];
  const ftsPeriode = ["Semester Ganjil", "Semester Genap", "Semester Ganjil", "Semester Genap", "Semester Ganjil", "Semester Genap", "Semester Ganjil", "Semester Genap", "Semester Ganjil", "Semester Genap"];
  const ftsProdi = ["Teknik Informatika", "Teknik Mesin", "Teknik Sipil", "Sistem Informasi", "Teknik Elektro"];
  
  for (let i = 0; i < ftsBatch.length; i++) {
    const mahasiswaList = [];
    for (let j = 0; j < 10; j++) {
      const nama = daftarNama[(i + j) % daftarNama.length] + (j >= daftarNama.length ? ` ${Math.floor(j / daftarNama.length) + 1}` : "");
      mahasiswaList.push({
        id: j + 1,
        nama: nama,
        nim: `23110604${String(900 + i * 10 + j).padStart(3, "0")}`,
        prodi: ftsProdi[j % ftsProdi.length],
        batch: ftsBatch[i],
        fakultas: "Fakultas Teknik dan Sains",
        tahunLulus: tahunRandom[i % tahunRandom.length],
        jenisKelamin: j % 2 === 0 ? "Laki-laki" : "Perempuan",
        ipk: (3.0 + (j % 100) / 100).toFixed(2),
        tempatLahir: ["Bogor", "Jakarta", "Bandung", "Depok", "Bekasi", "Tangerang"][j % 6],
        tanggalLahir: `${15 + j} ${["Januari", "Februari", "Maret"][j % 3]} 2004`,
        email: `${nama.toLowerCase().replace(/\s+/g, ".")}@student.uika.ac.id`,
        noTelp: `0812${String(345678900 + i * 10 + j).slice(0, 8)}`,
        tahunMasuk: parseInt(tahunRandom[i % tahunRandom.length]) - 3,
        totalSks: 144
      });
    }
    
    data.push({
      id: id++,
      listBatch: ftsBatch[i],
      fakultas: "Fakultas Teknik dan Sains",
      singkatan: "FTS",
      tahunLulus: tahunRandom[i % tahunRandom.length],
      periode: ftsPeriode[i],
      totalData: 10,
      mahasiswa: mahasiswaList,
      status: "Terbit"
    });
  }
  
  // FAKULTAS EKONOMI DAN BISNIS (FEB) - Batch 1 s/d 10
  const febBatch = ["Batch 1 - FEB", "Batch 2 - FEB", "Batch 3 - FEB", "Batch 4 - FEB", "Batch 5 - FEB",
                    "Batch 6 - FEB", "Batch 7 - FEB", "Batch 8 - FEB", "Batch 9 - FEB", "Batch 10 - FEB"];
  const febProdi = ["Manajemen", "Akuntansi", "Bisnis Digital"];
  
  for (let i = 0; i < febBatch.length; i++) {
    const mahasiswaList = [];
    for (let j = 0; j < 10; j++) {
      const nama = daftarNama[(i + j + 5) % daftarNama.length] + (j >= daftarNama.length ? ` ${Math.floor(j / daftarNama.length) + 1}` : "");
      mahasiswaList.push({
        id: j + 1,
        nama: nama,
        nim: `23110604${String(950 + i * 10 + j).padStart(3, "0")}`,
        prodi: febProdi[j % febProdi.length],
        batch: febBatch[i],
        fakultas: "Fakultas Ekonomi dan Bisnis",
        tahunLulus: tahunRandom[i % tahunRandom.length],
        jenisKelamin: j % 2 === 0 ? "Laki-laki" : "Perempuan",
        ipk: (3.0 + (j % 100) / 100).toFixed(2),
        tempatLahir: ["Bogor", "Jakarta", "Bandung", "Depok", "Bekasi", "Tangerang"][j % 6],
        tanggalLahir: `${15 + j} ${["Januari", "Februari", "Maret"][j % 3]} 2004`,
        email: `${nama.toLowerCase().replace(/\s+/g, ".")}@student.uika.ac.id`,
        noTelp: `0812${String(345678900 + i * 10 + j).slice(0, 8)}`,
        tahunMasuk: parseInt(tahunRandom[i % tahunRandom.length]) - 3,
        totalSks: 144
      });
    }
    
    data.push({
      id: id++,
      listBatch: febBatch[i],
      fakultas: "Fakultas Ekonomi dan Bisnis",
      singkatan: "FEB",
      tahunLulus: tahunRandom[i % tahunRandom.length],
      periode: i % 2 === 0 ? "Semester Ganjil" : "Semester Genap",
      totalData: 10,
      mahasiswa: mahasiswaList,
      status: "Proses"
    });
  }
  
  // FAKULTAS HUKUM (FH) - Batch 1 s/d 8
  const fhBatch = ["Batch 1 - FH", "Batch 2 - FH", "Batch 3 - FH", "Batch 4 - FH",
                   "Batch 5 - FH", "Batch 6 - FH", "Batch 7 - FH", "Batch 8 - FH"];
  const fhProdi = ["Ilmu Hukum"];
  
  for (let i = 0; i < fhBatch.length; i++) {
    const mahasiswaList = [];
    for (let j = 0; j < 10; j++) {
      const nama = daftarNama[(i + j + 10) % daftarNama.length] + (j >= daftarNama.length ? ` ${Math.floor(j / daftarNama.length) + 1}` : "");
      mahasiswaList.push({
        id: j + 1,
        nama: nama,
        nim: `23110604${String(1000 + i * 10 + j).padStart(3, "0")}`,
        prodi: fhProdi[0],
        batch: fhBatch[i],
        fakultas: "Fakultas Hukum",
        tahunLulus: tahunRandom[i % tahunRandom.length],
        jenisKelamin: j % 2 === 0 ? "Laki-laki" : "Perempuan",
        ipk: (3.0 + (j % 100) / 100).toFixed(2),
        tempatLahir: ["Bogor", "Jakarta", "Bandung", "Depok", "Bekasi", "Tangerang"][j % 6],
        tanggalLahir: `${15 + j} ${["Januari", "Februari", "Maret"][j % 3]} 2004`,
        email: `${nama.toLowerCase().replace(/\s+/g, ".")}@student.uika.ac.id`,
        noTelp: `0812${String(345678900 + i * 10 + j).slice(0, 8)}`,
        tahunMasuk: parseInt(tahunRandom[i % tahunRandom.length]) - 3,
        totalSks: 144
      });
    }
    
    data.push({
      id: id++,
      listBatch: fhBatch[i],
      fakultas: "Fakultas Hukum",
      singkatan: "FH",
      tahunLulus: tahunRandom[i % tahunRandom.length],
      periode: i % 2 === 0 ? "Semester Ganjil" : "Semester Genap",
      totalData: 10,
      mahasiswa: mahasiswaList,
      status: "Revoke"
    });
  }
  
  // FAKULTAS AGAMA ISLAM (FAI) - Batch 1 s/d 8
  const faiBatch = ["Batch 1 - FAI", "Batch 2 - FAI", "Batch 3 - FAI", "Batch 4 - FAI",
                    "Batch 5 - FAI", "Batch 6 - FAI", "Batch 7 - FAI", "Batch 8 - FAI"];
  const faiProdi = ["Pendidikan Agama Islam", "Ekonomi Syariah"];
  
  for (let i = 0; i < faiBatch.length; i++) {
    const mahasiswaList = [];
    for (let j = 0; j < 10; j++) {
      const nama = daftarNama[(i + j + 15) % daftarNama.length] + (j >= daftarNama.length ? ` ${Math.floor(j / daftarNama.length) + 1}` : "");
      mahasiswaList.push({
        id: j + 1,
        nama: nama,
        nim: `23110604${String(1050 + i * 10 + j).padStart(3, "0")}`,
        prodi: faiProdi[j % faiProdi.length],
        batch: faiBatch[i],
        fakultas: "Fakultas Agama Islam",
        tahunLulus: tahunRandom[i % tahunRandom.length],
        jenisKelamin: j % 2 === 0 ? "Laki-laki" : "Perempuan",
        ipk: (3.0 + (j % 100) / 100).toFixed(2),
        tempatLahir: ["Bogor", "Jakarta", "Bandung", "Depok", "Bekasi", "Tangerang"][j % 6],
        tanggalLahir: `${15 + j} ${["Januari", "Februari", "Maret"][j % 3]} 2004`,
        email: `${nama.toLowerCase().replace(/\s+/g, ".")}@student.uika.ac.id`,
        noTelp: `0812${String(345678900 + i * 10 + j).slice(0, 8)}`,
        tahunMasuk: parseInt(tahunRandom[i % tahunRandom.length]) - 3,
        totalSks: 144
      });
    }
    
    data.push({
      id: id++,
      listBatch: faiBatch[i],
      fakultas: "Fakultas Agama Islam",
      singkatan: "FAI",
      tahunLulus: tahunRandom[i % tahunRandom.length],
      periode: i % 2 === 0 ? "Semester Ganjil" : "Semester Genap",
      totalData: 10,
      mahasiswa: mahasiswaList,
      status: "Reject"
    });
  }
  
  // FAKULTAS ILMU KESEHATAN (FIKES) - Batch 1 s/d 8
  const fikesBatch = ["Batch 1 - FIKES", "Batch 2 - FIKES", "Batch 3 - FIKES", "Batch 4 - FIKES",
                      "Batch 5 - FIKES", "Batch 6 - FIKES", "Batch 7 - FIKES", "Batch 8 - FIKES"];
  const fikesProdi = ["Kesehatan Masyarakat", "Ilmu Gizi"];
  
  for (let i = 0; i < fikesBatch.length; i++) {
    const mahasiswaList = [];
    for (let j = 0; j < 10; j++) {
      const nama = daftarNama[(i + j + 2) % daftarNama.length] + (j >= daftarNama.length ? ` ${Math.floor(j / daftarNama.length) + 1}` : "");
      mahasiswaList.push({
        id: j + 1,
        nama: nama,
        nim: `23110604${String(1100 + i * 10 + j).padStart(3, "0")}`,
        prodi: fikesProdi[j % fikesProdi.length],
        batch: fikesBatch[i],
        fakultas: "Fakultas Ilmu Kesehatan",
        tahunLulus: tahunRandom[i % tahunRandom.length],
        jenisKelamin: j % 2 === 0 ? "Laki-laki" : "Perempuan",
        ipk: (3.0 + (j % 100) / 100).toFixed(2),
        tempatLahir: ["Bogor", "Jakarta", "Bandung", "Depok", "Bekasi", "Tangerang"][j % 6],
        tanggalLahir: `${15 + j} ${["Januari", "Februari", "Maret"][j % 3]} 2004`,
        email: `${nama.toLowerCase().replace(/\s+/g, ".")}@student.uika.ac.id`,
        noTelp: `0812${String(345678900 + i * 10 + j).slice(0, 8)}`,
        tahunMasuk: parseInt(tahunRandom[i % tahunRandom.length]) - 3,
        totalSks: 144
      });
    }
    
    data.push({
      id: id++,
      listBatch: fikesBatch[i],
      fakultas: "Fakultas Ilmu Kesehatan",
      singkatan: "FIKES",
      tahunLulus: tahunRandom[i % tahunRandom.length],
      periode: i % 2 === 0 ? "Semester Ganjil" : "Semester Genap",
      totalData: 10,
      mahasiswa: mahasiswaList,
      status: "Terbit"
    });
  }
  
  // FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN (FKIP) - Batch 1 s/d 8
  const fkipBatch = ["Batch 1 - FKIP", "Batch 2 - FKIP", "Batch 3 - FKIP", "Batch 4 - FKIP",
                     "Batch 5 - FKIP", "Batch 6 - FKIP", "Batch 7 - FKIP", "Batch 8 - FKIP"];
  const fkipProdi = ["Pendidikan Bahasa Inggris", "Teknologi Pendidikan"];
  
  for (let i = 0; i < fkipBatch.length; i++) {
    const mahasiswaList = [];
    for (let j = 0; j < 10; j++) {
      const nama = daftarNama[(i + j + 7) % daftarNama.length] + (j >= daftarNama.length ? ` ${Math.floor(j / daftarNama.length) + 1}` : "");
      mahasiswaList.push({
        id: j + 1,
        nama: nama,
        nim: `23110604${String(1150 + i * 10 + j).padStart(3, "0")}`,
        prodi: fkipProdi[j % fkipProdi.length],
        batch: fkipBatch[i],
        fakultas: "Fakultas Keguruan dan Ilmu Pendidikan",
        tahunLulus: tahunRandom[i % tahunRandom.length],
        jenisKelamin: j % 2 === 0 ? "Laki-laki" : "Perempuan",
        ipk: (3.0 + (j % 100) / 100).toFixed(2),
        tempatLahir: ["Bogor", "Jakarta", "Bandung", "Depok", "Bekasi", "Tangerang"][j % 6],
        tanggalLahir: `${15 + j} ${["Januari", "Februari", "Maret"][j % 3]} 2004`,
        email: `${nama.toLowerCase().replace(/\s+/g, ".")}@student.uika.ac.id`,
        noTelp: `0812${String(345678900 + i * 10 + j).slice(0, 8)}`,
        tahunMasuk: parseInt(tahunRandom[i % tahunRandom.length]) - 3,
        totalSks: 144
      });
    }
    
    data.push({
      id: id++,
      listBatch: fkipBatch[i],
      fakultas: "Fakultas Keguruan dan Ilmu Pendidikan",
      singkatan: "FKIP",
      tahunLulus: tahunRandom[i % tahunRandom.length],
      periode: i % 2 === 0 ? "Semester Ganjil" : "Semester Genap",
      totalData: 10,
      mahasiswa: mahasiswaList,
      status: "Proses"
    });
  }
  
  return data;
};

const batchData = generateBatchData();

// Opsi filter
const fakultasOptions = [
  "Semua Fakultas",
  "Fakultas Teknik dan Sains",
  "Fakultas Ekonomi dan Bisnis",
  "Fakultas Hukum",
  "Fakultas Agama Islam",
  "Fakultas Ilmu Kesehatan",
  "Fakultas Keguruan dan Ilmu Pendidikan"
];

// PERUBAHAN: Tambah tahun 2021, 2022, 2023
const tahunOptions = ["Semua Tahun", "2021", "2022", "2023", "2024", "2025", "2026"];

const DokumenValid = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [tahun, setTahun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // HASIL PENCARIAN MAHASISWA (NAMA, NIM, PRODI)
  const searchResult = useMemo(() => {
    if (!search) return [];

    const keyword = search.toLowerCase();
    const result = [];

    batchData.forEach((batch) => {
      if (batch.mahasiswa) {
        batch.mahasiswa.forEach((mhs) => {
          const matchNama = mhs.nama.toLowerCase().includes(keyword);
          const matchNim = String(mhs.nim).toLowerCase().includes(keyword);
          const matchProdi = mhs.prodi.toLowerCase().includes(keyword);

          if (matchNama || matchNim || matchProdi) {
            result.push({
              nama: mhs.nama,
              nim: mhs.nim,
              prodi: mhs.prodi,
              batch: mhs.batch || batch.listBatch,
              fakultas: mhs.fakultas || batch.fakultas,
              tahun: mhs.tahunLulus || batch.tahunLulus,
              mahasiswa: {
                ...mhs,
                batch: mhs.batch || batch.listBatch,
                fakultas: mhs.fakultas || batch.fakultas,
                tahun: mhs.tahunLulus || batch.tahunLulus,
                status: batch.status,
              },
            });
          }
        });
      }
    });

    return result;
  }, [search]);

  const filtered = useMemo(() => {
    return batchData.filter((item) => {
      const keyword = search.toLowerCase();
      const matchSearch = item.listBatch.toLowerCase().includes(keyword) || 
                         item.fakultas.toLowerCase().includes(keyword);
      const matchFakultas = !fakultas || fakultas === "Semua Fakultas" || item.fakultas === fakultas;
      const matchTahun = !tahun || tahun === "Semua Tahun" || item.tahunLulus === tahun;
      return matchSearch && matchFakultas && matchTahun;
    });
  }, [search, fakultas, tahun]);

  useEffect(() => { 
    setCurrentPage(1); 
  }, [search, fakultas, tahun]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Fungsi untuk navigasi ke detail batch
  const handleDetailClick = (item) => {
    console.log("Navigasi ke detail batch:", item);
    navigate(`/operator/dokumen-valid/batch/${item.id}`, { state: item });
  };

  // Fungsi untuk navigasi ke detail mahasiswa dari hasil pencarian
  const handleMahasiswaClick = (item) => {
    navigate(`/operator/detail-mahasiswa/${item.nim}`, { state: item.mahasiswa });
  };

  // PAGINATION SAMA PERSIS DENGAN PELAPORAN DAN MANAJEMEN DATA
  const renderPaginationButtons = () => {
    const pages = [];
    pages.push(1);
    if (currentPage > 2 && totalPages > 3) pages.push("...");
    if (currentPage === 1 && totalPages > 1) {
      pages.push(2);
    } else if (currentPage === totalPages && totalPages > 2) {
      pages.push(totalPages - 1);
    } else if (currentPage > 1 && currentPage < totalPages) {
      pages.push(currentPage);
    }
    if (currentPage < totalPages - 1 && totalPages > 3) pages.push("...");
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    return pages.map((page, index) => (
      <button
        key={index}
        onClick={() => typeof page === "number" && handlePageChange(page)}
        disabled={page === "..."}
        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold shadow-sm transition-colors ${
          page === currentPage
            ? "bg-[#00897B] text-white"
            : page === "..."
            ? "bg-transparent text-gray-400 cursor-default shadow-none"
            : "bg-[#E5E7EB] text-gray-500 hover:bg-gray-300"
        }`}
      >
        {page}
      </button>
    ));
  };

  return (
    <DashboardLayout title="Dokumen Valid">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900">Daftar Dokumen Valid</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Arsip digital ijazah dan transkrip mahasiswa yang telah melewati proses verifikasi institusi.</p>
        </div>

        {/* Search bar di kiri, dropdown filter di kanan */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap items-center gap-4 border border-gray-100">
          {/* Search Bar - DI KIRI dengan hasil pencarian */}
          <div className="flex-1 min-w-[250px] max-w-md relative">
            <div className="flex items-center bg-[#E5E5E5] rounded-lg px-4 h-11">
              <FiSearch className="text-gray-500 text-lg mr-3" />
              <input 
                type="text" 
                placeholder="Cari: Nama Mahasiswa, NIM, Prodi" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-full font-medium text-gray-700 placeholder-gray-500" 
              />
            </div>


          </div>

          {/* Dropdown Filters - DI KANAN (menjauh ke pojok) */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Dropdown Fakultas */}
            <div className="relative min-w-[220px]">
              <select 
                value={fakultas || "Semua Fakultas"} 
                onChange={(e) => setFakultas(e.target.value === "Semua Fakultas" ? "" : e.target.value)}
                className="appearance-none bg-[#E5E5E5] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg pr-10 w-full outline-none cursor-pointer"
              >
                {fakultasOptions.map((item, index) => (
                  <option key={index} value={item}>{item}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none" />
            </div>

            {/* Dropdown Tahun */}
            <div className="relative w-[150px]">
              <select 
                value={tahun || "Semua Tahun"} 
                onChange={(e) => setTahun(e.target.value === "Semua Tahun" ? "" : e.target.value)}
                className="appearance-none bg-[#E5E5E5] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg pr-10 w-full outline-none cursor-pointer"
              >
                {tahunOptions.map((item, index) => (
                  <option key={index} value={item}>{item}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none" />
            </div>
          </div>
        </div>
{/* HASIL SEARCH NAMA / NIM / PRODI */}
      {search && searchResult.length > 0 && (
        <div className="bg-white border border-[#ECECEC] rounded-xl mb-4 overflow-hidden">
          {searchResult.slice(0, 4).map((item, i) => (
            <div
              key={i}
              onClick={() =>
                navigate("/detail-mahasiswa", {
                  state: {
                    mahasiswa: item.mahasiswa,
                  },
                })
              }
              className="flex items-center justify-between px-4 py-2.5 hover:bg-[#FAFAFA] transition border-b border-[#F5F5F5] last:border-b-0 cursor-pointer"
            >
              <div>
                <p className="text-[13px] font-semibold text-[#111827] leading-none">
                  {item.nama}
                </p>

                <p className="text-[11px] text-[#9CA3AF] mt-1">
                  {item.nim} • {item.prodi}
                </p>

                <p className="text-[11px] text-[#9CA3AF] mt-1">
                  {item.fakultas}
                </p>
              </div>

              <div className="text-[11px] text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-md">
                {item.batch}
              </div>
            </div>
          ))}
        </div>
      )}
        {/* PERBAIKAN: Tabel dengan lebar kolom tetap dan tidak bergeser, font medium */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <div className="min-w-[1000px]">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-[#F3F4F6] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 w-[200px]">List Batch</th>
                  <th className="py-4 px-6 text-center w-[280px]">Fakultas</th>
                  <th className="py-4 px-6 text-center w-[120px]">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center w-[150px]">Periode</th>
                  <th className="py-4 px-6 text-center w-[100px]">Total Data</th>
                  <th className="py-4 px-6 text-center w-24">Detail</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-center font-medium text-gray-800 truncate">{actualIndex}.</td>
                      <td className="py-4 px-6 font-medium text-gray-900 truncate">{item.listBatch}</td>
                      <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">{item.fakultas}</td>
                      <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">{item.tahunLulus}</td>
                      <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">{item.periode}</td>
                      <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">{item.totalData}</td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDetailClick(item)}
                          className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition flex-shrink-0"
                        >
                          <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {paginatedData.length === 0 && (
            <div className="py-8 text-center text-gray-500 font-medium">Data tidak ditemukan.</div>
          )}

          {/* PAGINATION */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {paginatedData.length} dari {filtered.length} Data
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50"
                >
                  {"<"}
                </button>
                {renderPaginationButtons()}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50"
                >
                  {">"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DokumenValid;