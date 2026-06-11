// src/pages/operator/Pelaporan.jsx
import React, { useState, useEffect } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Gunakan @ untuk langsung menunjuk ke folder src
import DashboardLayout from "@/components/ui/DashboardLayout";
import { getApprovalLaporan } from "@/services/api";

const ITEMS_PER_PAGE = 10;

// 🔥 Logika warna badge dari referensi (Kebal salah ketik)
const badgeClass = (status) => {
  const normalizedStatus = status?.toLowerCase().trim() || "";

  if (normalizedStatus === "proses" || normalizedStatus === "pending")
    return "bg-[#3B82F6] text-white";
  if (normalizedStatus === "terbit" || normalizedStatus === "approved")
    return "bg-[#16A36B] text-white";
  if (normalizedStatus === "revoke" || normalizedStatus === "revoked")
    return "bg-[#F59E0B] text-white";
  if (normalizedStatus === "reject" || normalizedStatus === "rejected")
    return "bg-[#EF4444] text-white";

  return "bg-gray-400 text-white";
};
const formatStatusLabel = (status) => {
  const normalizedStatus = status?.toLowerCase().trim() || "";

  if (normalizedStatus === "rejected") return "Reject";
  if (normalizedStatus === "reject") return "Reject";

  if (normalizedStatus === "revoked") return "Revoke";
  if (normalizedStatus === "revoke") return "Revoke";

  if (normalizedStatus === "approved") return "Terbit";
  if (normalizedStatus === "terbit") return "Terbit";

  if (normalizedStatus === "pending") return "Proses";
  if (normalizedStatus === "proses") return "Proses";

  return status || "-";
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
  return `${date.getHours().toString().padStart(2, "0")}.${date.getMinutes().toString().padStart(2, "0")} WIB`;
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

  // 🔥 Menyesuaikan dengan data persis dari backend (Revoked & Rejected)
  const statusOptions = [
    "Semua Status",
    "Proses",
    "Terbit",
    "Revoke",
    "Reject",
  ];
  const getStatusFilterValue = (value) => {
    if (value === "Semua Status") return "";
    if (value === "Reject") return "rejected";
    if (value === "Revoke") return "revoked";
    if (value === "Terbit") return "terbit";
    if (value === "Proses") return "proses";

    return value;
  };
  const fetchLaporan = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getApprovalLaporan({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search,
        // 🔥 Kirim string kosong jika "Semua Status"
        status: getStatusFilterValue(statusFilter),
      });

      setLaporanList(result.data || []);
      setPagination(
        result.pagination || {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          total_data: 0,
          total_page: 1,
        },
      );
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Gagal mengambil data laporan approval.",
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
    let pages = [];

    if (totalPages <= 4) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (currentPage === 1) pages = [1, 2, "...", totalPages];
      else if (currentPage === 2) pages = [1, 2, 3, "...", totalPages];
      else if (currentPage === totalPages)
        pages = [1, "...", totalPages - 1, totalPages];
      else if (currentPage === totalPages - 1)
        pages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
      else pages = [1, "...", currentPage, "...", totalPages];
    }

    return pages.map((page, index) => {
      const isActive = page === currentPage;
      const isEllipsis = page === "...";

      return (
        <button
          key={index}
          onClick={() => !isEllipsis && handlePageChange(page)}
          disabled={isEllipsis}
          className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-bold transition-all ${
            isActive
              ? "bg-[#117065] text-white shadow-md"
              : "bg-[#C4C4C4] text-white hover:bg-gray-400"
          } ${isEllipsis ? "cursor-default" : "cursor-pointer"}`}
        >
          {page}
        </button>
      );
    });
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

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col lg:flex-row items-center justify-between gap-4 border border-gray-100">
          <div className="w-full lg:max-w-md">
            <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
              <FiSearch className="text-gray-400 text-lg mr-3" />
              <input
                type="text"
                placeholder="Cari: Nama, NIM"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-5 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left"
              >
                {statusOptions.map((item) => (
                  <option
                    key={item}
                    value={item === "Semua Status" ? "" : item}
                  >
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
                        key={
                          item.mahasiswa_code ||
                          item.mahasiswaCode ||
                          item.nim ||
                          idx
                        }
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
                              item.status,
                            )}`}
                          >
                            {formatStatusLabel(item.status)}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-gray-600 text-sm truncate">
                          {item.keterangan || "-"}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => {
                              const mahasiswaCode =
                                item.mahasiswa_code ||
                                item.mahasiswaCode ||
                                item.uuid ||
                                item.mahasiswa_uuid ||
                                item.raw?.mahasiswa_code ||
                                item.raw?.uuid;

                              if (!mahasiswaCode) {
                                console.error(
                                  "Mahasiswa code tidak ditemukan:",
                                  item,
                                );
                                alert("Kode mahasiswa tidak ditemukan.");
                                return;
                              }

                              navigate(
                                `/operator/detail-pelaporan/${encodeURIComponent(mahasiswaCode)}`,
                                {
                                  state: {
                                    mahasiswa: item,
                                  },
                                },
                              );
                            }}
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
              <FiSearch className="mx-auto text-4xl mb-3 text-gray-300" />
              <p>Data tidak ditemukan.</p>
            </div>
          )}

          <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center">
            <p className="text-sm text-gray-500 font-medium">
              Menampilkan {laporanList.length} dari {pagination.total_data || 0}{" "}
              Data
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-[#C4C4C4] hover:text-gray-600 disabled:opacity-30 text-xl font-bold px-2 transition-colors cursor-pointer"
              >
                {"<"}
              </button>

              <div className="flex items-center gap-2">
                {renderPaginationButtons()}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="text-[#117065] hover:text-teal-900 disabled:opacity-30 text-xl font-bold px-2 transition-colors cursor-pointer"
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Pelaporan;
