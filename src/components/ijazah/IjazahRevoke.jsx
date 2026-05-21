import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../ui/DashboardLayout";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const IjazahRevoke = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [tahun, setTahun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fakultasList = [
    { nama: "Fakultas Teknik dan Sains", kode: "FTS" },
    { nama: "Fakultas Hukum", kode: "FH" },
    { nama: "Fakultas Ekonomi dan Bisnis", kode: "FEB" },
    { nama: "Fakultas Agama Islam", kode: "FAI" },
    { nama: "Fakultas Ilmu Kesehatan", kode: "FIKES" },
    { nama: "Fakultas Keguruan dan Ilmu Pendidikan", kode: "FKIP" },
  ];
  const years = ["2024", "2025", "2026"];
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const dummyData = useMemo(() => {
    let result = [];
    for (let i = 1; i <= 570; i++) { 
      const randomFakultas = getRandom(fakultasList);
      result.push({
        batch: `Batch ${i} - ${randomFakultas.kode}`,
        fakultas: randomFakultas.nama,
        tahun: getRandom(years),
        periode: "Semester Ganjil",
        total: 10,
        status: "Revoke",
      });
    }
    return result;
  }, []);

  const filtered = dummyData.filter((item) => {
    const keyword = search.toLowerCase();
    return (
      item.batch.toLowerCase().includes(keyword) &&
      (fakultas ? item.fakultas === fakultas : true) &&
      (tahun ? item.tahun === tahun : true)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage); 
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, fakultas, tahun]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    let pages = [];
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) pages = [1, 2, '...', totalPages];
      else if (currentPage >= totalPages - 1) pages = [1, '...', totalPages - 1, totalPages];
      else pages = [1, '...', currentPage, '...', totalPages];
    }

    return pages.map((page, index) => {
      const isActive = currentPage === page;
      const isEllipsis = page === '...';
      return (
        <button
          key={index}
          onClick={() => !isEllipsis && handlePageChange(page)}
          disabled={isEllipsis}
          className={`w-11.5 h-11.5 flex items-center justify-center rounded-xl font-bold text-[18px] transition-all ${
            isActive ? "bg-[#115E59] text-white shadow-sm" : "bg-[#CBD5E1] text-white hover:bg-[#b0bcc9]" 
          } ${isEllipsis ? "cursor-default hover:bg-[#CBD5E1]" : ""}`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* HEADER: Tombol Kembali dihapus sesuai instruksi */}
        <div className="mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold text-gray-800 tracking-tight">
              Jumlah Ijazah di Revoke
            </h1>
            <p className="text-[#9CA3AF] text-[14px] font-medium">
              Update terakhir: 17 Januari 2026, 09:10 WIB • Fakultas Teknik dan Sains
            </p>
          </div>
        </div>

        {/* FILTER BOX */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap items-center gap-4 border border-gray-100">
          <div className="flex items-center bg-[#F3F4F6] rounded-lg px-4 h-11 flex-1 min-w-62.5 max-w-md">
            <FiSearch className="text-gray-500 text-lg mr-3" />
            <input type="text" placeholder="Cari: Nama, NIM, Prodi" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-sm w-full font-medium text-gray-700 placeholder-gray-500" />
          </div>
          <div className="relative">
            <select value={fakultas} onChange={(e) => setFakultas(e.target.value)} className="appearance-none bg-[#F3F4F6] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg pr-10 min-w-55 outline-none cursor-pointer">
              <option value="">Semua Fakultas</option>
              {fakultasList.map((f, i) => (<option key={i} value={f.nama}>{f.nama}</option>))}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none" />
          </div>
          <div className="relative">
            <select value={tahun} onChange={(e) => setTahun(e.target.value)} className="appearance-none bg-[#F3F4F6] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg pr-10 min-w-37.5 outline-none cursor-pointer">
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
                <th className="py-4 px-6 text-center">Status</th>
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
                    
                    {/* 🔥 STATUS KUNING SESUAI BATCH */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block bg-[#EAB308] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
                        {item.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div
                        onClick={() => navigate(`/batch-revoke/${actualIndex}`, { state: item })}
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
        </div>

        {/* PAGINATION */}
        <div className="flex justify-end items-center px-6 py-6 gap-3 border-t border-gray-100 bg-white rounded-b-xl">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center justify-center px-2 text-[28px] font-bold transition-colors ${ currentPage === 1 ? "text-[#CBD5E1] cursor-not-allowed" : "text-[#94a3b8] hover:text-[#64748b]" }`}> &lt; </button>
          {renderPaginationButtons()}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`flex items-center justify-center px-2 text-[28px] font-bold transition-colors ${ currentPage === totalPages ? "text-[#CBD5E1] cursor-not-allowed" : "text-[#115E59] hover:text-[#0B4B48]" }`}> &gt; </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default IjazahRevoke;