import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { getValidDocumentBatches } from "../../services/document.api";

const fakultasList = [
  { nama: "Fakultas Agama Islam", kode: "FAI" },
  { nama: "Fakultas Keguruan dan Ilmu Pendidikan", kode: "FKIP" },
  { nama: "Fakultas Ekonomi dan Bisnis", kode: "FEB" },
  { nama: "Fakultas Teknik dan Sains", kode: "FTS" },
  { nama: "Fakultas Hukum", kode: "FH" },
  { nama: "Fakultas Ilmu Kesehatan", kode: "FIKES" },
];

const ITEMS_PER_PAGE = 10;

const RektorDokumenValid = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const filterBarRef = useRef(null);

  const [batches, setBatches] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total_data: 0,
    total_page: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2021 + 1 },
    (_, i) => currentYear - i,
  );

  const totalPages = pagination.total_page || 1;
  const currentData = batches;

  const searchSuggestions = batches.filter((item) => {
    if (!search.trim()) return true;

    const keyword = search.toLowerCase();

    return (
      item.batch?.toLowerCase().includes(keyword) ||
      item.nomor_batch_upload?.toLowerCase().includes(keyword) ||
      item.fakultas?.toLowerCase().includes(keyword) ||
      item.nama_file?.toLowerCase().includes(keyword)
    );
  });

  const fetchValidBatches = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getValidDocumentBatches({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search,
        fakultas: selectedFakultas,
        tahun: selectedYear,
      });

      setBatches(result.data || []);
      setPagination(
        result.pagination || {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          total_data: 0,
          total_page: 1,
        },
      );
    } catch (error) {
      console.error("Gagal mengambil dokumen valid:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil dokumen valid.",
      );
      setBatches([]);
      setPagination({
        page: 1,
        limit: ITEMS_PER_PAGE,
        total_data: 0,
        total_page: 1,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValidBatches();
  }, [currentPage, search, selectedFakultas, selectedYear]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    setShowSuggestions(true);
  };

  const handleFakultasChange = (e) => {
    setSelectedFakultas(e.target.value);
    setCurrentPage(1);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setCurrentPage(1);
  };

  const handleGoDetail = (item) => {
    navigate(`/rektor/detail-dokumen-valid/${item.id_batch_upload || item.id}`, {
      state: item,
    });
  };

  const renderPages = () => {
    let pages = [];

    if (totalPages <= 4) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 2) {
      pages = [1, 2, "...", totalPages];
    } else if (currentPage >= totalPages - 1) {
      pages = [1, "...", totalPages - 1, totalPages];
    } else {
      pages = [1, "...", currentPage, "...", totalPages];
    }

    return pages.map((p, idx) => {
      const isActive = p === currentPage;
      const isEllipsis = p === "...";

      return (
        <button
          key={idx}
          onClick={() => !isEllipsis && handlePage(p)}
          disabled={isEllipsis}
          className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-bold transition-all
            ${
              isActive
                ? "bg-[#117065] text-white shadow-md"
                : "bg-[#E5E7EB] text-gray-500 hover:bg-gray-300"
            }
            ${isEllipsis ? "cursor-default" : "cursor-pointer"}`}
        >
          {p}
        </button>
      );
    });
  };

  const DetailIcon = () => (
    <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500" />
  );

  return (
    <DashboardLayout title="Dokumen Valid">
      <div className="w-full pb-10">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Daftar Dokumen Valid
          </h1>
          <p className="text-[#9CA3AF] text-[14px] font-medium mt-1">
            Arsip digital ijazah dan transkrip mahasiswa yang telah melewati
            proses verifikasi institusi.
          </p>
        </div>
      {/* 🔥 WRAPPER UTAMA: Membungkus Filter & Suggestions agar Click Outside tidak error */}
        <div ref={filterBarRef} className="relative z-20">
          
          {/* ✅ FILTER BAR */}
          <div className={`bg-white p-4 shadow-sm border border-gray-100 ${showSuggestions && searchSuggestions.length > 0 ? "rounded-t-xl" : "rounded-xl mb-6"}`}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

              {/* Search */}
              <div className="w-full lg:max-w-md">
                <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
                  <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari: Nama, NIM, Prodi..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowSuggestions(true);
                      setCurrentPage(1);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Dropdowns */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full lg:w-72">
                  <select
                    value={selectedFakultas}
                    onChange={(e) => { setSelectedFakultas(e.target.value); setCurrentPage(1); }}
                    className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-center"
                  >
                    <option value="">Semua Fakultas</option>
                    {fakultasList.map((f) => (
                      <option key={f.kode} value={f.nama}>{f.nama}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
                </div>

                <div className="relative w-full lg:w-44">
                  <select
                    value={selectedYear}
                    onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                    className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-center"
                  >
                    <option value="">Semua Tahun</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ✅ SUGGESTIONS LIST */}
          {showSuggestions && (
            <div
              className="absolute left-0 right-0 top-full bg-white border-x border-b border-gray-100 shadow-lg rounded-b-xl mb-6 overflow-y-auto"
              style={{ maxHeight: "260px", marginTop: "-1px" }}
            >
              {searchSuggestions.length > 0 ? (
                searchSuggestions.map((student, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setShowSuggestions(false);
                      setSearch(""); 
                      
                      const mahasiswaWrapper = {
                        nama_mahasiswa: student.nama,
                        nim: student.nim,
                        program_studi: student.prodi,
                        fakultas: student.fakultas,
                        status: "terbit" 
                      };

                      navigate(`/rektor/detail-mahasiswa/${encodeURIComponent(student.nim)}`, { 
                        state: { 
                          mahasiswa: mahasiswaWrapper, 
                          source: "dokumen_valid" 
                        } 
                      });
                    }}
                    className="px-6 py-4 border-b border-gray-50 hover:bg-teal-50 cursor-pointer flex justify-between items-center transition-colors last:border-b-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="font-bold text-[#1F2937] text-[14px] mb-0.5">{student.nama}</div>
                      <div className="text-[12px] font-normal text-gray-500">{student.nim} • {student.prodi}</div>
                      <div className="text-[12px] font-normal text-gray-400">{student.fakultas}</div>
                    </div>
                    <div className="text-[11px] font-semibold bg-[#F3F4F6] text-gray-500 px-3 py-1.5 rounded-md h-fit whitespace-nowrap ml-4">
                      {student.batch}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-gray-400 border-t border-gray-100">
                  Mahasiswa tidak ditemukan
                </div>
              )}
            </div>
          )}
        </div>
        {/* AKHIR WRAPPER */}

        {/* Jarak penyeimbang jika dropdown tidak tampil */}
        {!showSuggestions && <div className="mb-0" />}

        {(!showSuggestions || !search.trim()) && <div className="mb-6" />}

        {errorMessage && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 w-[200px]">List Batch</th>
                  <th className="py-4 px-6">Fakultas</th>
                  <th className="py-4 px-6 text-center">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center">Periode</th>
                  <th className="py-4 px-6 text-center">Total Data</th>
                  <th className="py-4 px-6 text-center w-20">Detail</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-12 text-center text-gray-400 font-medium"
                    >
                      Memuat data dokumen valid...
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((item, i) => (
                    <tr
                      key={item.id_batch_upload || item.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 text-center font-semibold text-gray-800">
                        {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}.
                      </td>

                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {item.batch || item.nomor_batch_upload || "-"}
                      </td>

                      <td className="py-4 px-6 font-normal text-gray-700">
                        {item.fakultas || "-"}
                      </td>

                      <td className="py-4 px-6 text-center font-normal text-gray-700">
                        {item.tahun || "-"}
                      </td>

                      <td className="py-4 px-6 text-center font-normal text-gray-700">
                        {item.periode || "-"}
                      </td>

                      <td className="py-4 px-6 text-center font-normal text-gray-700">
                        {item.total || 0}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleGoDetail(item)}
                          className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition flex-shrink-0"
                        >
                          <DetailIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-12 text-center text-gray-400 font-medium"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <FiSearch className="text-4xl mb-3 text-gray-300" />
                        <p>Data dokumen tidak ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-5 border-t border-gray-100 bg-white flex justify-between items-center">
            <p className="text-sm text-gray-400 font-medium">
              Menampilkan {currentData.length} dari{" "}
              {pagination.total_data || 0} data
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-2 text-[18px] font-bold text-gray-400 hover:text-gray-800 disabled:opacity-30 transition-colors cursor-pointer"
              >
                &lt;
              </button>

              {renderPages()}

              <button
                onClick={() => handlePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center px-2 text-[18px] font-bold text-[#117065] hover:text-teal-900 disabled:opacity-30 transition-colors cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RektorDokumenValid;