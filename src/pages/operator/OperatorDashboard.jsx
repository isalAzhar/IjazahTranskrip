// src/pages/operator/OperatorDashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import IssuanceChart from "../../components/ui/IssuanceChart";
import VerificationStatusChart from "../../components/ui/VerificationStatusChart";
import { OperatorIcons } from "../../components/icon/OperatorIcons";

// ============================================================
// GENERATE DUMMY DATA (LENGKAP DENGAN SPECIAL DATA & REVOKE)
// ============================================================
const generateDummyData = () => {
  const data = [];

  const specialData = {
    1: {
      n: "Adi Saputra",
      b: "Batch 1 - FEB",
      npm: "231106040902",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Manajemen",
      t: "2026",
      s: "Terbit",
    },
    2: {
      n: "Rani Maharani",
      b: "Batch 1 - FEB",
      npm: "231106040903",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Akuntansi",
      t: "2026",
      s: "Terbit",
    },
    3: {
      n: "Budi Pratama",
      b: "Batch 1 - FEB",
      npm: "231106040910",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Bisnis Digital",
      t: "2026",
      s: "Terbit",
    },
    4: {
      n: "Kayla Key",
      b: "Batch 21 - FTS",
      npm: "231106040912",
      f: "Fakultas Teknik dan Sains",
      p: "Teknik Mesin",
      t: "2026",
      s: "Proses",
    },
    5: {
      n: "Rizky Gusti A",
      b: "Batch 21 - FTS",
      npm: "231106040839",
      f: "Fakultas Teknik dan Sains",
      p: "Teknik Informatika",
      t: "2026",
      s: "Proses",
    },
    6: {
      n: "Risma Puspita",
      b: "Batch 21 - FTS",
      npm: "231106040290",
      f: "Fakultas Teknik dan Sains",
      p: "Teknik Informatika",
      t: "2026",
      s: "Proses",
    },
    7: {
      n: "Budi Doremi",
      b: "Batch 3 - FEB",
      npm: "231106040923",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Bisnis Digital",
      t: "2026",
      s: "Reject",
    },
    8: {
      n: "Siti Aisyah",
      b: "Batch 3 - FEB",
      npm: "231106040906",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Bisnis Digital",
      t: "2026",
      s: "Reject",
    },
    9: {
      n: "Eagle Al-Haikal",
      b: "Batch 3 - FEB",
      npm: "231106040907",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Manajemen",
      t: "2026",
      s: "Reject",
    },
    10: {
      n: "Zahra Nabil",
      b: "Batch 3 - FEB",
      npm: "231106040918",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Manajemen",
      t: "2026",
      s: "Reject",
    },
    11: {
      n: "Dila Fadilla",
      b: "Batch 3 - FEB",
      npm: "231106040902",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Akuntansi",
      t: "2026",
      s: "Reject",
    },
    12: {
      n: "Nayla Nim",
      b: "Batch 3 - FEB",
      npm: "231106040903",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Akuntansi",
      t: "2026",
      s: "Reject",
    },
    13: {
      n: "Samsul Jun",
      b: "Batch 3 - FEB",
      npm: "231106040910",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Bisnis Digital",
      t: "2026",
      s: "Reject",
    },
    14: {
      n: "Rayyan Hesa",
      b: "Batch 3 - FEB",
      npm: "231106040912",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Bisnis Digital",
      t: "2026",
      s: "Reject",
    },
    15: {
      n: "Zahra Nur",
      b: "Batch 3 - FEB",
      npm: "231106040839",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Manajemen",
      t: "2026",
      s: "Reject",
    },
    16: {
      n: "Zulvikri",
      b: "Batch 3 - FEB",
      npm: "231106040290",
      f: "Fakultas Ekonomi dan Bisnis",
      p: "Manajemen",
      t: "2026",
      s: "Reject",
    },
    17: {
      n: "Tasya Cantika",
      b: "Batch 4 - FH",
      npm: "231106040923",
      f: "Fakultas Hukum",
      p: "Ilmu Hukum",
      t: "2026",
      s: "Proses",
    },
    18: {
      n: "Baedilah",
      b: "Batch 4 - FH",
      npm: "231106040906",
      f: "Fakultas Hukum",
      p: "Ilmu Hukum",
      t: "2026",
      s: "Proses",
    },
    19: {
      n: "Mutqin",
      b: "Batch 4 - FH",
      npm: "231106040907",
      f: "Fakultas Hukum",
      p: "Ilmu Hukum",
      t: "2026",
      s: "Proses",
    },
    20: {
      n: "Husni Haqiqi",
      b: "Batch 4 - FH",
      npm: "231106040918",
      f: "Fakultas Hukum",
      p: "Ilmu Hukum",
      t: "2026",
      s: "Proses",
    },
    6131: {
      n: "Dila Fadilla",
      b: "Batch 53 - FH",
      npm: "231106040902",
      f: "Fakultas Hukum",
      p: "Ilmu Hukum",
      t: "2021",
      s: "Terbit",
    },
    6132: {
      n: "Nayla Nim",
      b: "Batch 53 - FH",
      npm: "231106040903",
      f: "Fakultas Hukum",
      p: "Ilmu Hukum",
      t: "2021",
      s: "Terbit",
    },
    6133: {
      n: "Samsul Jun",
      b: "Batch 53 - FH",
      npm: "231106040910",
      f: "Fakultas Hukum",
      p: "Ilmu Hukum",
      t: "2021",
      s: "Terbit",
    },
    6134: {
      n: "Rayyan Hesa",
      b: "Batch 53 - FH",
      npm: "231106040912",
      f: "Fakultas Agama Islam",
      p: "Penyiaran islam",
      t: "2021",
      s: "Terbit",
    },
    6135: {
      n: "Zahra Nur",
      b: "Batch 53 - FH",
      npm: "231106040839",
      f: "Fakultas Agama Islam",
      p: "Penyiaran islam",
      t: "2021",
      s: "Terbit",
    },
  };

  for (let i = 1; i <= 6135; i++) {
    const defaultItem = {
      n: `Mahasiswa ${i}`,
      b: `Batch ${Math.floor((i - 1) / 100) + 1} - FT`,
      npm: `23110604${String(i).padStart(4, "0")}`,
      f: "Fakultas Teknik dan Sains",
      p: "Teknik Informatika",
      t: "2026",
      s:
        i % 4 === 0
          ? "Revoke"
          : i % 3 === 0
          ? "Reject"
          : i % 2 === 0
          ? "Proses"
          : "Terbit",
    };

    data.push(specialData[i] || defaultItem);
  }

  return data;
};

