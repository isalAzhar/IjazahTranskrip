import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

import DashboardLayout from "../../components/ui/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import IssuanceChart from "../../components/ui/IssuanceChart";
import VerificationStatusChart from "../../components/ui/VerificationStatusChart";

import { Icons } from "../../components/icon/DashboardIcons";
import { useAuth } from "../context/AuthContext";

import {
  getDashboardSummary,
  getLatestValidations,
  getStatistikTahunan,
  getStatistikValidasi,
} from "../../services/dashboard.api";

const normalizeStatus = (status) => {
  const value = status?.toString().toLowerCase();

  if (value === "terbit" || value === "approved" || value === "valid") {
    return "terbit";
  }

  if (value === "proses" || value === "pending") {
    return "proses";
  }

  if (value === "reject" || value === "rejected" || value === "ditolak") {
    return "reject";
  }

  if (value === "revoke" || value === "revoked" || value === "dicabut") {
    return "revoke";
  }

  return value || "";
};

const getBadgeLabel = (status) => {
  const value = normalizeStatus(status);

  switch (value) {
    case "terbit":
      return "Terbit";
    case "proses":
      return "Proses";
    case "reject":
      return "Reject";
    case "revoke":
      return "Revoke";
    default:
      return status || "-";
  }
};

const getBadgeColor = (status) => {
  const value = normalizeStatus(status);

  switch (value) {
    case "terbit":
      return "bg-[#27AE60] text-white";
    case "proses":
      return "bg-[#3B82F6] text-white";
    case "reject":
      return "bg-[#EF4444] text-white";
    case "revoke":
      return "bg-[#F59E0B] text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

const buildFacultyOptions = (rows = []) => {
  const uniqueFaculties = [
    ...new Set(
      rows
        .map((item) => item.fakultas)
        .filter((fakultas) => fakultas && fakultas !== "-"),
    ),
  ];

  return ["Semua Fakultas", ...uniqueFaculties];
};

const buildYearOptions = (rows = []) => {
  const uniqueYears = [
    ...new Set(
      rows
        .map((item) => item.tahun_lulus?.toString())
        .filter((tahun) => tahun && tahun !== "-"),
    ),
  ].sort((a, b) => Number(b) - Number(a));

  return ["Semua Tahun", ...uniqueYears];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // ==================== STATE DATA BACKEND ====================

  const [statsData, setStatsData] = useState({
    terbit: 0,
    proses: 0,
    rejected: 0,
    revoked: 0,
  });

  const [tableData, setTableData] = useState([]);
  const [issuanceChartData, setIssuanceChartData] = useState(null);
  const [verificationChartData, setVerificationChartData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // ==================== STATE FILTER & PAGINATION ====================

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("Semua Fakultas");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [selectedTahun, setSelectedTahun] = useState("Semua Tahun");

  const [faculties, setFaculties] = useState(["Semua Fakultas"]);
  const [tahunOptions, setTahunOptions] = useState(["Semua Tahun"]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusOptions = [
    "Semua Status",
    "Proses",
    "Terbit",
    "Reject",
    "Revoke",
  ];

  // ==================== FETCH DATA DASHBOARD ====================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setApiError("");

        const [
          summary,
          latestValidations,
          statistikTahunan,
          statistikValidasi,
        ] = await Promise.all([
          getDashboardSummary(),
          getLatestValidations({
            page: 1,
            limit: 100,
            search: "",
          }),
          getStatistikTahunan(),
          getStatistikValidasi(new Date().getFullYear()),
        ]);

        const rows = Array.isArray(latestValidations.data)
          ? latestValidations.data
          : [];

        setStatsData({
          terbit: summary.totalIjazahTerbit || 0,
          proses: summary.permintaanVerifikasi || 0,
          rejected: summary.dataReject || 0,
          revoked: summary.dataRevoke || 0,
        });

        setTableData(rows);

        setIssuanceChartData(statistikTahunan);
        setVerificationChartData(statistikValidasi);

        // Ini tetap binding, karena datanya dari backend validations/latest
        setFaculties(buildFacultyOptions(rows));
        setTahunOptions(buildYearOptions(rows));
      } catch (err) {
        console.error("Gagal mengambil data dashboard rektor:", err);

        if (err.status === 401 || err.status === 403) {
          logout();
          return;
        }

        setApiError(err.message || "Gagal terhubung ke server backend.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [token, logout]);

  // ==================== FETCH CHART STATUS SAAT TAHUN DIGANTI ====================

  useEffect(() => {
    const fetchChartByYear = async () => {
      try {
        if (!token) return;

        const year =
          selectedTahun === "Semua Tahun"
            ? new Date().getFullYear()
            : selectedTahun;

        const statistikValidasi = await getStatistikValidasi(year);

        setVerificationChartData(statistikValidasi);
      } catch (err) {
        console.error("Gagal mengambil chart status berdasarkan tahun:", err);

        if (err.status === 401 || err.status === 403) {
          logout();
        }
      }
    };

    fetchChartByYear();
  }, [selectedTahun, token, logout]);

  // ==================== FILTERING DATA LOKAL ====================

  const filteredData = tableData
    .filter((item) => {
      const searchLower = searchQuery.toLowerCase();

      const searchableText = [
        item.nama,
        item.nim,
        item.prodi,
        item.fakultas,
        item.tahun_lulus,
        item.status,
        item.batch,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(searchLower);

      const matchesFakultas =
        selectedFakultas === "Semua Fakultas" ||
        item.fakultas === selectedFakultas;

      const matchesStatus =
        selectedStatus === "Semua Status" ||
        normalizeStatus(item.status) === normalizeStatus(selectedStatus);

      const matchesTahun =
        selectedTahun === "Semua Tahun" ||
        item.tahun_lulus?.toString() === selectedTahun;

      return matchesSearch && matchesFakultas && matchesStatus && matchesTahun;
    })
    .sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFakultas, selectedStatus, selectedTahun]);

  // ==================== PAGINATION ====================

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const renderPaginationButtons = () => {
    const pages = [];

    if (totalPages <= 0) return pages;

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
        type="button"
        onClick={() => typeof page === "number" && setCurrentPage(page)}
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

  // ==================== LOADING ====================

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27AE60]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Ringkasan Statistik
        </h1>

        {apiError && (
          <p className="text-sm text-red-500 mt-1 font-bold">{apiError}</p>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() =>
            navigate("/ijazah/terbit", {
              state: { status: "terbit" },
            })
          }
          className="cursor-pointer"
        >
          <StatCard
            title="Jumlah Ijazah Terbit"
            value={statsData.terbit.toLocaleString("id-ID")}
            sub="Statistik Terkini"
            subColor="text-[#27AE60]"
            icon={Icons.Badge}
          />
        </div>

        <div
          onClick={() =>
            navigate("/ijazah/proses", {
              state: { status: "proses" },
            })
          }
          className="cursor-pointer"
        >
          <StatCard
            title="Jumlah Ijazah di Proses"
            value={statsData.proses.toLocaleString("id-ID")}
            sub="Statistik Terkini"
            subColor="text-[#3B82F6]"
            icon={Icons.Check}
          />
        </div>

        <div
          onClick={() =>
            navigate("/ijazah/reject", {
              state: { status: "reject" },
            })
          }
          className="cursor-pointer"
        >
          <StatCard
            title="Jumlah Ijazah di Reject"
            value={statsData.rejected.toLocaleString("id-ID")}
            sub="Statistik Terkini"
            subColor="text-[#F97316]"
            icon={Icons.Close}
          />
        </div>

        <div
          onClick={() =>
            navigate("/ijazah/revoke", {
              state: { status: "revoke" },
            })
          }
          className="cursor-pointer"
        >
          <StatCard
            title="Jumlah Ijazah di Revoke"
            value={statsData.revoked.toLocaleString("id-ID")}
            sub="Statistik Terkini"
            subColor="text-[#F59E0B]"
            icon={Icons.List}
          />
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-6 text-lg">
            Statistik Penerbitan Ijazah Tahunan
          </h2>

          <IssuanceChart chartData={issuanceChartData} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 text-lg">
            Status Data Ijazah Tahun{" "}
            {selectedTahun === "Semua Tahun"
              ? new Date().getFullYear()
              : selectedTahun}
          </h2>

          <VerificationStatusChart chartData={verificationChartData} />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              Aktivitas Verifikasi Terbaru
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto xl:justify-end">
              {/* SEARCH */}
              <div className="relative w-full sm:w-72">
                <FiSearch
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={16}
                />

                <input
                  type="text"
                  placeholder="Cari: Nama, NIM, Prodi"
                  className="w-full pl-9 pr-4 py-2 rounded-md bg-[#f3f4f6] text-sm outline-none border border-transparent focus:border-teal-500 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* FILTERS */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:ml-auto">
                {/* FILTER FAKULTAS */}
                <div className="relative w-full sm:w-64">
                  <select
                    className="w-full appearance-none bg-[#f3f4f6] text-gray-800 text-sm py-2 pl-4 pr-10 rounded-md outline-none border border-transparent focus:border-teal-500 cursor-pointer transition-colors"
                    value={selectedFakultas}
                    onChange={(e) => setSelectedFakultas(e.target.value)}
                  >
                    {faculties.map((fakultas, index) => (
                      <option key={index} value={fakultas}>
                        {fakultas}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                    {Icons.DropdownArrow}
                  </div>
                </div>

                {/* FILTER STATUS */}
                <div className="relative w-full sm:w-44">
                  <select
                    className="w-full appearance-none bg-[#f3f4f6] text-gray-800 text-sm py-2 pl-4 pr-10 rounded-md outline-none border border-transparent focus:border-teal-500 cursor-pointer transition-colors"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {statusOptions.map((status, index) => (
                      <option key={index} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                    {Icons.DropdownArrow}
                  </div>
                </div>

                {/* FILTER TAHUN */}
                <div className="relative w-full sm:w-40">
                  <select
                    className="w-full appearance-none bg-[#f3f4f6] text-gray-800 text-sm py-2 pl-4 pr-10 rounded-md outline-none border border-transparent focus:border-teal-500 cursor-pointer transition-colors"
                    value={selectedTahun}
                    onChange={(e) => setSelectedTahun(e.target.value)}
                  >
                    {tahunOptions.map((tahun, index) => (
                      <option key={index} value={tahun}>
                        {tahun}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                    {Icons.DropdownArrow}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto min-h-[700px]">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[20%]" />
              <col className="w-[15%]" />
              <col className="w-[22%]" />
              <col className="w-[17%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>

            <thead className="bg-[#f3f4f6] text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 text-center">No.</th>
                <th className="px-4 py-4 text-left">Nama</th>
                <th className="px-4 py-4 text-center">NIM</th>
                <th className="px-4 py-4 text-center">Fakultas</th>
                <th className="px-4 py-4 text-center">Program Studi</th>
                <th className="px-4 py-4 text-center">Tahun Lulus</th>
                <th className="px-4 py-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {currentData.length > 0 ? (
                currentData.map((row, i) => (
                  <tr
                    key={row.id || row.id_mahasiswa || i}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 text-center font-semibold">
                      {indexOfFirstItem + i + 1}.
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-800 truncate">
                        {row.nama || "-"}
                      </div>

                      <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {row.batch || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center font-semibold text-gray-700 truncate">
                      {row.nim || "-"}
                    </td>

                    <td className="px-4 py-4 text-center text-gray-600 font-semibold whitespace-nowrap truncate">
                      {row.fakultas || "-"}
                    </td>

                    <td className="px-4 py-4 text-center text-gray-600 font-semibold truncate">
                      {row.prodi || "-"}
                    </td>

                    <td className="px-4 py-4 text-center font-semibold text-gray-700">
                      {row.tahun_lulus || "-"}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block min-w-[86px] px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(
                          row.status,
                        )}`}
                      >
                        {getBadgeLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Data tidak ditemukan atau belum ada data di server.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Menampilkan {currentData.length} dari {filteredData.length} Data
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50"
              >
                {"<"}
              </button>

              {renderPaginationButtons()}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50"
              >
                {">"}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
