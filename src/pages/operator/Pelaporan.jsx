// src/pages/operator/Pelaporan.jsx

import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";

// ==================== DATA MASTER ====================
const generateDummyData = () => {
  const data = [];
  
  const namaList = [
    "Adi Saputra", "Rani Maharani", "Budi Pratama", "Kayla Keyla", "Rizky Gusti A",
    "Risma Puspita", "Budi Doremi", "Siti Aisyah", "Eagle Al-Haikal", "Zahra Nabil",
    "Dila Fadilla", "Nayla Nim", "Samsul Jun", "Rayyan Hesa", "Zahra Nur",
    "Zulvikri", "Tasya Cantika", "Baedilah", "Mutqin", "Husni Haqiqi"
  ];
  
  const batchList = [
    "Batch 1 - FTS", "Batch 2 - FTS", "Batch 3 - FTS", "Batch 4 - FTS", "Batch 5 - FTS",
    "Batch 1 - FEB", "Batch 2 - FEB", "Batch 3 - FEB", "Batch 4 - FEB",
    "Batch 1 - FH", "Batch 2 - FH", "Batch 3 - FH",
    "Batch 1 - FAI", "Batch 2 - FAI", "Batch 3 - FAI",
    "Batch 1 - FIKES", "Batch 2 - FIKES", "Batch 3 - FIKES",
    "Batch 1 - FKIP", "Batch 2 - FKIP", "Batch 3 - FKIP"
  ];
  
  const fakultasData = [
    { nama: "Fakultas Teknik dan Sains", singkatan: "FTS", prodi: ["Teknik Informatika", "Teknik Mesin", "Teknik Sipil", "Sistem Informasi"] },
    { nama: "Fakultas Ekonomi dan Bisnis", singkatan: "FEB", prodi: ["Manajemen", "Akuntansi", "Bisnis Digital"] },
    { nama: "Fakultas Hukum", singkatan: "FH", prodi: ["Ilmu Hukum"] },
    { nama: "Fakultas Agama Islam", singkatan: "FAI", prodi: ["Pendidikan Agama Islam", "Ekonomi Syariah"] },
    { nama: "Fakultas Ilmu Kesehatan", singkatan: "FIKES", prodi: ["Kesehatan Masyarakat", "Ilmu Gizi"] },
    { nama: "Fakultas Keguruan dan Ilmu Pendidikan", singkatan: "FKIP", prodi: ["Pendidikan Bahasa Inggris", "Teknologi Pendidikan"] }
  ];
  
  const statusList = ["Proses", "Terbit", "Revoke", "Reject"];
  const ketMap = {
    "Proses": "Di Proses Validasi oleh Operator",
    "Terbit": "Telah di Validasi Oleh Rektor",
    "Revoke": "Di Revoke oleh Wakil Dekan",
    "Reject": "Di Reject oleh Dekan"
  };
  
  const tempatLahirList = ["Bogor", "Jakarta", "Bandung", "Depok", "Bekasi", "Tangerang"];
  const bulanList = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  for (let i = 0; i < 60; i++) {
    const nama = namaList[i % namaList.length] + (i >= namaList.length ? ` ${Math.floor(i / namaList.length) + 1}` : "");
    const batch = batchList[i % batchList.length];
    
    const batchSingkatan = batch.split(" - ")[1];
    const fakultasObj = fakultasData.find(f => f.singkatan === batchSingkatan);
    const fakultas = fakultasObj ? fakultasObj.nama : fakultasData[0].nama;
    const prodiList = fakultasObj ? fakultasObj.prodi : fakultasData[0].prodi;
    const prodi = prodiList[i % prodiList.length];
    
    const status = statusList[i % statusList.length];
    const tahunLulus = 2024 + (i % 3);
    const tempatLahir = tempatLahirList[i % tempatLahirList.length];
    const tanggal = Math.floor(Math.random() * 28) + 1;
    const bulan = bulanList[i % bulanList.length];
    const tahun = 2004 - Math.floor(i / 15);
    const jenisKelamin = i % 3 === 0 ? "Perempuan" : "Laki-laki";
    const ipk = (3.0 + (i % 100) / 100).toFixed(2);
    const tahunMasuk = tahunLulus === 2026 ? 2022 : tahunLulus === 2025 ? 2021 : 2020;
    
    data.push({
      id: i + 1,
      nama: nama,
      nim: `23110604${String(900 + i).padStart(3, "0")}`,
      batch: batch,
      fakultas: fakultas,
      prodi: prodi,
      tahunLulus: tahunLulus,
      tanggal: `24/${String((i % 12) + 1).padStart(2, "0")}/2025`,
      waktu: `${8 + (i % 10)}.${String(i % 60).padStart(2, "0")} WIB`,
      status: status,
      ket: ketMap[status],
      tempatLahir: tempatLahir,
      tanggalLahir: `${tanggal} ${bulan} ${tahun}`,
      jenisKelamin: jenisKelamin,
      email: `${nama.toLowerCase().replace(/\s+/g, ".")}@student.uika.ac.id`,
      noTelp: `0812${String(345678900 + i).slice(0, 8)}`,
      tahunMasuk: tahunMasuk,
      ipk: ipk,
      totalSks: 144
    });
  }
  
  return data;
};

export const dummyData = generateDummyData();
const ITEMS_PER_PAGE = 10;

const badgeClass = (status) => {
  const map = {
    "Proses": "bg-[#3B82F6] text-white",
    "Terbit": "bg-[#16A36B] text-white",
    "Revoke": "bg-[#F59E0B] text-white",
    "Reject": "bg-[#EF4444] text-white"
  };
  return map[status] || "bg-gray-400 text-white";
};

const Pelaporan = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const statusOptions = ["Semua Status", "Proses", "Terbit", "Revoke", "Reject"];

  const filtered = useMemo(() => {
    return dummyData.filter((item) => {
      const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase()) || 
                         item.nim.includes(search);
      const matchStatus = !statusFilter || statusFilter === "Semua Status" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

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
    <DashboardLayout title="Pelaporan">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900">Manajemen Pelaporan</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Kelola dan pantau seluruh pelaporan validasi ijazah mahasiswa.</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap items-center gap-4 border border-gray-100">
          <div className="flex items-center bg-[#E5E5E5] rounded-lg px-4 h-11 flex-1 min-w-[250px] max-w-md">
            <FiSearch className="text-gray-500 text-lg mr-3" />
            <input 
              type="text" 
              placeholder="Cari: Nama, NIM" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full font-medium text-gray-700 placeholder-gray-500" 
            />
          </div>

          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#E5E5E5] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg pr-10 min-w-[180px] outline-none cursor-pointer"
            >
              {statusOptions.map((item) => (
                <option key={item} value={item === "Semua Status" ? "" : item}>{item}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[#F3F4F6] text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-center w-16">No.</th>
                <th className="py-4 px-6">Nama</th>
                <th className="py-4 px-6 text-center">NIM</th>
                <th className="py-4 px-6 text-center">Tanggal</th>
                <th className="py-4 px-6 text-center">Waktu</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6">Keterangan</th>
                <th className="py-4 px-6 text-center w-24">Detail</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, idx) => {
                const no = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{no}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-800">{item.nama}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{item.batch}</div>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-700">{item.nim}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{item.tanggal}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{item.waktu}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${badgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-medium">{item.ket}</td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => navigate(`/operator/detail-pelaporan/${item.nim}`, { state: item })}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition"
                      >
                        <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="py-8 text-center text-gray-500 font-medium">Data tidak ditemukan.</div>
          )}

          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {paginated.length} dari {filtered.length} Data
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

export default Pelaporan;