import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { getLatestValidations } from "../../services/dashboard.api";
import { useNavigate, useLocation } from "react-router-dom";

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

const getBatchNumber = (batchName = "") => {
  const match = batchName.match(/Batch\s+(\d+)/i);
  return match ? Number(match[1]) : 0;
};

const getPeriodeValue = (item = {}) => {
  return (
    item.periode ||
    item.raw?.periode ||
    item.raw?.batch_upload?.periode ||
    item.raw?.mahasiswa?.batch_upload?.periode ||
    item.batch_upload?.periode ||
    item.mahasiswa?.batch_upload?.periode ||
    "-"
  ).toString();
};

const buildBatchData = (rows = []) => {
  const terbitRows = rows.filter(
    (item) => normalizeStatus(item.status) === "terbit"
  );

  const grouped = {};

  terbitRows.forEach((item, index) => {
    const batchName = item.batch || "Tanpa Batch";
    const fakultas = item.fakultas || "-";
    const tahun = item.tahun_lulus?.toString() || "-";
    const periode = getPeriodeValue(item);

    const key = `${batchName}-${fakultas}-${tahun}-${periode}`;

    if (!grouped[key]) {
      grouped[key] = {
        id: item.id_batch || item.id_batch_upload || key,
        batch: batchName,
        fakultas,
        tahun,
        periode,
        total: 0,
        status: "Terbit",
        mahasiswa: [],
      };
    }

    grouped[key].mahasiswa.push({
      id: item.id || item.id_mahasiswa || index + 1,
      id_mahasiswa: item.id_mahasiswa,
      nama: item.nama || "-",
      nim: item.nim || "-",
      prodi: item.prodi || "-",
      fakultas,
      tahun,
      tahun_lulus: tahun,
      periode,
      status: item.status || "Terbit",
      batch: batchName,
      raw: item,
    });

    grouped[key].total = grouped[key].mahasiswa.length;
  });

  return Object.values(grouped);
};

const buildFakultasOptions = (rows = []) => {
  const uniqueFakultas = [
    ...new Set(
      rows
        .filter((item) => normalizeStatus(item.status) === "terbit")
        .map((item) => item.fakultas)
        .filter((item) => item && item !== "-")
    ),
  ];

  return uniqueFakultas;
};

const buildYearOptions = (rows = []) => {
  const uniqueYears = [
    ...new Set(
      rows
        .filter((item) => normalizeStatus(item.status) === "terbit")
        .map((item) => item.tahun_lulus?.toString())
        .filter((item) => item && item !== "-")
    ),
  ].sort((a, b) => Number(b) - Number(a));

  return uniqueYears;
};

const IjazahTerbit = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const status = location.state?.status || "terbit";

  const [search, setSearch] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [tahun, setTahun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [batchData, setBatchData] = useState([]);
  const [fakultasList, setFakultasList] = useState([]);
  const [years, setYears] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchIjazahTerbit = async () => {
      try {
        setIsLoading(true);
        setApiError("");

        const result = await getLatestValidations({
          page: 1,
          limit: 100,
          search: "",
          status: status,
        });

        const rows = Array.isArray(result.data) ? result.data : [];

        setBatchData(buildBatchData(rows));
        setFakultasList(buildFakultasOptions(rows));
        setYears(buildYearOptions(rows));
      } catch (error) {
        console.error("Gagal mengambil data ijazah terbit:", error);
        setApiError(error.message || "Gagal mengambil data dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIjazahTerbit();
  }, [status]);

  const filtered = batchData
    .filter((item) => {
      const keyword = search.toLowerCase();

      const matchBatch = item.batch?.toLowerCase().includes(keyword);
      const matchFakultas = item.fakultas?.toLowerCase().includes(keyword);
      const matchTahun = item.tahun?.toString().toLowerCase().includes(keyword);
      const matchPeriode = item.periode?.toLowerCase().includes(keyword);

      const matchMahasiswa = item.mahasiswa.some((mhs) => {
        const searchableText = [
          mhs.nama,
          mhs.nim,
          mhs.prodi,
          mhs.fakultas,
          mhs.tahun,
          mhs.periode,
          mhs.status,
          mhs.batch,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(keyword);
      });

      const matchesSearch =
        !search ||
        matchBatch ||
        matchFakultas ||
        matchTahun ||
        matchPeriode ||
        matchMahasiswa;

      const matchesFakultas = fakultas ? item.fakultas === fakultas : true;
      const matchesTahun = tahun ? item.tahun?.toString() === tahun : true;

      return matchesSearch && matchesFakultas && matchesTahun;
    })
    .sort(
      (a, b) =>
        a.fakultas.localeCompare(b.fakultas) ||
        getBatchNumber(a.batch) - getBatchNumber(b.batch) ||
        a.tahun.localeCompare(b.tahun) ||
        a.periode.localeCompare(b.periode)
    );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fakultas, tahun, status]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleDetailBatch = (item) => {
    navigate(`/batch/terbit/${item.id}`, { state: item });
  };

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
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900">
            Jumlah Ijazah Terbit
          </h1>

          <p className="text-[#9CA3AF] text-sm mt-1">
            Data diambil dari backend dashboard
          </p>

          {apiError && (
            <p className="text-sm text-red-500 mt-2 font-semibold">
              {apiError}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="w-full lg:max-w-md">
              <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
                <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />

                <input
                  type="text"
                  placeholder="Cari: Nama, NIM, Prodi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full lg:w-72">
                <select
                  value={fakultas}
                  onChange={(e) => setFakultas(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left"
                >
                  <option value="">Semua Fakultas</option>

                  {fakultasList.map((item, i) => (
                    <option key={i} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>

              <div className="relative w-full lg:w-44">
                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left"
                >
                  <option value="">Semua Tahun</option>

                  {years.map((item, i) => (
                    <option key={i} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[20%]" />
              <col className="w-[24%]" />
              <col className="w-[12%]" />
              <col className="w-[18%]" />
              <col className="w-[10%]" />
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
                <th className="px-4 py-4 text-center">Detail</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, i) => {
                  const actualIndex =
                    (currentPage - 1) * itemsPerPage + i + 1;

                  return (
                    <tr
                      key={`${item.batch}-${item.fakultas}-${item.tahun}-${item.periode}`}
                      className="h-[70px] border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-center align-middle">
                        {actualIndex}
                      </td>

                      <td className="px-4 py-4 font-medium text-gray-800 align-middle">
                        {item.batch}
                      </td>

                      <td className="py-4 px-4 text-center font-medium align-middle">
                       
                          {item.fakultas}
                      
                      </td>

                      <td className="px-4 py-4 text-center font-semibold align-middle">
                        {item.tahun}
                      </td>

                      <td className="px-4 py-4 text-center font-semibold align-middle">
                        {item.periode}
                      </td>

                      <td className="px-4 py-4 text-center font-semibold align-middle">
                        {item.total}
                      </td>

                      <td className="px-4 py-3 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleDetailBatch(item)}
                          className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-100 transition"
                          title="Lihat detail batch"
                        >
                          <div className="w-3 h-3 border-t-2 border-b-2 border-gray-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
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

          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {paginatedData.length} dari {filtered.length} Data
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50"
                >
                  {"<"}
                </button>

                {renderPaginationButtons()}

                <button
                  type="button"
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

export default IjazahTerbit;