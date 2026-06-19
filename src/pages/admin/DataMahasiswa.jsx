import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import {
  getDashboardBatches,
  getDetailBatch,
} from "../../services/dashboard.api";

const normalizeBatch = (item = {}, index = 0) => {
  const batchCode =
    item.batch_code ||
    item.batchCode ||
    item.uuid ||
    item.batch_uuid ||
    item.raw?.batch_code ||
    item.raw?.uuid ||
    null;

  const internalId =
    item.id_batch_upload ||
    item.id_batch ||
    item.batch_id ||
    item.id ||
    index + 1;

  const id = batchCode || internalId;

  return {
    ...item,
    id,
    batch_code: batchCode,
    batchCode,
    id_batch_upload: item.id_batch_upload || internalId,

    batch:
      item.batch ||
      item.nama_batch ||
      item.nomor_batch_upload ||
      item.nomor_batch ||
      item.nama_file ||
      `Batch ${id}`,

    fakultas:
      item.fakultas || item.nama_fakultas || item.nama_unit || item.unit || "-",

    tahun:
      item.tahun?.toString() ||
      item.tahun_lulus?.toString() ||
      item.tahunLulus?.toString() ||
      "-",

    tahun_lulus: item.tahun_lulus || item.tahun || item.tahunLulus || "-",

    periode: item.periode || item.semester || item.periode_lulus || "-",

    total: Number(
      item.total ||
        item.total_record ||
        item.jumlah_mahasiswa ||
        item.total_mahasiswa ||
        0,
    ),

    mahasiswa: Array.isArray(item.mahasiswa) ? item.mahasiswa : [],
  };
};

