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
  getLatestValidations,
  getStatistics,
} from "../../services/dashboard.api";

const normalizeStatus = (status) => {
  const value = status?.toString().toLowerCase();
  if (value === "terbit" || value === "approved" || value === "valid")
    return "terbit";
  if (value === "proses" || value === "pending") return "proses";
  if (value === "reject" || value === "rejected" || value === "ditolak")
    return "reject";
  if (value === "revoke" || value === "revoked" || value === "dicabut")
    return "revoke";
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

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? 0 : numberValue;
};

const mapSummaryStats = (summary) => {
  const data =
    summary?.data && typeof summary.data === "object"
      ? summary.data
      : summary || {};

  const raw = data.raw || {};

  return {
    totalIjazahTerbit: toNumber(
      data.totalIjazahTerbit ??
        data.terbit ??
        data.total_terbit ??
        raw.totalIjazahTerbit ??
        raw.terbit ??
        raw.total_terbit ??
        0
    ),

    permintaanVerifikasi: toNumber(
      data.permintaanVerifikasi ??
        data.proses ??
        data.total_proses ??
        raw.permintaanVerifikasi ??
        raw.proses ??
        raw.total_proses ??
        0
    ),

    dataReject: toNumber(
      data.dataReject ??
        data.rejected ??
        data.reject ??
        data.total_rejected ??
        raw.dataReject ??
        raw.rejected ??
        raw.reject ??
        raw.total_rejected ??
        0
    ),

    dataRevoke: toNumber(
      data.dataRevoke ??
        data.revoked ??
        data.revoke ??
        data.total_revoked ??
        raw.dataRevoke ??
        raw.revoked ??
        raw.revoke ??
        raw.total_revoked ??
        0
    ),

    terbitMingguIni: toNumber(
      data.terbitMingguIni ??
        data.terbit_minggu_ini ??
        raw.terbitMingguIni ??
        raw.terbit_minggu_ini ??
        0
    ),

    prosesMingguIni: toNumber(
      data.prosesMingguIni ??
        data.proses_minggu_ini ??
        raw.prosesMingguIni ??
        raw.proses_minggu_ini ??
        0
    ),

    rejectMingguIni: toNumber(
      data.rejectMingguIni ??
        data.reject_minggu_ini ??
        raw.rejectMingguIni ??
        raw.reject_minggu_ini ??
        0
    ),

    revokeMingguIni: toNumber(
      data.revokeMingguIni ??
        data.revoke_minggu_ini ??
        raw.revokeMingguIni ??
        raw.revoke_minggu_ini ??
        0
    ),
  };
};


const Dashboard = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // ==================== STATE UTAMA ====================
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

const [summaryStats, setSummaryStats] = useState({
  totalIjazahTerbit: 0,
  permintaanVerifikasi: 0,
  dataReject: 0,
  dataRevoke: 0,

  terbitMingguIni: 0,
  prosesMingguIni: 0,
  rejectMingguIni: 0,
  revokeMingguIni: 0,
});

  // ==================== STATE FILTER DINAMIS ====================
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("Semua Fakultas");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [selectedTahun, setSelectedTahun] = useState("Semua Tahun");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State untuk Dropdown (Options)
  const [fakultasOptions, setFakultasOptions] = useState(["Semua Fakultas"]);
  const [tahunOptions, setTahunOptions] = useState(["Semua Tahun"]);
  const statusOptions = [
    "Semua Status",
    "Proses",
    "Terbit",
    "Reject",
    "Revoke",
  ];

  // ==================== FETCH DATA TABEL & BUILD OPTIONS ====================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setApiError("");

        const [latestValidations, summary] = await Promise.all([
          getLatestValidations({
            page: 1,
            limit: 10000,
            search: "",
          }).catch(() => ({ data: [] })),

          getStatistics().catch(() => ({
  totalIjazahTerbit: 0,
  permintaanVerifikasi: 0,
  dataReject: 0,
  dataRevoke: 0,

  terbitMingguIni: 0,
  prosesMingguIni: 0,
  rejectMingguIni: 0,
  revokeMingguIni: 0,
})),
        ]);

        const rows = Array.isArray(latestValidations.data)
          ? latestValidations.data
          : [];

        setTableData(rows);
        console.log("SUMMARY RAW:", summary);
