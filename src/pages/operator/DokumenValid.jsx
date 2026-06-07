// src/pages/operator/DokumenValid.jsx

import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getLatestValidations } from "../../services/dashboard.api";

const itemsPerPage = 10;

const extractRows = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.rows)) return response.rows;

  return [];
};

const normalizeStatus = (status) => {
  return String(status || "").toLowerCase().trim();
};

const isDokumenValid = (item) => {
  const status = normalizeStatus(item.status);

  return (
    status === "terbit" ||
    status === "valid" ||
    status === "verified" ||
    item.has_verified_document === true ||
    item.has_verified_document === "true"
  );
};

const formatPeriode = (periode) => {
  const value = String(periode || "").toLowerCase().trim();

  if (value === "ganjil") return "Semester Ganjil";
  if (value === "genap") return "Semester Genap";
  if (value.includes("ganjil")) return "Semester Ganjil";
  if (value.includes("genap")) return "Semester Genap";

  return periode || "-";
};

const getBatchName = (item) => {
  return (
    item.nomor_batch_upload ||
    item.batch ||
    item.listBatch ||
    `Batch ${item.id_batch_upload || "-"}`
  );
};

const getBatchKey = (item) => {
  return [
    item.id_batch_upload || item.nomor_batch_upload || item.batch || "tanpa-batch",
    item.fakultas || "-",
    item.tahun_lulus || item.tahunLulus || "-",
    item.periode || "-",
  ].join("-");
};

const formatMahasiswa = (item, index, batchData) => {
  return {
    id: item.id_mahasiswa || item.id || index + 1,
    id_mahasiswa: item.id_mahasiswa,

    nim: item.nim || "-",
    nama: item.nama || item.nama_mahasiswa || "-",
    nama_mahasiswa: item.nama_mahasiswa || item.nama || "-",

    prodi: item.prodi || item.program_studi || "-",
    program_studi: item.program_studi || item.prodi || "-",

    batch: batchData.listBatch,
    fakultas: item.fakultas || batchData.fakultas || "-",

    tahunLulus: item.tahun_lulus || item.tahunLulus || batchData.tahunLulus || "-",
    tahun_lulus: item.tahun_lulus || item.tahunLulus || batchData.tahunLulus || "-",

    periode: formatPeriode(item.periode || batchData.periode),
    status: "Terbit",

    raw: item,
  };
};

const groupByBatch = (rows = []) => {
  const grouped = {};

  rows.filter(isDokumenValid).forEach((item, index) => {
    const key = getBatchKey(item);
    const batchName = getBatchName(item);

    if (!grouped[key]) {
      grouped[key] = {
        id: item.id_batch_upload || key,
        id_batch_upload: item.id_batch_upload,

        listBatch: batchName,
        batch: batchName,

        fakultas: item.fakultas || "-",
        tahunLulus: item.tahun_lulus || item.tahunLulus || "-",
        tahun_lulus: item.tahun_lulus || item.tahunLulus || "-",

        periode: formatPeriode(item.periode),
        totalData: 0,
        mahasiswa: [],
        status: "Terbit",
      };
    }

    grouped[key].totalData += 1;
    grouped[key].mahasiswa.push(formatMahasiswa(item, index, grouped[key]));
  });

  return Object.values(grouped);
};