const fullDummyData = generateDummyData();

const OperatorDashboard = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("Semua Fakultas");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const faculties = [
    "Semua Fakultas",
    "Fakultas Teknik dan Sains",
    "Fakultas Ekonomi dan Bisnis",
    "Fakultas Keguruan & Ilmu Pendidikan",
    "Fakultas Hukum",
    "Fakultas Agama Islam",
    "Fakultas Ilmu Kesehatan",
  ];

  const statusOptions = [
    "Semua Status",
    "Proses",
    "Terbit",
    "Reject",
    "Revoke",
  ];

  const filteredData = fullDummyData
    .filter((item) => {
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        item.n.toLowerCase().includes(searchLower) ||
        item.npm.toLowerCase().includes(searchLower) ||
        item.p.toLowerCase().includes(searchLower) ||
        item.f.toLowerCase().includes(searchLower) ||
        item.t.toLowerCase().includes(searchLower) ||
        item.s.toLowerCase().includes(searchLower);

      const matchesFakultas =
        selectedFakultas === "Semua Fakultas" || item.f === selectedFakultas;

      const matchesStatus =
        selectedStatus === "Semua Status" || item.s === selectedStatus;

      return matchesSearch && matchesFakultas && matchesStatus;
    })
    .sort((a, b) => {
      return (
        a.f.localeCompare(b.f) ||
        a.n.localeCompare(b.n) ||
        a.p.localeCompare(b.p) ||
        a.t.localeCompare(b.t) ||
        a.s.localeCompare(b.s)
      );
    });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFakultas, selectedStatus]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getBadgeColor = (status) => {
    switch (status) {
      case "Terbit":
        return "bg-[#27AE60] text-white";
      case "Proses":
        return "bg-[#3B82F6] text-white";
      case "Reject":
        return "bg-[#EF4444] text-white";
      case "Revoke":
        return "bg-[#F59E0B] text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

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
        onClick={() => typeof page === "number" && setCurrentPage(page)}
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
    <DashboardLayout title="Dashboard Operator">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Ringkasan Statistik
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          Update terakhir: 17 Januari 2026, 09:10 WIB
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => navigate("/ijazah/terbit")}
          className="cursor-pointer"
        >
          <StatCard
            title="Jumlah Ijazah Terbit"
            value="5.625"
            sub="20 Ijazah Terbit Minggu ini"
            subColor="text-[#27AE60]"
            icon={OperatorIcons.Badge}
          />
        </div>

        <div
          onClick={() => navigate("/ijazah/proses")}
          className="cursor-pointer"
        >
          <StatCard
            title="Jumlah Ijazah di Proses"
            value="451"
            sub="12 di Proses Minggu ini"
            subColor="text-[#3B82F6]"
            icon={OperatorIcons.Check}
          />
        </div>

        <div
          onClick={() => navigate("/ijazah/reject")}
          className="cursor-pointer"
        >
          <StatCard
            title="Jumlah Ijazah di Reject"
            value="42"
            sub="2 Data di Reject Minggu ini"
            subColor="text-[#F97316]"
            icon={OperatorIcons.Close}
          />
        </div>

        <div
          onClick={() => navigate("/ijazah/revoke")}
          className="cursor-pointer"
        >
          <StatCard
            title="Jumlah Ijazah di Revoke"
            value="17"
            sub="Tidak ada perubahan Minggu ini"
            subColor="text-[#F59E0B]"
            icon={OperatorIcons.List}
          />
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-6 text-lg">
            Statistik Penerbitan Ijazah Tahunan
          </h2>

          <IssuanceChart />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 text-lg">
            Status Data Ijazah Tahun 2026
          </h2>

          <VerificationStatusChart />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              Status Verifikasi Ijazah Mahasiswa
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto xl:justify-end">
              {/* SEARCH - DIUBAH JADI PUTIH */}
              <div className="relative w-full sm:w-72">
                <FiSearch
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Cari: Nama, NPM, Prodi"
                  className="w-full pl-9 pr-4 py-2 rounded-md bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* FILTER KANAN - DIUBAH JADI PUTIH */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:ml-auto">
                {/* FILTER FAKULTAS */}
                <div className="relative w-full sm:w-64">
                  <select
                    className="w-full appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-gray-800 text-sm py-2 pl-4 pr-10 rounded-md outline-none cursor-pointer transition-all"
                    value={selectedFakultas}
                    onChange={(e) => setSelectedFakultas(e.target.value)}
                  >
                    {faculties.map((fakultas, index) => (
                      <option key={index} value={fakultas}>
                        {fakultas}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    {OperatorIcons.DropdownArrow}
                  </div>
                </div>

                {/* FILTER STATUS */}
                <div className="relative w-full sm:w-44">
                  <select
                    className="w-full appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-gray-800 text-sm py-2 pl-4 pr-10 rounded-md outline-none cursor-pointer transition-all"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {statusOptions.map((status, index) => (
                      <option key={index} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    {OperatorIcons.DropdownArrow}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto min-h-[620px]">
          <table className="w-full table-fixed text-sm text-left">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[20%]" />
              <col className="w-[15%]" />
              <col className="w-[22%]" />
              <col className="w-[17%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>

            <thead className="bg-[#f3f4f6] text-gray-500">
              <tr>
                <th className="py-4 px-4 font-semibold text-left">No.</th>
                <th className="py-4 px-4 font-semibold text-left">Nama</th>
                <th className="py-4 px-4 font-semibold text-center">NPM</th>
                <th className="py-4 px-4 font-semibold text-center">
                  Fakultas
                </th>
                <th className="py-4 px-4 font-semibold text-center">
                  Program Studi
                </th>
                <th className="py-4 px-4 font-semibold text-center">
                  Tahun Lulus
                </th>
                <th className="py-4 px-4 font-semibold text-center">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {currentData.length > 0 ? (
                currentData.map((row, i) => (
                  <tr
                    key={i}
                    className="h-[76px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-left">
                      {indexOfFirstItem + i + 1}.
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-800 truncate">
                        {row.n}
                      </div>

                      <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {row.b}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-gray-700 truncate">
                      {row.npm}
                    </td>

                    <td className="py-4 px-4 text-center text-gray-600 font-medium">
                      <div
                        className="whitespace-normal leading-snug overflow-hidden mx-auto max-w-[190px]"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {row.f}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center text-gray-600 font-medium">
                      <div className="truncate mx-auto max-w-[160px]">
                        {row.p}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-gray-700">
                      {row.t}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block min-w-[86px] px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(
                          row.s
                        )}`}
                      >
                        {row.s}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-10 text-center text-gray-500 font-medium"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION - DIUBAH JADI PUTIH */}
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

export default OperatorDashboard;