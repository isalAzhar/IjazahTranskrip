import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import IssuanceChart from "../../components/ui/IssuanceChart";
import VerificationStatusChart from "../../components/ui/VerificationStatusChart";
import { Icons } from "../../components/icon/DashboardIcons";
import { useAuth } from "../context/AuthContext";
import { getDashboardSummary, getLatestValidations } from "@/services/dashboard.api";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // 1. AMBIL TOKEN & LOGOUT DARI AUTH CONTEXT
  const { token, logout } = useAuth();

  // 2. STATE UNTUK DATA BACKEND
  const [statsData, setStatsData] = useState({
    terbit: 0,
    proses: 0,
    reject: 0,
    revoke: 0
  });
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // 3. STATE UNTUK FILTER & PAGINATION
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("Semua Fakultas");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [selectedTahun, setSelectedTahun] = useState("Semua Tahun");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

// 🔥 GENERATOR DROPDOWN DINAMIS (Berdasarkan data Backend)
  const dynamicFakultas = useMemo(() => {
    // Ambil semua fakultas dari API, buang yang kosong, hilangkan duplikat, lalu urutkan abjad
    const list = [...new Set(tableData.map(item => item.fakultas).filter(Boolean))];
    return ["Semua Fakultas", ...list.sort()];
  }, [tableData]);

  const dynamicStatus = useMemo(() => {
    // Ambil semua status asli dari API (Terbit, Revoke, dll)
    const list = [...new Set(tableData.map(item => item.status).filter(Boolean))];
    return ["Semua Status", ...list.sort()];
  }, [tableData]);

  const dynamicTahun = useMemo(() => {
    // Ambil semua tahun dari API
    const list = [...new Set(tableData.map(item => (item.tahun_lulus || item.tahun)?.toString()).filter(Boolean))];
    return ["Semua Tahun", ...list.sort((a, b) => b - a)]; // Urutkan tahun terbaru di atas
  }, [tableData]);

  // 🔥 4. OPERASI PENYEDOTAN DATA DARI API EXTERNAL (CLEAN CODE)
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setApiError("");

        // Panggil kedua API secara bersamaan menggunakan file services
        const [dataSummary, dataTable] = await Promise.all([
          getDashboardSummary(token),
          getLatestValidations(token)
        ]);

        // Set data statistik
        if (dataSummary?.data) {
          setStatsData({
            terbit: dataSummary.data.terbit || dataSummary.data.total_terbit || 0,
            proses: dataSummary.data.proses || dataSummary.data.total_proses || 0,
            reject: dataSummary.data.reject || dataSummary.data.total_reject || 0,
            revoke: dataSummary.data.revoke || dataSummary.data.total_revoke || 0
          });
        }

        // Set data tabel
        if (dataTable?.data) {
          setTableData(Array.isArray(dataTable.data) ? dataTable.data : []);
        }

      } catch (err) {
        // Tangkap lemparan error dari dashboard.api.js
        if (err.message === "Unauthorized") {
          console.error("Token kedaluwarsa! Menendang keluar...");
          logout();
        } else {  
          console.error("Gagal menembak API Dashboard:", err);
          setApiError("Gagal terhubung ke server backend.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, logout]);

  // 5. FILTERING DATA SECARA LOKAL
  const filteredData = tableData
    .filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch =
        (item.nama?.toLowerCase().includes(searchLower) || false) ||
        (item.nim?.toLowerCase().includes(searchLower) || false) ||
        (item.prodi?.toLowerCase().includes(searchLower) || false) ||
        (item.fakultas?.toLowerCase().includes(searchLower) || false) ||
        (item.status?.toLowerCase().includes(searchLower) || false);

      // Logika filter sekarang sangat akurat karena bersumber dari data yang sama
      const matchesFakultas = selectedFakultas === "Semua Fakultas" || item.fakultas === selectedFakultas;
      const matchesStatus = selectedStatus === "Semua Status" || item.status === selectedStatus;
      
      const itemTahun = (item.tahun_lulus || item.tahun)?.toString();
      const matchesTahun = selectedTahun === "Semua Tahun" || itemTahun === selectedTahun;

      return matchesSearch && matchesFakultas && matchesStatus && matchesTahun;
    })
    .sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFakultas, selectedStatus, selectedTahun]);
  
  const totalItems = filteredData.length; 
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1; // Minimal 1 halaman
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const getBadgeColor = (status) => {
    switch (status?.toLowerCase().trim()) {
      case "terbit": 
      case "approved":
        return "bg-[#27AE60] text-white";
      case "proses": 
      case "pending":
        return "bg-[#3B82F6] text-white";
      case "reject": 
      case "rejected":
        return "bg-[#EF4444] text-white";
      case "revoke": 
      case "revoked":
        return "bg-[#F59E0B] text-white";
      default: 
        return "bg-gray-400 text-white";
    }
  };

  const renderPaginationButtons = () => {
    let pages = [];

    // Logika pembentukan array angka agar persis [1, 2, ..., 614]
    if (totalPages <= 4) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (currentPage === 1) {
        pages = [1, 2, "...", totalPages];
      } else if (currentPage === 2) {
        pages = [1, 2, 3, "...", totalPages];
      } else if (currentPage === totalPages) {
        pages = [1, "...", totalPages - 1, totalPages];
      } else if (currentPage === totalPages - 1) {
        pages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, "...", currentPage, "...", totalPages];
      }
    }

    return pages.map((page, index) => {
      const isActive = page === currentPage;
      const isEllipsis = page === "...";

      return (
        <button
          key={index}
          onClick={() => !isEllipsis && setCurrentPage(page)}
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

  // TAMPILAN LOADING JIKA SEDANG MENGAMBIL DATA
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
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ringkasan Statistik</h1>
        {apiError && <p className="text-sm text-red-500 mt-1 font-bold">{apiError}</p>}
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div onClick={() => navigate("/ijazah/terbit")} className="cursor-pointer">
          <StatCard
            title="Jumlah Ijazah Terbit"
            value={statsData.terbit.toLocaleString('id-ID')}
            sub="Statistik Terkini"
            subColor="text-[#27AE60]"
            icon={Icons.Badge}
          />
        </div>

        <div onClick={() => navigate("/ijazah/proses")} className="cursor-pointer">
          <StatCard
            title="Jumlah Ijazah di Proses"
            value={statsData.proses.toLocaleString('id-ID')}
            sub="Statistik Terkini"
            subColor="text-[#3B82F6]"
            icon={Icons.Check}
          />
        </div>

        <div onClick={() => navigate("/ijazah/reject")} className="cursor-pointer">
          <StatCard
            title="Jumlah Ijazah di Reject"
            value={statsData.reject.toLocaleString('id-ID')}
            sub="Statistik Terkini"
            subColor="text-[#F97316]"
            icon={Icons.Close}
          />
        </div>

        <div onClick={() => navigate("/ijazah/revoke")} className="cursor-pointer">
          <StatCard
            title="Jumlah Ijazah di Revoke"
            value={statsData.revoke.toLocaleString('id-ID')}
            sub="Statistik Terkini"
            subColor="text-[#F59E0B]"
            icon={Icons.List}
          />
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-6 text-lg">Statistik Penerbitan Ijazah Tahunan</h2>
          <IssuanceChart />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 text-lg">Status Data Ijazah Tahun 2026</h2>
          <VerificationStatusChart />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Aktivitas Verifikasi Terbaru</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto xl:justify-end">
              
              {/* SEARCH */}
              <div className="relative w-full sm:w-72">
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
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
                <div className="relative w-full sm:w-64">
                  <select
                    className="w-full appearance-none bg-[#f3f4f6] text-gray-800 text-sm py-2 pl-4 pr-10 rounded-md outline-none cursor-pointer"
                    value={selectedFakultas}
                    onChange={(e) => setSelectedFakultas(e.target.value)}
                  >
                    {dynamicFakultas.map((fakultas, index) => (
                      <option key={`fak-${index}`} value={fakultas}>{fakultas}</option>
                    ))} 
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                    {Icons.DropdownArrow}
                  </div>
                </div>

                <div className="relative w-full sm:w-44">
                    <select
                    className="w-full appearance-none bg-[#f3f4f6] text-gray-800 text-sm py-2 pl-4 pr-10 rounded-md outline-none cursor-pointer"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {dynamicStatus.map((status, index) => (
                      <option key={`stat-${index}`} value={status}>{status}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                    {Icons.DropdownArrow}
                  </div>
                </div>

                <div className="relative w-full sm:w-40">
                 <select
                    className="w-full appearance-none bg-[#f3f4f6] text-gray-800 text-sm py-2 pl-4 pr-10 rounded-md outline-none cursor-pointer"
                    value={selectedTahun}
                    onChange={(e) => setSelectedTahun(e.target.value)}
                  >
                    {dynamicTahun.map((tahun, index) => (
                      <option key={`thn-${index}`} value={tahun}>{tahun}</option>
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
        <div className="overflow-x-auto min-h-[500px]">
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
                  <tr key={i} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-center font-semibold">
                      {indexOfFirstItem + i + 1}.
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-800 truncate">{row.nama || "-"}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5 truncate">{row.batch || "-"}</div>
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
                      <span className={`inline-block min-w-[86px] px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(row.status)}`}>
                        {row.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FiSearch className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-lg font-bold text-gray-600">Data tidak ditemukan</p>
                      <p className="text-sm mt-1">Belum ada data verifikasi ijazah atau pencarian tidak cocok.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION SECTION - EXACT FIGMA UI */}
        <div className="p-6 bg-white flex justify-between items-center border-t border-gray-100">
          <p className="text-sm text-gray-500 font-medium">
            Menampilkan {currentData.length} dari {totalItems.toLocaleString('id-ID')} Data
          </p>
          
          <div className="flex items-center gap-2">
            {/* Panah Kiri - Abu-abu */}
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-[#C4C4C4] hover:text-gray-600 disabled:opacity-30 text-xl font-bold px-2 transition-colors cursor-pointer"
            >
              {"<"}
            </button>

            {/* Kotak Angka Halaman */}
            <div className="flex items-center gap-2">
              {renderPaginationButtons()}
            </div>

            {/* Panah Kanan - Teal Hijau Figma */}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="text-[#117065] hover:text-teal-900 disabled:opacity-30 text-xl font-bold px-2 transition-colors cursor-pointer"
            >
              {">"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;