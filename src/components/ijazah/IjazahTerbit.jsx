import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const IjazahTerbit = () => {
  const navigate = useNavigate();

  // ==========================================================================
  // 1. STATE UI (TETAP DIPERTAHANKAN)
  // ==========================================================================
  const [search, setSearch] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [tahun, setTahun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==========================================================================
  // 🟢 TODO [API]: 2. BUKA KOMENTAR STATE INI SAAT API BACKEND READY
  // ==========================================================================
  // const [dataBatch, setDataBatch] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [totalPagesFromAPI, setTotalPagesFromAPI] = useState(0);

  // ==========================================================================
  // 🟢 TODO [API]: 3. HAPUS SEMUA DATA DUMMY INI
  // ==========================================================================
  const fakultasList = [
    { nama: "Fakultas Teknik dan Sains", kode: "FTS", prodi: ["Teknik Informatika", "Teknik Mesin", "Teknik Sipil", "Sistem informasi", "Ilmu Lingkungan", "Rekayasa Pertanian dan Biosistem", "Teknik Elektro "] },
    { nama: "Fakultas Hukum", kode: "FH", prodi: ["Hukum Bisnis", "Ilmu Hukum"] },
    { nama: "Fakultas Ekonomi dan Bisnis", kode: "FEB", prodi: ["Manajemen", "Akuntansi", "Keuangan dan Perbankan", "Perbankan dan Keuangan Digital"] },
    { nama: "Fakultas Agama Islam", kode: "FAI", prodi: ["Pendidikan Agama Islam", "Ekonomi Syariah", "Hukum Keluarga Islam / Ahwal Al Syakhsiyyah", 
      "Komunikasi dan Penyiaran Islam", "Pendidikan Guru Madrasah Ibtidaiyah", "Bimbingan dan Konseling Pendidikan Islam", "Manajemen Haji dan Umrah", "lmu Al-Qur'an dan Tafsir"] },
    { nama: "Fakultas Ilmu Kesehatan", kode: "FIKES", prodi: ["Kesehatan Masyrakat", "Ilmu gizi"] },
    { nama: "Fakultas Keguruan dan Ilmu Pendidikan", kode: "FKIP", prodi: ["Pendidikan Bahasa Inggris", "Teknologi Pendidikan", "Pendidikan Masyarakat (PLS)", "Pendidikan Matematika"] },
  ];
  const years = ["2024", "2025", "2026"];
  const namaList = ["Adi Saputra", "Rani Maharani", "Budi Pratama", "Siti Aisyah", "Yoga Pratama", "Nabila Putri"];
  
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const dummyData = useMemo(() => {
    let result = [];
    fakultasList.forEach((fak) => {
      for (let i = 1; i <= 285; i++) { 
        const mahasiswa = Array.from({ length: 10 }, (_, index) => ({
          nama: getRandom(namaList),
          nim: "23" + Math.floor(Math.random() * 99999999),
          prodi: getRandom(fak.prodi),
          status: "Terbit",
        }));
        result.push({
          batch: `Batch ${i} - ${fak.kode}`,
          fakultas: fak.nama,
          tahun: getRandom(years),
          periode: "Semester Ganjil",
          total: mahasiswa.length,
          mahasiswa,
        });
      }
    });
    return result;
  }, []);

  // ==========================================================================
  // 🟢 TODO [API]: 4. HAPUS LOGIKA FILTER & SLICE LOKAL INI
  // ==========================================================================
  const filtered = dummyData.filter((item) => {
    const keyword = search.toLowerCase();
    return (
      item.batch.toLowerCase().includes(keyword) &&
      (fakultas ? item.fakultas === fakultas : true) &&
      (tahun ? item.tahun === tahun : true)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage); 
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==========================================================================
  // 6. LOGIKA UI (TETAP DIPERTAHANKAN)
  // ==========================================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fakultas, tahun]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // ==========================================================================
  // PAGINATION MENGIKUTI GAYA DARI DASHBOARD
  // ==========================================================================
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
        type="button"
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
    <DashboardLayout>
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900">
            Jumlah Ijazah Terbit
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Update terakhir: 17 Januari 2026, 09:10 WIB
          </p>
        </div>

        {/* FILTER BOX */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap items-center gap-4 border border-gray-100">
          <div className="flex items-center bg-[#E5E5E5] rounded-lg px-4 h-11 flex-1 min-w-[250px] max-w-md">
            <FiSearch className="text-gray-500 text-lg mr-3" />
            <input
              type="text"
              placeholder="Cari: Nama, NIM, Prodi"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full font-medium text-gray-700 placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <select
              value={fakultas}
              onChange={(e) => setFakultas(e.target.value)}
              className="appearance-none bg-[#E5E5E5] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg pr-10 min-w-[220px] outline-none cursor-pointer"
            >
              <option value="">Semua Fakultas</option>
              {fakultasList.map((f, i) => (
                <option key={i} value={f.nama}>{f.nama}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="appearance-none bg-[#E5E5E5] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg pr-10 min-w-[150px] outline-none cursor-pointer"
            >
              <option value="">Tahun Lulus</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none" />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[#F3F4F6] text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-center w-16">No.</th>
                <th className="py-4 px-6">List Batch</th>
                <th className="py-4 px-6 text-center">Fakultas</th>
                <th className="py-4 px-6 text-center">Tahun Lulus</th>
                <th className="py-4 px-6 text-center">Periode</th>
                <th className="py-4 px-6 text-center">Total Data</th>
                <th className="py-4 px-6 text-center w-24">Detail</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((item, i) => {
                const actualIndex = (currentPage - 1) * itemsPerPage + i + 1;
                return (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{actualIndex}.</td>
                    <td className="py-4 px-6 font-bold text-gray-900">{item.batch}</td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">{item.fakultas}</td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">{item.tahun}</td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">{item.periode}</td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">{item.total}</td>
                    <td className="py-4 px-6 text-center">
                      <div
                        onClick={() => navigate(`/batch/terbit/${actualIndex}`, { state: item })}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition"
                      >
                        <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginatedData.length === 0 && (
            <div className="py-8 text-center text-gray-500 font-medium">
              Data tidak ditemukan.
            </div>
          )}

          {/* PAGINATION - MENGGUNAKAN GAYA DARI DASHBOARD */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {paginatedData.length} dari {filtered.length} Data
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50"
                >
                  {"<"}
                </button>

                {renderPaginationButtons()}

                <button
                  type="button"
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

export default IjazahTerbit;