const DataMahasiswa = () => {
  const navigate = useNavigate();

  const itemsPerPage = 10;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  const [mahasiswaSearchResults, setMahasiswaSearchResults] = useState([]);
  const [isSearchingMahasiswa, setIsSearchingMahasiswa] = useState(false);

  const [tahun, setTahun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [batchData, setBatchData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_data: 0,
    total_page: 1,
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [apiError, setApiError] = useState("");

  const years = ["2021", "2022", "2023", "2024", "2025", "2026"];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isMatchMahasiswaSearch = (mhs, keyword) => {
    const text = [
      mhs.nama,
      mhs.nama_mahasiswa,
      mhs.nim,
      mhs.prodi,
      mhs.program_studi,
      mhs.nama_prodi,
      mhs.fakultas,
      mhs.tahun_lulus,
      mhs.tahun,
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(keyword);
  };

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        if (isInitialLoading) {
          setIsInitialLoading(true);
        } else {
          setIsFetching(true);
        }

        setApiError("");

        const result = await getDashboardBatches({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          tahun_lulus: tahun,
        });

        const rows = Array.isArray(result.data) ? result.data : [];

        const normalizedRows = rows.map((item, index) =>
          normalizeBatch(item, index),
        );

        setBatchData(normalizedRows);

        if (debouncedSearch.trim()) {
          setIsSearchingMahasiswa(true);

          const keyword = debouncedSearch.toLowerCase().trim();

          try {
            const detailResults = await Promise.all(
              normalizedRows.map(async (batch) => {
                const batchCode =
                  batch.batch_code ||
                  batch.batchCode ||
                  batch.uuid ||
                  batch.batch_uuid ||
                  batch.raw?.batch_code ||
                  batch.raw?.uuid ||
                  batch.id;

                if (!batchCode) return [];

                try {
                  const detail = await getDetailBatch(batchCode);
                  const detailData = detail?.data || detail || {};

                  const mahasiswaList = Array.isArray(detailData.mahasiswa)
                    ? detailData.mahasiswa
                    : [];

                  return mahasiswaList
                    .filter((mhs) => isMatchMahasiswaSearch(mhs, keyword))
                    .map((mhs) => ({
                      ...mhs,
                      batch: batch.batch,
                      batch_code: batchCode,
                      fakultas: mhs.fakultas || batch.fakultas,
                      tahun_lulus: mhs.tahun_lulus || batch.tahun_lulus,
                      prodi:
                        mhs.prodi || mhs.program_studi || mhs.nama_prodi || "-",
                    }));
                } catch (error) {
                  console.error("Gagal ambil detail batch:", batchCode, error);
                  return [];
                }
              }),
            );

            setMahasiswaSearchResults(detailResults.flat());
          } finally {
            setIsSearchingMahasiswa(false);
          }
        } else {
          setMahasiswaSearchResults([]);
        }

        setPagination({
          page: Number(result.pagination?.page || result.page || currentPage),
          limit: Number(result.pagination?.limit || itemsPerPage),
          total_data: Number(
            result.pagination?.total_data || result.total || 0,
          ),
          total_page: Number(
            result.pagination?.total_page || result.totalPages || 1,
          ),
        });
      } catch (error) {
        console.error("Gagal mengambil data batch:", error);
        setApiError(error.message || "Gagal mengambil data batch dari server.");

        setBatchData([]);
        setPagination({
          page: 1,
          limit: itemsPerPage,
          total_data: 0,
          total_page: 1,
        });
      } finally {
        setIsInitialLoading(false);
        setIsFetching(false);
      }
    };

    fetchBatchData();
  }, [currentPage, debouncedSearch, tahun]);

  const paginatedData = batchData;

  const totalPages = Number(pagination.total_page || 1);
  const totalData = Number(pagination.total_data || 0);


  const currentSuggestions = mahasiswaSearchResults
  .map((mhs) => ({
    id:
      mhs.mahasiswa_code ||
      mhs.mahasiswaCode ||
      mhs.uuid ||
      mhs.mahasiswa_uuid ||
      mhs.nim,

    nama: mhs.nama || mhs.nama_mahasiswa || "-",
    nim: mhs.nim || "-",
    prodi:
      mhs.prodi ||
      mhs.program_studi ||
      mhs.nama_prodi ||
      "Program Studi",
    fakultas: mhs.fakultas || "-",
    batchName: mhs.batch || "-",
    batchData: {
      batch: mhs.batch,
      batch_code: mhs.batch_code,
      fakultas: mhs.fakultas,
      tahun_lulus: mhs.tahun_lulus,
    },
    mahasiswaData: mhs,
  }))
  .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
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


  const handleNavigateMahasiswa = (item) => {
  const mahasiswaCode =
    item.mahasiswaData?.mahasiswa_code ||
    item.mahasiswaData?.mahasiswaCode ||
    item.mahasiswaData?.uuid ||
    item.mahasiswaData?.mahasiswa_uuid;

  if (!mahasiswaCode) {
    console.error("Mahasiswa code tidak ditemukan:", item);
    alert("Kode mahasiswa tidak ditemukan.");
    return;
  }

  const safeMahasiswaCode = encodeURIComponent(mahasiswaCode);

  navigate(`/admin/detail-mahasiswa/${safeMahasiswaCode}`, {
    state: {
      mahasiswa: item.mahasiswaData,
      batch: item.batchData,
    },
  });
};


  const handleDetailBatch = (item) => {
    const batchCode =
      item.batch_code ||
      item.batchCode ||
      item.uuid ||
      item.raw?.batch_code ||
      item.raw?.uuid ||
      item.id;

    if (!batchCode) {
      alert("Kode batch tidak ditemukan.");
      return;
    }

    navigate(`/admin/detail-batch/${encodeURIComponent(batchCode)}`, {
      state: item,
    });
  };

  if (isInitialLoading) {
    return (
      <DashboardLayout title="Daftar Batch">
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#117065]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Daftar Batch">
      <div className="w-full">
        <div className="mb-7">
          <h1 className="text-[28px] font-bold text-[#111827] leading-tight">
            Daftar Batch
          </h1>

          <p className="text-[#9CA3AF] text-sm mt-1">
            Melihat daftar batch dari semua mahasiswa
          </p>

          {isFetching && (
            <p className="text-xs text-[#117065] mt-2 font-semibold">
              Memuat data terbaru...
            </p>
          )}

          {apiError && (
            <p className="text-sm text-red-500 mt-2 font-semibold">
              {apiError}
            </p>
          )}
        </div>

       {/* BAGIAN FILTER & SEARCH */}
<div className="mb-6" ref={searchContainerRef}>
  <div className="bg-white p-4 shadow-sm border border-gray-100 rounded-xl">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Search */}
      <div className="w-full lg:max-w-md">
        <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
          <FiSearch className="text-gray-400 text-lg mr-3" />

          <input
            type="text"
            placeholder="Cari: Batch, Nama, NIM, Prodi,"
            value={search}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
              setShowSuggestions(true);
            }}
            className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto">
        <div className="relative w-full lg:w-44">
          <select
            value={tahun}
            onChange={(e) => {
              setTahun(e.target.value);
              setCurrentPage(1);
            }}
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

  {(isFetching || isSearchingMahasiswa) && (
    <p className="text-xs text-[#117065] mt-3 font-semibold">
      Memuat data terbaru...
    </p>
  )}

  {/* AUTOCOMPLETE SUGGESTION LIST */}
  {showSuggestions &&
    search.trim() &&
    currentSuggestions.length > 0 && (
      <div className="mt-4 w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-h-[400px] overflow-y-auto">
        {currentSuggestions.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => {
              setShowSuggestions(false);
              handleNavigateMahasiswa(item);
            }}
            className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center ${
              index !== currentSuggestions.length - 1
                ? "border-b border-gray-100"
                : ""
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-gray-800">
                {item.nama}
              </span>

              <span className="text-[13px] text-gray-400 mt-0.5">
                {item.nim} • {item.prodi}
              </span>

              <span className="text-[13px] text-gray-400 mt-0.5">
                {item.fakultas}
              </span>
            </div>

            <div className="flex-shrink-0 ml-4">
              <span className="bg-[#F3F4F6] text-gray-500 text-[12px] font-bold px-3 py-1.5 rounded-lg border border-gray-100">
                {item.batchName}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
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
                  const actualIndex = (currentPage - 1) * itemsPerPage + i + 1;

                  return (
                    <tr
                      key={item.id || i}
                      className="h-[70px] border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-center align-middle">
                        {actualIndex}
                      </td>

                      <td className="px-4 py-4 font-semibold text-gray-800 align-middle">
                        {item.batch}
                      </td>

                      <td className="py-4 px-4 text-center font-semibold align-middle">
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
                    Data batch tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {paginatedData.length} dari {totalData} Data
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

export default DataMahasiswa;
