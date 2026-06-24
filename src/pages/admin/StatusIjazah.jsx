import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardBatches, getDetailBatch } from "../../services/dashboard.api";

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
  const normalized = normalizeStatus(status);
  switch (normalized) {
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

const formatPeriode = (periode) => {
  if (!periode || periode === "-") return "-";
  
  const raw = periode.toString().replace(/_/g, " ").toLowerCase();
  return raw
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatStatusEmail = (statusKirimRaw) => {
  const raw = String(statusKirimRaw || "").toLowerCase();
  if (
    raw.includes("sudah") ||
    (raw.includes("terkirim") && !raw.includes("belum"))
  ) {
    return "Terkirim";
  }
  return "Belum Terkirim";
};

const buildFakultasOptions = (rows = []) => {
  return [
    ...new Set(
      rows.map((item) => item.fakultas || item.raw?.fakultas).filter((item) => item && item !== "-"),
    ),
  ];
};

const buildYearOptions = (rows = []) => {
  return [
    ...new Set(
      rows
        .map((item) => (item.tahun_lulus || item.tahun || item.raw?.tahun_lulus || item.raw?.tahun)?.toString())
        .filter((item) => item && item !== "-"),
    ),
  ].sort((a, b) => Number(b) - Number(a));
};

const StatusIjazah = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || "";

  const { status } = useParams();
  const currentStatus = normalizeStatus(status);
  const displayLabel = getBadgeLabel(currentStatus);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const hasLoadedRef = useRef(false);
  const [fakultas, setFakultas] = useState("");
  const [tahun, setTahun] = useState("");
  
  const [statusEmail, setStatusEmail] = useState(""); 

  const [currentPage, setCurrentPage] = useState(1);
  const [batchData, setBatchData] = useState([]);
  const [mahasiswaSearchResults, setMahasiswaSearchResults] = useState([]);
  const [fakultasList, setFakultasList] = useState([]);
  const [years, setYears] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchGlobalOptions = async () => {
      try {
        const result = await getDashboardBatches({
          limit: 5000,
          status: currentStatus,
        });
        const rows = Array.isArray(result?.data) ? result.data : [];
        
        setFakultasList(buildFakultasOptions(rows));
        setYears(buildYearOptions(rows));
      } catch (error) {
        console.error("Gagal memuat opsi filter awal:", error);
      }
    };

    if (currentStatus) {
      fetchGlobalOptions();
    }
  }, [currentStatus]);

  const isMatchMahasiswaSearch = (mhs, keyword) => {
    const text = [
      mhs.nama,
      mhs.nama_mahasiswa,
      mhs.nim,
      mhs.prodi,
      mhs.program_studi,
      mhs.nama_prodi,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(keyword);
  };

  useEffect(() => {
    const fetchIjazahData = async () => {
      try {
        if (!hasLoadedRef.current) {
          setIsLoading(true);
        } else {
          setIsSearching(true);
        }

        setApiError("");

        const result = await getDashboardBatches({
          limit: 10000,
          status: currentStatus,
          search: debouncedSearch.trim(),
          tahun_lulus: tahun,
        });

        const rows = Array.isArray(result?.data) ? result.data : [];

        const finalData = rows.map((item) => {
          const raw = item.raw || item;

          return {
            ...item,
            id: item.batch_code || raw.batch_code || item.id,
            batch_code:
              item.batch_code ||
              item.batchCode ||
              item.uuid ||
              item.batch_uuid ||
              raw.batch_code ||
              raw.uuid,
            batch: item.batch || raw.nomor_batch_upload || raw.batch || "-",
            fakultas: item.fakultas || raw.fakultas || "-",
            tahun: item.tahun?.toString() || raw.tahun_lulus?.toString() || "-",
            tahun_lulus: item.tahun_lulus || raw.tahun_lulus || "-",
            
            periode: formatPeriode(item.periode || raw.periode), 

            total: item.total ?? raw.total_mahasiswa ?? raw.total_record ?? 0,
            status: displayLabel,
            status_email: formatStatusEmail(
              item.status_email ||
                item.status_kirim ||
                item.statusKirim ||
                raw.status_email ||
                raw.status_kirim ||
                raw.statusKirim,
            ),
            raw,
          };
        });

        setBatchData(finalData);

        if (debouncedSearch.trim()) {
          const keyword = debouncedSearch.toLowerCase().trim();

          const detailResults = await Promise.all(
            finalData.map(async (batch) => {
              if (!batch.batch_code) return [];

              try {
                const detail = await getDetailBatch(batch.batch_code, currentStatus);
                
                let mahasiswaList = [];
                if (Array.isArray(detail)) {
                  mahasiswaList = detail;
                } else if (detail?.mahasiswa && Array.isArray(detail.mahasiswa)) {
                  mahasiswaList = detail.mahasiswa;
                } else if (detail?.data && Array.isArray(detail.data)) {
                  mahasiswaList = detail.data;
                } else if (detail?.data?.mahasiswa && Array.isArray(detail.data.mahasiswa)) {
                  mahasiswaList = detail.data.mahasiswa;
                }

                return mahasiswaList
                  .filter((mhs) => isMatchMahasiswaSearch(mhs, keyword))
                  .map((mhs) => ({
                    ...mhs,
                    batch: batch.batch,
                    batch_code: batch.batch_code,
                    fakultas: mhs.fakultas || batch.fakultas,
                    tahun_lulus: mhs.tahun_lulus || batch.tahun_lulus,
                    prodi:
                      mhs.prodi ||
                      mhs.program_studi ||
                      mhs.nama_prodi ||
                      "-",
                  }));
              } catch (error) {
                console.error("Gagal ambil detail batch:", batch.batch_code, error);
                return [];
              }
            }),
          );

          let allMatchedStudents = detailResults.flat();

          allMatchedStudents.sort((a, b) => {
            const namaA = (a.nama || a.nama_mahasiswa || "").toLowerCase();
            const namaB = (b.nama || b.nama_mahasiswa || "").toLowerCase();

            const aStarts = namaA.startsWith(keyword);
            const bStarts = namaB.startsWith(keyword);

            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            return namaA.localeCompare(namaB);
          });

          setMahasiswaSearchResults(allMatchedStudents);
        } else {
          setMahasiswaSearchResults([]);
        }
      } catch (error) {
        console.error(`Gagal mengambil data via getDashboardBatches:`, error);
        setApiError(error.message || "Gagal mengambil data dari server.");
      } finally {
        setIsLoading(false);
        setIsSearching(false);
        hasLoadedRef.current = true;
      }
    };

    fetchIjazahData();
  }, [currentStatus, debouncedSearch, tahun]);

  const filtered = batchData
    .filter((item) => {
      const matchSearch = true;
      const matchesFakultas = fakultas ? item.fakultas === fakultas : true;
      const matchesTahun = tahun ? String(item.tahun) === String(tahun) : true;
      
      const matchesStatusEmail =
        currentStatus === "terbit" && statusEmail !== ""
          ? item.status_email === statusEmail
          : true;

      return (
        matchSearch && matchesFakultas && matchesTahun && matchesStatusEmail
      );
    })
    .sort((a, b) => {
      const batchA = String(
        a.batch ||
          a.nomor_batch_upload ||
          a.raw?.nomor_batch_upload ||
          "",
      ).trim();

      const batchB = String(
        b.batch ||
          b.nomor_batch_upload ||
          b.raw?.nomor_batch_upload ||
          "",
      ).trim();

      return batchA.localeCompare(batchB, "id", {
        numeric: true,
        sensitivity: "base",
      });
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fakultas, tahun, statusEmail]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const handleDetailBatch = (item) => {
    const batchCode =
      item.batch_code ||
      item.batchCode ||
      item.uuid ||
      item.batch_uuid ||
      item.raw?.batch_code ||
      item.raw?.uuid ||
      item.id;

    if (!batchCode) {
      console.error("Batch code tidak ditemukan:", item);
      return;
    }

    navigate(`/batch/${currentStatus}/${encodeURIComponent(batchCode)}`, {
      state: {
        batch: item,
      },
    });
  };

  const getRolePath = (role) => {
    const normalizedRole = String(role || "").toLowerCase();

    if (normalizedRole.includes("rektor")) return "rektor";
    if (normalizedRole.includes("operator")) return "operator";
    if (normalizedRole.includes("verifikator")) return "verifikator";
    if (normalizedRole.includes("admin")) return "admin";

    return "operator";
  };

  const handleGoDetailMahasiswa = (student) => {
    const mahasiswaCode =
      student.mahasiswa_code ||
      student.mahasiswaCode ||
      student.uuid ||
      student.mahasiswa_uuid ||
      student.raw?.mahasiswa_code ||
      student.raw?.uuid;

    if (!mahasiswaCode) {
      console.error("Kode mahasiswa tidak ditemukan:", student);
      alert("Kode mahasiswa tidak ditemukan pada data ini.");
      return;
    }

    const safeCode = encodeURIComponent(mahasiswaCode);
    const rolePath = getRolePath(userRole);

    navigate(`/${rolePath}/detail-mahasiswa/${safeCode}`, {
      state: {
        mahasiswa: student,
      },
    });
  };

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
        onClick={() => typeof page === "number" && handlePageChange(page)}
        disabled={page === "..."}
        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded text-xs font-bold shadow-sm transition-colors ${
          page === currentPage
            ? "bg-[#117065] text-white"
            : page === "..."
              ? "bg-transparent text-gray-400 cursor-default shadow-none"
              : "bg-white border border-gray-300 text-gray-500 hover:bg-gray-100"
        }`}
      >
        {page}
      </button>
    ));
  };

  if (isLoading && !hasLoadedRef.current) { 
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
        <div className="mb-6 px-1 sm:px-0">
          <h1 className="text-xl sm:text-[26px] font-bold text-gray-900 capitalize">
            List Ijazah {displayLabel}
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1 capitalize">
            Melihat kumpulan data batch yang berstatus {displayLabel}
          </p>
          {apiError && (
            <p className="text-sm text-red-500 mt-2 font-semibold">
              {apiError}
            </p>
          )}
        </div>

        {/* FILTER BOX RESPONSIVE & EDGE FIX */}
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 xl:gap-6">
            
            {/* Search Input */}
            <div className="w-full xl:max-w-md shrink-0">
              <div className="flex items-center bg-white border border-gray-300 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
                <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cari: Nama, NIM, Prodi..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
              
              <div className="relative w-full sm:w-auto sm:flex-1 md:flex-none xl:w-56 shrink-0">
                <select
                  value={fakultas}
                  onChange={(e) => setFakultas(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm text-gray-800 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left"
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

              <div className="relative w-full sm:w-auto sm:flex-1 md:flex-none xl:w-40 shrink-0">
                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm text-gray-800 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left"
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

              {currentStatus === "terbit" && (
                <div className="relative w-full sm:w-auto sm:flex-1 md:flex-none xl:w-48 shrink-0">
                  <select
                    value={statusEmail}
                    onChange={(e) => setStatusEmail(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left"
                  >
                    <option value="">Semua Status Email</option>
                    <option value="Terkirim">Terkirim</option>
                    <option value="Belum Terkirim">Belum Terkirim</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        {isSearching && (
          <p className="text-xs text-gray-400 font-medium mb-3">
            Mencari data...
          </p>
        )}

        {/* HASIL MAHASISWA SEARCH */}
        {debouncedSearch.trim() && mahasiswaSearchResults.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-6">
            {mahasiswaSearchResults.map((mhs, index) => {
              const mahasiswaCode =
                mhs.mahasiswa_code ||
                mhs.mahasiswaCode ||
                mhs.uuid ||
                mhs.mahasiswa_uuid;

              return (
                <div
                  key={mahasiswaCode || mhs.nim || index}
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                    handleGoDetailMahasiswa(mhs);
                  }}
                  className={`px-4 sm:px-6 py-4 flex flex-col gap-1 hover:bg-gray-50 cursor-pointer transition-colors ${
                    index !== mahasiswaSearchResults.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="font-bold text-gray-900 text-[14px] sm:text-[15px] break-words">
                    {mhs.nama || mhs.nama_mahasiswa || "-"}
                  </div>
                  
                  <div className="text-xs sm:text-sm text-gray-500 font-medium break-words">
                    {mhs.nim || "-"} • {mhs.prodi || mhs.program_studi || mhs.nama_prodi || "-"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TABLE SECTION RESPONSIVE FIX */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[900px] table-fixed text-sm">
              <colgroup>
                <col className="w-[5%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[10%]" />
                <col className="w-[15%]" />
                <col className="w-[8%]" />
                {currentStatus === "terbit" && <col className="w-[12%]" />}
                <col className="w-[10%]" />
              </colgroup>
              <thead className="bg-[#F7F7F7] text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-center whitespace-nowrap">No</th>
                  <th className="px-4 py-4 text-left whitespace-nowrap">List Batch</th>
                  <th className="px-4 py-4 text-center whitespace-nowrap">Fakultas</th>
                  <th className="px-4 py-4 text-center whitespace-nowrap">Tahun Lulus</th>
                  <th className="px-4 py-4 text-center whitespace-nowrap">Periode</th>
                  <th className="px-4 py-4 text-center whitespace-nowrap">Total</th>

                  {currentStatus === "terbit" && (
                    <th className="px-4 py-4 text-center whitespace-nowrap">Status Email</th>
                  )}

                  <th className="px-4 py-4 text-center whitespace-nowrap">Detail</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, i) => {
                    const actualIndex = (currentPage - 1) * itemsPerPage + i + 1;
                    return (
                      <tr
                        key={item.id || i}
                        className="h-[70px] border-t border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-center align-middle font-semibold text-gray-700">
                          {actualIndex}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-900 align-middle truncate">
                          {item.batch}
                        </td>
                        <td className="py-4 px-4 text-center font-medium align-middle truncate text-gray-600">
                          {item.fakultas}
                        </td>
                        <td className="px-4 py-4 text-center font-semibold align-middle text-gray-700">
                          {item.tahun}
                        </td>
                        <td className="px-4 py-4 text-center font-semibold align-middle text-gray-700">
                          {item.periode}
                        </td>
                        <td className="px-4 py-4 text-center font-semibold align-middle text-gray-700">
                          {item.total}
                        </td>

                        {currentStatus === "terbit" && (
                          <td className="px-4 py-4 text-center align-middle">
                            <span
                              className={`inline-block whitespace-nowrap px-3 py-1.5 rounded-md text-[11px] font-bold shadow-sm ${
                                item.status_email === "Terkirim"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {item.status_email}
                            </span>
                          </td>
                        )}

                        <td className="px-4 py-3 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleDetailBatch(item)}
                            className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition"
                            title="Lihat detail batch"
                          >
                            <div className="w-3.5 h-3.5 border-t-2 border-b-2 border-gray-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={currentStatus === "terbit" ? "8" : "7"}
                      className="px-4 py-12 text-center text-gray-400 font-medium"
                    >
                      Data {displayLabel} tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION RESPONSIVE */}
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs sm:text-[13px] text-gray-500 font-medium text-center sm:text-left">
              Menampilkan {paginatedData.length} dari {filtered.length} Data
            </p>
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50 transition-colors"
                >
                  {"<"}
                </button>
                {renderPaginationButtons()}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50 transition-colors"
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

export default StatusIjazah;