import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
// 🔥 IMPORT DARI DASHBOARD API, BUKAN API BIASA
import { getDashboardBatches } from "../../services/dashboard.api"; 
import { encodeId } from "@/components/shared/hashId";

const normalizeStatus = (status) => {
  const value = status?.toString().toLowerCase();
  if (value === "terbit" || value === "approved" || value === "valid") return "terbit";
  if (value === "proses" || value === "pending") return "proses";
  if (value === "reject" || value === "rejected" || value === "ditolak") return "reject";
  if (value === "revoke" || value === "revoked" || value === "dicabut") return "revoke";
  return value || "";
};

const getBadgeLabel = (status) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case "terbit": return "Terbit";
    case "proses": return "Proses";
    case "reject": return "Reject";
    case "revoke": return "Revoke";
    default: return status || "-";
  }
};

const formatStatusEmail = (statusKirimRaw) => {
  const raw = String(statusKirimRaw || "").toLowerCase();
  if (raw.includes("sudah") || (raw.includes("terkirim") && !raw.includes("belum"))) {
    return "Email Terkirim";
  }
  return "Belum Diemail";
};

const buildFakultasOptions = (rows = []) => {
  return [...new Set(rows.map((item) => item.fakultas).filter((item) => item && item !== "-"))];
};

const buildYearOptions = (rows = []) => {
  return [...new Set(rows.map((item) => item.tahun).filter((item) => item && item !== "-"))]
    .sort((a, b) => Number(b) - Number(a));
};