const DokumenValid = () => {
  const navigate = useNavigate();

  const [batchData, setBatchData] = useState([]);
  const [search, setSearch] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [tahun, setTahun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const fetchDokumenValid = async () => {
      try {
        setIsLoading(true);
        setApiError("");

        let response;

        try {
          response = await getLatestValidations({
            page: 1,
            limit: 10000,
            search: "",
          });
        } catch (error) {
          response = await getLatestValidations(1, 10000, "");
        }

        const rows = extractRows(response);
        const groupedData = groupByBatch(rows);

        setBatchData(groupedData);
      } catch (error) {
        console.error("Gagal mengambil dokumen valid:", error);
        setApiError(error.message || "Gagal mengambil data dokumen valid");
        setBatchData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDokumenValid();
  }, []);

  const fakultasOptions = useMemo(() => {
    const options = batchData
      .map((item) => item.fakultas)
      .filter((item) => item && item !== "-");

    return ["Semua Fakultas", ...new Set(options)];
  }, [batchData]);

  const tahunOptions = useMemo(() => {
    const options = batchData
      .map((item) => item.tahunLulus)
      .filter((item) => item && item !== "-")
      .map(String);

    return ["Semua Tahun", ...new Set(options)];
  }, [batchData]);

  const searchResult = useMemo(() => {
    if (!search.trim()) return [];

    const keyword = search.toLowerCase();
    const result = [];

    batchData.forEach((batch) => {
      batch.mahasiswa.forEach((mhs) => {
        const match =
          String(mhs.nama || "").toLowerCase().includes(keyword) ||
          String(mhs.nim || "").toLowerCase().includes(keyword) ||
          String(mhs.prodi || "").toLowerCase().includes(keyword);

        if (match) {
          result.push({
            nim: mhs.nim,
            nama: mhs.nama,
            prodi: mhs.prodi,
            batch: mhs.batch || batch.listBatch,
            fakultas: mhs.fakultas || batch.fakultas,
            tahunLulus: mhs.tahunLulus || batch.tahunLulus,
            tahun_lulus: mhs.tahun_lulus || batch.tahunLulus,
            status: "Terbit",
            mahasiswa: {
              ...mhs,
              nim: mhs.nim,
              nama: mhs.nama,
              prodi: mhs.prodi,
              batch: mhs.batch || batch.listBatch,
              fakultas: mhs.fakultas || batch.fakultas,
              tahunLulus: mhs.tahunLulus || batch.tahunLulus,
              tahun_lulus: mhs.tahun_lulus || batch.tahunLulus,
              status: "Terbit",
            },
          });
        }
      });
    });

    return result;
  }, [search, batchData]);

  const filtered = useMemo(() => {
    return batchData.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.listBatch.toLowerCase().includes(keyword) ||
        item.fakultas.toLowerCase().includes(keyword) ||
        String(item.tahunLulus).toLowerCase().includes(keyword) ||
        String(item.periode).toLowerCase().includes(keyword) ||
        item.mahasiswa.some((mhs) => {
          return (
            String(mhs.nama || "").toLowerCase().includes(keyword) ||
            String(mhs.nim || "").toLowerCase().includes(keyword) ||
            String(mhs.prodi || "").toLowerCase().includes(keyword)
          );
        });

      const matchFakultas =
        !fakultas ||
        fakultas === "Semua Fakultas" ||
        item.fakultas === fakultas;

      const matchTahun =
        !tahun ||
        tahun === "Semua Tahun" ||
        String(item.tahunLulus) === String(tahun);

      return matchSearch && matchFakultas && matchTahun;
    });
  }, [batchData, search, fakultas, tahun]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fakultas, tahun]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDetailClick = (item) => {
    navigate(`/operator/dokumen-valid/batch/${encodeURIComponent(item.id)}`, {
      state: item,
    });
  };

  const handleMahasiswaClick = (item) => {
    const mahasiswaData = {
      nim: item.nim,
      nama: item.nama,
      nama_mahasiswa: item.nama,
      prodi: item.prodi,
      program_studi: item.prodi,
      fakultas: item.fakultas,
      tahunLulus: item.tahunLulus,
      tahun_lulus: item.tahun_lulus || item.tahunLulus,
      batch: item.batch,
      status: item.status,
      mahasiswa: item.mahasiswa,
    };

    if (item.status === "Terbit") {
      navigate(`/operator/detail-dokumen-valid/${encodeURIComponent(item.nim)}`, {
        state: mahasiswaData,
      });
    } else {
      navigate(`/operator/detail-pelaporan/${encodeURIComponent(item.nim)}`, {
        state: mahasiswaData,
      });
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
    <DashboardLayout title="Dokumen Valid">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900">
            Daftar Dokumen Valid
          </h1>

          <p className="text-[#9CA3AF] text-sm mt-1">
            Arsip digital ijazah dan transkrip mahasiswa yang telah melewati
            proses verifikasi institusi.
          </p>

          {apiError && (
            <p className="text-sm text-red-500 font-semibold mt-2">
              {apiError}
            </p>
          )}
        </div>

        {/* FILTER BOX - PUTIH */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="w-full lg:max-w-md">
              <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
                <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />

                <input
                  type="text"
                  placeholder="Cari: Nama Mahasiswa, NIM, Prodi"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full lg:w-56">
                <select
                  value={fakultas || "Semua Fakultas"}
                  onChange={(e) =>
                    setFakultas(
                      e.target.value === "Semua Fakultas"
                        ? ""
                        : e.target.value
                    )
                  }
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm"
                >
                  {fakultasOptions.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

              <div className="relative w-full lg:w-44">
                <select
                  value={tahun || "Semua Tahun"}
                  onChange={(e) =>
                    setTahun(
                      e.target.value === "Semua Tahun" ? "" : e.target.value
                    )
                  }
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm"
                >
                  {tahunOptions.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

      

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <div className="min-w-[1000px]">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-[#F3F4F6] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 w-[200px]">List Batch</th>
                  <th className="py-4 px-6 text-center w-[280px]">
                    Fakultas
                  </th>
                  <th className="py-4 px-6 text-center w-[120px]">
                    Tahun Lulus
                  </th>
                  <th className="py-4 px-6 text-center w-[150px]">
                    Periode
                  </th>
                  <th className="py-4 px-6 text-center w-[100px]">
                    Total Data
                  </th>
                  <th className="py-4 px-6 text-center w-24">Detail</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-8 text-center text-gray-500 font-medium"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => {
                    const actualIndex =
                      (currentPage - 1) * itemsPerPage + index + 1;

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-center font-medium text-gray-800 truncate">
                          {actualIndex}.
                        </td>

                        <td className="py-4 px-6 font-medium text-gray-900 truncate">
                          {item.listBatch}
                        </td>

                        <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">
                          {item.fakultas}
                        </td>

                        <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">
                          {item.tahunLulus}
                        </td>

                        <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">
                          {item.periode}
                        </td>

                        <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">
                          {item.totalData}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleDetailClick(item)}
                            className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition flex-shrink-0"
                          >
                            <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && paginatedData.length === 0 && (
            <div className="py-8 text-center text-gray-500 font-medium">
              Data tidak ditemukan.
            </div>
          )}

          {/* PAGINATION */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {paginatedData.length} dari {filtered.length} Data
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

export default DokumenValid;