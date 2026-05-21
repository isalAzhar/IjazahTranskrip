import React, { useState, useMemo } from "react";
import { FiSearch, FiChevronDown, FiXCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/ui/DashboardLayout";

const ManajemenData = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🟢 LOGIKA TAHUN DINAMIS (2021 - Sekarang)
  const currentYear = new Date().getFullYear(); // Mengambil tahun saat ini (misal: 2026)
  const years = Array.from(
    { length: currentYear - 2021 + 1 },
    (_, i) => currentYear - i
  );

  // 🟢 DUMMY DATA BATCH
  const dummyData = useMemo(() => {
    return Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      batch: `Batch ${i + 1} - FTS`,
      fakultas: "Fakultas Teknik dan Sains",
      tahun: 2026 - (i % 3), // Variasi tahun kelulusan
      periode: i % 2 === 0 ? "Semester Genap" : "Semester Ganjil",
      total: 10,
    }));
  }, []);

  // 🟢 FILTER LOGIC
  const filteredData = useMemo(() => {
    return dummyData.filter((item) => {
      const matchSearch = item.batch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchYear = selectedYear === "" || item.tahun.toString() === selectedYear;
      return matchSearch && matchYear;
    });
  }, [searchQuery, selectedYear, dummyData]);

  // 🟢 PAGINATION LOGIC
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentTableData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDetail = (batchData) => {
    // Navigasi ke halaman detail batch
    navigate(`/detail-batch/${batchData.id}`, { state: batchData });
  };

  const handleReject = (batchId) => {
    alert(`Konfirmasi: Apakah Anda yakin ingin me-reject Batch ${batchId}?`);
  };

  // Ikon Detail Kustom (Dokumen + Kaca Pembesar)
  const DocumentSearchIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-800 transition-colors">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <circle cx="10" cy="13" r="2"></circle>
      <line x1="11.4" y1="14.4" x2="14" y2="17"></line>
    </svg>
  );

  return (
    <DashboardLayout>
      <div className="w-full pb-10">
        
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Manajemen Data
          </h1>
          <p className="text-[#9CA3AF] text-[14px] font-medium mt-1">
            Kelola validasi dan kirim data mahasiswa ke Wakil Dekan Fakultas
          </p>
        </div>

        {/* FILTER BAR SESUAI FIGMA */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4 border border-gray-100">
          {/* Search Input */}
          <div className="flex items-center bg-[#F3F4F6] rounded-lg px-4 h-11 flex-1 w-full">
            <FiSearch className="text-gray-500 text-lg mr-3" />
            <input
              type="text"
              placeholder="Cari: Nama, NIM, Prodi"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Dropdown Tahun */}
          <div className="relative w-full md:w-56">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-[#F3F4F6] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer"
            >
              <option value="">Tahun Lulus</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none" />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6">List Batch</th>
                  <th className="py-4 px-6">Fakultas</th>
                  <th className="py-4 px-6 text-center">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center">Periode</th>
                  <th className="py-4 px-6 text-center">Total Data</th>
                  <th className="py-4 px-6 text-center w-20">Detail</th>
                  <th className="py-4 px-6 text-center w-20">Reject</th>
                </tr>
              </thead>
              <tbody>
                {currentTableData.map((item, i) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-center font-bold text-gray-800">
                      {(currentPage - 1) * itemsPerPage + i + 1}.
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {item.batch}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {item.fakultas}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      {item.tahun}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      {item.periode}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      {item.total}
                    </td>

                    {/* Tombol Detail */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDetail(item)}
                        className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                        title="Lihat Detail"
                      >
                        <DocumentSearchIcon />
                      </button>
                    </td>

                    {/* Tombol Reject */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleReject(item.id)}
                        className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-red-50 transition-colors group"
                        title="Reject Batch"
                      >
                        <FiXCircle className="text-red-500 group-hover:text-red-600" size={22} />
                      </button>
                    </td>
                  </tr>
                ))}

                {currentTableData.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-gray-500 font-medium">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center px-6 py-6 gap-3 border-t border-gray-100 bg-white">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-2 text-[20px] font-bold text-gray-400 hover:text-gray-800 disabled:opacity-50 transition-colors"
              >
                &lt;
              </button>
              
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#115E59] text-white text-sm font-bold shadow-sm">
                {currentPage}
              </button>
              
              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded bg-[#E5E7EB] text-gray-500 hover:bg-gray-300 text-sm font-bold transition-colors"
                >
                  {currentPage + 1}
                </button>
              )}
              
              <span className="px-1 text-gray-400 font-bold">...</span>
              
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="w-8 h-8 flex items-center justify-center rounded bg-[#E5E7EB] text-gray-500 hover:bg-gray-300 text-sm font-bold transition-colors"
              >
                {totalPages}
              </button>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center px-2 text-[20px] font-bold text-gray-400 hover:text-gray-800 disabled:opacity-50 transition-colors"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
        
      </div>
    </DashboardLayout>
  );
};

export default ManajemenData;