console.log("SUMMARY MAPPED:", mapSummaryStats(summary));
        setSummaryStats(mapSummaryStats(summary));
        

        // 🔥 BUILD DROPDOWN DINAMIS BERDASARKAN DATA TABEL
        // Ekstrak Fakultas Unik
        const uniqueFaculties = [
          ...new Set(
            rows.map((item) => item.fakultas).filter((f) => f && f !== "-"),
          ),
        ];
        setFakultasOptions(["Semua Fakultas", ...uniqueFaculties]);

        // Ekstrak Tahun Unik
        const uniqueYears = [
          ...new Set(
            rows
              .map((item) => item.tahun_lulus?.toString())
              .filter((t) => t && t !== "-"),
          ),
        ].sort((a, b) => Number(b) - Number(a));
        setTahunOptions(["Semua Tahun", ...uniqueYears]);
      } catch (err) {
        if (err.status === 401 || err.status === 403) return logout();
        setApiError("Gagal terhubung ke server backend.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchDashboardData();
    else setIsLoading(false);
  }, [token, logout]);

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

      // Syarat Filter
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

  // ==================== 🔥 SINKRONISASI STATISTIK (DARI TABEL) 🔥 ====================
  // Kita pakai filteredData supaya kalau dropdown diganti, angkanya juga ikut ganti!
  const dynamicStats = {
    terbit: filteredData.filter((d) => normalizeStatus(d.status) === "terbit")
      .length,
    proses: filteredData.filter((d) => normalizeStatus(d.status) === "proses")
      .length,
    rejected: filteredData.filter((d) => normalizeStatus(d.status) === "reject")
      .length,
    revoked: filteredData.filter((d) => normalizeStatus(d.status) === "revoke")
      .length,
  };

  const verificationChartData = {
    labels: ["Terbit", "Proses", "Reject", "Revoke"],
    data: [
      dynamicStats.terbit,
      dynamicStats.proses,
      dynamicStats.rejected,
      dynamicStats.revoked,
    ],
    colors: ["#27AE60", "#16719E", "#DC2626", "#F59E0B"],
    chartData: [
      { name: "Terbit", value: dynamicStats.terbit, color: "#27AE60" },
      { name: "Proses", value: dynamicStats.proses, color: "#16719E" },
      { name: "Reject", value: dynamicStats.rejected, color: "#DC2626" },
      { name: "Revoke", value: dynamicStats.revoked, color: "#F59E0B" },
    ],
  };

  // ==================== PAGINATION ====================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const renderPaginationButtons = () => {
    const pages = [];
    if (totalPages <= 0) return pages;
    pages.push(1);
    if (currentPage > 2 && totalPages > 3) pages.push("...");
    if (currentPage === 1 && totalPages > 1) pages.push(2);
    else if (currentPage === totalPages && totalPages > 2)
      pages.push(totalPages - 1);
    else if (currentPage > 1 && currentPage < totalPages)
      pages.push(currentPage);
    if (currentPage < totalPages - 1 && totalPages > 3) pages.push("...");
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    return pages.map((page, index) => (
      <button
        key={index}
        type="button"
        onClick={() => typeof page === "number" && setCurrentPage(page)}
        disabled={page === "..."}
        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold shadow-sm transition-colors ${
          page === currentPage
            ? "bg-[#117065] text-white"
            : page === "..."
              ? "bg-transparent text-gray-400 cursor-default shadow-none"
              : "bg-[#E5E7EB] text-gray-500 hover:bg-gray-300"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27AE60]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Ringkasan Statistik
        </h1>
        {apiError && (
          <p className="text-sm text-red-500 mt-1 font-bold">{apiError}</p>
        )}
      </div>

      {/* 🔥 STAT CARD DINAMIS MENGIKUTI TABEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
       <StatCard
         title="Jumlah Ijazah Terbit"
         value={summaryStats.totalIjazahTerbit}
         sub={`${summaryStats.terbitMingguIni} Terbit Minggu ini`}
         subColor="text-[#27AE60]"
        icon={Icons.Badge}
       onClick={() => navigate("/ijazah/terbit")}
       />

        <StatCard
          title="Jumlah Ijazah di Proses"
          value={summaryStats.permintaanVerifikasi}
          sub={`${summaryStats.prosesMingguIni} di Proses Minggu ini`}
          subColor="text-[#3B82F6]"
          icon={Icons.Check}
          onClick={() => navigate("/ijazah/proses")}
        />

        <StatCard
          title="Jumlah Ijazah di Reject"
          value={summaryStats.dataReject}
         sub={`${summaryStats.rejectMingguIni} di Reject Minggu ini`}
          subColor="text-[#F97316]"
          icon={Icons.Close}
          onClick={() => navigate("/ijazah/reject")}
        />

        <StatCard
          title="Jumlah Ijazah di Revoke"
          value={summaryStats.dataRevoke}
          sub={
          summaryStats.revokeMingguIni > 0 ? `${summaryStats.revokeMingguIni} di Revoke Minggu ini`  : "di Revoke Minggu ini" }
          subColor="text-[#F59E0B]"
          icon={Icons.List}
          onClick={() => navigate("/ijazah/revoke")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-6 text-lg">
            Statistik Penerbitan Ijazah Tahunan
          </h2>
          <IssuanceChart />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 text-lg">
            Status Data Ijazah Tahun{" "}
            {selectedTahun === "Semua Tahun"
              ? new Date().getFullYear()
              : selectedTahun}
          </h2>
          {/* 🔥 DONUT CHART DINAMIS MENGIKUTI TABEL */}
          <VerificationStatusChart chartData={verificationChartData} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              Aktivitas Verifikasi
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto xl:justify-end">
              <div className="relative w-full sm:w-80">
                <FiSearch
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Cari: Nama, NIM, Prodi..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-white text-sm outline-none border border-gray-300 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] transition-colors shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:ml-auto">
                {/* 🔥 DROPDOWN FAKULTAS DIKEMBALIKAN */}
                <div className="relative w-full sm:w-75">
                  <select
                    className="w-full appearance-none bg-white text-gray-800 text-sm py-2 pl-4 pr-10 rounded-lg outline-none border border-gray-300 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] cursor-pointer transition-colors shadow-sm"
                    value={selectedFakultas}
                    onChange={(e) => setSelectedFakultas(e.target.value)}
                  >
                    {fakultasOptions.map((fakultas, index) => (
                      <option key={index} value={fakultas}>
                        {fakultas}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                    {Icons.DropdownArrow}
                  </div>
                </div>

                <div className="relative w-full sm:w-44">
                  <select
                    className="w-full appearance-none bg-white text-gray-800 text-sm py-2 pl-4 pr-10 rounded-md outline-none border border-gray-300 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] cursor-pointer transition-colors shadow-sm"
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

                <div className="relative w-full sm:w-40">
                  <select
                    className="w-full appearance-none bg-white text-gray-800 text-sm py-2 pl-4 pr-10 rounded-md outline-none border border-gray-300 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] cursor-pointer transition-colors shadow-sm"
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
                        className={`inline-block min-w-[86px] px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(row.status)}`}
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
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