const StatusIjazah = () => {
  const navigate = useNavigate();
  const { status } = useParams();
  const currentStatus = normalizeStatus(status);
  const displayLabel = getBadgeLabel(currentStatus);

  const [search, setSearch] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [tahun, setTahun] = useState("");
  const [statusEmail, setStatusEmail] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [batchData, setBatchData] = useState([]);
  const [fakultasList, setFakultasList] = useState([]);
  const [years, setYears] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchIjazahData = async () => {
      try {
        setIsLoading(true);
        setApiError("");
        setStatusEmail(""); 

        // 🔥 BIARKAN BACKEND YANG MENGELOMPOKKAN & FILTER STATUS
        const result = await getDashboardBatches({
          limit: 10000,
          status: currentStatus 
        });

        // Tambahkan properti UI (status email & label) ke data murni dari backend
        const finalData = result.data.map(item => ({
          ...item,
          status: displayLabel,
          status_email: formatStatusEmail(item.raw?.status_kirim || item.raw?.statusKirim)
        }));

        setBatchData(finalData);
        setFakultasList(buildFakultasOptions(finalData));
        setYears(buildYearOptions(finalData));
      } catch (error) {
        console.error(`Gagal mengambil data via getDashboardBatches:`, error);
        setApiError(error.message || "Gagal mengambil data dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIjazahData();
  }, [currentStatus]);

  const filtered = batchData
    .filter((item) => {
      const keyword = search.toLowerCase();
      const matchSearch = 
        item.batch.toLowerCase().includes(keyword) || 
        item.fakultas.toLowerCase().includes(keyword) || 
        item.periode.toLowerCase().includes(keyword) || 
        item.tahun.toLowerCase().includes(keyword);

      const matchesFakultas = fakultas ? item.fakultas === fakultas : true;
      const matchesTahun = tahun ? item.tahun === tahun : true;
      const matchesStatusEmail = (currentStatus === "terbit" && statusEmail) 
        ? item.status_email === statusEmail
        : true;

      return matchSearch && matchesFakultas && matchesTahun && matchesStatusEmail;
    })
    .sort((a, b) => a.fakultas.localeCompare(b.fakultas) || a.tahun.localeCompare(b.tahun));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fakultas, tahun, statusEmail]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const handleDetailBatch = (item) => {
    const safeId = encodeId(item.id);
    navigate(`../batch/${currentStatus}/${safeId}`, { state: item });
  };

  const renderPaginationButtons = () => {
    const pages = [];
    if (totalPages <= 0) return pages;
    pages.push(1);
    if (currentPage > 2 && totalPages > 3) pages.push("...");
    if (currentPage === 1 && totalPages > 1) pages.push(2);
    else if (currentPage === totalPages && totalPages > 2) pages.push(totalPages - 1);
    else if (currentPage > 1 && currentPage < totalPages) pages.push(currentPage);
    if (currentPage < totalPages - 1 && totalPages > 3) pages.push("...");
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    return pages.map((page, index) => (
      <button
        key={index}
        type="button"
        onClick={() => typeof page === "number" && handlePageChange(page)}
        disabled={page === "..."}
        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold shadow-sm transition-colors ${
          page === currentPage ? "bg-[#117065] text-white" : page === "..." ? "bg-transparent text-gray-400 cursor-default shadow-none" : "bg-white border border-gray-300 text-gray-500 hover:bg-gray-100"
        }`}
      >
        {page}
      </button>
    ));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#117065]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900 capitalize">
            List Ijazah {displayLabel}
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1 capitalize">Melihat kumpulan data batch yang berstatus {displayLabel}</p>
          {apiError && <p className="text-sm text-red-500 mt-2 font-semibold">{apiError}</p>}
        </div>

        {/* FILTER BOX */}
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="w-full lg:max-w-md">
              <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
                <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cari: Nama Batch, Fakultas, Periode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-56">
                <select value={fakultas} onChange={(e) => setFakultas(e.target.value)} className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left">
                  <option value="">Semua Fakultas</option>
                  {fakultasList.map((item, i) => <option key={i} value={item}>{item}</option>)}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>

              <div className="relative w-full sm:w-40">
                <select value={tahun} onChange={(e) => setTahun(e.target.value)} className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left">
                  <option value="">Semua Tahun</option>
                  {years.map((item, i) => <option key={i} value={item}>{item}</option>)}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>

              {currentStatus === "terbit" && (
                <div className="relative w-full sm:w-48">
                  <select value={statusEmail} onChange={(e) => setStatusEmail(e.target.value)} className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-[#117065] px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left">
                    <option value="">Semua Status Email</option>
                    <option value="Belum Diemail">Belum Diemail</option>
                    <option value="Email Terkirim">Email Terkirim</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#117065] text-lg pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[20%]" />
              <col className="w-[22%]" />
              <col className="w-[10%]" />
              <col className="w-[15%]" />
              <col className="w-[8%]" />
              {currentStatus === "terbit" && <col className="w-[10%]" />}
              <col className="w-[10%]" />
            </colgroup>
            <thead className="bg-[#F7F7F7] text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 text-center">No</th>
                <th className="px-4 py-4 text-left">List Batch</th>
                <th className="px-4 py-4 text-center">Fakultas</th>
                <th className="px-4 py-4 text-center">Tahun Lulus</th>
                <th className="px-4 py-4 text-center">Periode</th>
                <th className="px-4 py-4 text-center">Total</th>
                
                {currentStatus === "terbit" && (
                  <th className="px-4 py-4 text-center">Status Email</th>
                )}
                
                <th className="px-4 py-4 text-center">Detail</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, i) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + i + 1;
                  return (
                    <tr key={item.id || i} className="h-[70px] border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-4 text-center align-middle">{actualIndex}</td>
                      <td className="px-4 py-4 font-bold text-gray-900 align-middle">{item.batch}</td>
                      <td className="py-4 px-4 text-center font-medium align-middle">{item.fakultas}</td>
                      <td className="px-4 py-4 text-center font-semibold align-middle">{item.tahun}</td>
                      <td className="px-4 py-4 text-center font-semibold align-middle">{item.periode}</td>
                      <td className="px-4 py-4 text-center font-semibold align-middle">{item.total}</td>
                      
                      {currentStatus === "terbit" && (
                        <td className="px-4 py-4 text-center align-middle">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                            item.status_email === "Email Terkirim"
                              ? "bg-green-100 text-green-700" 
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            {item.status_email}
                          </span>
                        </td>
                      )}

                      <td className="px-4 py-3 text-center align-middle">
                        <button type="button" onClick={() => handleDetailBatch(item)} className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-100 transition" title="Lihat detail batch">
                          <div className="w-3 h-3 border-t-2 border-b-2 border-gray-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={currentStatus === "terbit" ? "8" : "7"} className="px-4 py-8 text-center text-gray-400">
                    Data {displayLabel} tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {paginatedData.length} dari {filtered.length} Data
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50">{"<"}</button>
                {renderPaginationButtons()}
                <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50">{">"}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StatusIjazah;