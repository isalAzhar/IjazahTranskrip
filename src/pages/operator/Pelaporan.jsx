// src/pages/operator/Pelaporan.jsx
import React, { useState, useEffect } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Gunakan @ untuk langsung menunjuk ke folder src
import DashboardLayout from "@/components/ui/DashboardLayout";
import { getApprovalLaporan } from "@/services/api";

const ITEMS_PER_PAGE = 10;

const badgeClass = (status) => {
  const map = {
    Proses: "bg-[#3B82F6] text-white",
    Terbit: "bg-[#16A36B] text-white",  
    Revoke: "bg-[#F59E0B] text-white",
    Reject: "bg-[#EF4444] text-white",
  };

  return map[status] || "bg-gray-400 text-white";
};

const formatTanggal = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatWaktu = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return `${date
    .getHours()
    .toString()
    .padStart(2, "0")}.${date
    .getMinutes()
    .toString()
    .padStart(2, "0")} WIB`;
};

const Pelaporan = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [laporanList, setLaporanList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total_data: 0,
    total_page: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statusOptions = ["Semua Status", "Proses", "Terbit", "Revoke", "Reject"];

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getApprovalLaporan({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search,
        status: statusFilter,
      });

      setLaporanList(result.data || []);
      setPagination(
        result.pagination || {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          total_data: 0,
          total_page: 1,
        }
      );
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Gagal mengambil data laporan approval."
      );

      setLaporanList([]);
      setPagination({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        total_data: 0,
        total_page: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = pagination.total_page || 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const pages = [];

    pages.push(1);

    if (currentPage > 2 && totalPages > 3) {
      pages.push("...");
    }

    if (currentPage === 1 && totalPages > 1) {
      pages.push(2);
    } else if (currentPage === totalPages && totalPages > 2) {
      pages.push(totalPages - 1);
    } else if (currentPage > 1 && currentPage < totalPages) {
      pages.push(currentPage);
    }

    if (currentPage < totalPages - 1 && totalPages > 3) {
      pages.push("...");
    }

    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

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
            : "bg-white border border-gray-300 text-gray-500 hover:bg-gray-100"
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
          <h1 className="text-[26px] font-bold text-gray-900">
            Manajemen Pelaporan
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Kelola dan pantau seluruh pelaporan validasi ijazah mahasiswa.
          </p>
        </div>

        {/* FILTER BOX - DIUBAH JADI PUTIH */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="w-full lg:max-w-md">
              <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
                <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cari: Nama, NIM"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="relative w-full lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm"
              >
                {statusOptions.map((item) => (
                  <option key={item} value={item === "Semua Status" ? "" : item}>
                    {item}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <div className="min-w-[1000px]">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-[#F3F4F6] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 w-[200px]">Nama</th>
                  <th className="py-4 px-6 text-center w-[160px]">NIM</th>
                  <th className="py-4 px-6 text-center w-[120px]">Tanggal</th>
                  <th className="py-4 px-6 text-center w-[120px]">Waktu</th>
                  <th className="py-4 px-6 text-center w-[100px]">Status</th>
                  <th className="py-4 px-6 w-[280px]">Keterangan</th>
                  <th className="py-4 px-6 text-center w-24">Detail</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  laporanList.map((item, idx) => {
                    const no = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                    const tanggalValue = item.tanggal || item.waktu;

                    return (
                      <tr
                        key={item.id_mahasiswa || item.nim}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-center font-medium text-gray-800 truncate">
                          {no}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900 truncate">
                            {item.nama || "-"}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                            {item.program_studi || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">
                          {item.nim || "-"}
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600 truncate">
                          {formatTanggal(tanggalValue)}
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600 truncate">
                          {formatWaktu(tanggalValue)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${badgeClass(
                              item.status
                            )}`}
                          >
                            {item.status || "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm truncate">
                          {item.keterangan || "-"}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() =>
                              navigate(`/operator/detail-pelaporan/${item.nim}`, {
                                state: item,
                              })
                            }
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

          {loading && (
            <div className="py-8 text-center text-gray-500 font-medium">
              Memuat data laporan...
            </div>
          )}

          {!loading && laporanList.length === 0 && (
            <div className="py-8 text-center text-gray-500 font-medium">
              Data tidak ditemukan.
            </div>
          )}

          {/* PAGINATION - DIUBAH JADI PUTIH */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {laporanList.length} dari{" "}
              {pagination.total_data || 0} Data
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