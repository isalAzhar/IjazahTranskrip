import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { getValidDocumentBatches } from "../../services/document.api";

const ITEMS_PER_PAGE = 10;

const normalizeStatusEmail = (statusRaw) => {
  const raw = String(statusRaw || "").toLowerCase();
  if (raw.includes("terkirim") && !raw.includes("belum")) {
    return "Terkirim";
  }
  return "Belum Terkirim";
};

const getStatusBadgeClass = (status) => {
  const normalized = normalizeStatusEmail(status);
  if (normalized === "Terkirim") {
    return "bg-green-100 text-green-700";
  }
  return "bg-orange-100 text-orange-700";
};

const RektorDokumenValid = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [statusEmail, setStatusEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [batches, setBatches] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    fakultas: [],
    tahun: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total_data: 0,
    total_page: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalPages = pagination.total_page || 1;
  const currentData = batches;

  const fetchValidBatches = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getValidDocumentBatches({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
        fakultas: selectedFakultas,
        tahun: selectedYear,
        status_email: statusEmail,
      });

      const rows = Array.isArray(result.data) ? result.data : [];

      const mappedRows = rows.map((item) => {
        const batchCode =
          item.batch_code ||
          item.batchCode ||
          item.uuid ||
          item.batch_uuid ||
          item.raw?.batch_code ||
          item.raw?.uuid ||
          null;

        const resolvedStatus =
          item.status_email ||
          item.status_kirim ||
          item.statusEmail ||
          item.statusKirim ||
          item.raw?.status_email ||
          item.raw?.status_kirim ||
          item.raw?.statusEmail ||
          item.raw?.statusKirim ||
          "";

        return {
          ...item,
          id: batchCode || item.id || item.id_batch_upload,
          batch_code: batchCode,
          batchCode,
          mahasiswa_match: Array.isArray(item.mahasiswa_match)
            ? item.mahasiswa_match
            : [],
          status_email: normalizeStatusEmail(resolvedStatus),
        };
      });

      setBatches(mappedRows);
      setPagination(
        result.pagination || {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          total_data: 0,
          total_page: 1,
        },
      );
      setFilterOptions({
        fakultas: Array.isArray(result.filter_options?.fakultas)
          ? result.filter_options.fakultas
          : [],
        tahun: Array.isArray(result.filter_options?.tahun)
          ? result.filter_options.tahun
          : [],
      });
    } catch (error) {
      console.error("Gagal mengambil dokumen valid:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil dokumen valid.",
      );
      setBatches([]);
      setPagination({
        page: 1,
        limit: ITEMS_PER_PAGE,
        total_data: 0,
        total_page: 1,
      });
      setFilterOptions({ fakultas: [], tahun: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchValidBatches();
  }, [currentPage, debouncedSearch, selectedFakultas, selectedYear, statusEmail]);

  const handlePage = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const handleGoDetail = (item) => {
    const batchCode =
      item.batch_code ||
      item.batchCode ||
      item.uuid ||
      item.batch_uuid ||
      item.raw?.batch_code ||
      item.raw?.uuid ||
      item.id;

    if (!batchCode) {
      alert("Kode batch tidak ditemukan.");
      return;
    }

    navigate(`/rektor/detail-dokumen-valid/${encodeURIComponent(batchCode)}`, {
      state: { batch: item },
    });
  };

  const renderPages = () => {
    let pages = [];
    if (totalPages <= 4)
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    else if (currentPage <= 2) pages = [1, 2, "...", totalPages];
    else if (currentPage >= totalPages - 1)
      pages = [1, "...", totalPages - 1, totalPages];
    else pages = [1, "...", currentPage, "...", totalPages];

    return pages.map((p, idx) => {
      const isActive = p === currentPage;
      const isEllipsis = p === "...";
      return (
        <button
          key={idx}
          onClick={() => !isEllipsis && handlePage(p)}
          disabled={isEllipsis}
          className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-bold transition-all
            ${isActive ? "bg-[#117065] text-white shadow-md" : "bg-[#E5E7EB] text-gray-500 hover:bg-gray-300"}
            ${isEllipsis ? "cursor-default" : "cursor-pointer"}`}
        >
          {p}
        </button>
      );
    });
  };

  const DetailIcon = () => (
    <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500" />
  );

  return (
    <DashboardLayout title="Dokumen Valid">
      <div className="w-full pb-10">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Daftar Dokumen Valid
          </h1>
          <p className="text-[#9CA3AF] text-[14px] font-medium mt-1">
            Arsip digital ijazah dan transkrip mahasiswa yang telah melewati
            proses verifikasi institusi.
          </p>
        </div>

        {/* FILTER BAR — tanpa dropdown suggestions */}
        <div className="bg-white p-4 shadow-sm border border-gray-100 rounded-xl mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="w-full lg:max-w-md">
              <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
                <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cari: Nama, NIM, Prodi..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full lg:w-72">
                <select
                  value={selectedFakultas}
                  onChange={(e) => {
                    setSelectedFakultas(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm"
                >
                  <option value="">Semua Fakultas</option>
                  {filterOptions.fakultas.map((namaFakultas) => (
                    <option key={namaFakultas} value={namaFakultas}>
                      {namaFakultas}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>

              <div className="relative w-full lg:w-44">
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm"
                >
                  <option value="">Semua Tahun</option>
                  {filterOptions.tahun.map((tahun) => (
                    <option key={tahun} value={tahun}>
                      {tahun}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>

              <div className="relative w-full lg:w-48">
                <select
                  value={statusEmail}
                  onChange={(e) => {
                    setStatusEmail(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm"
                >
                  <option value="">Semua Status</option>
                  <option value="Terkirim">Terkirim</option>
                  <option value="Belum Terkirim">Belum Terkirim</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center whitespace-nowrap">
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 text-center">List Batch</th>
                  <th className="py-4 px-6 text-center">Fakultas</th>
                  <th className="py-4 px-6 text-center">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center">Periode</th>
                  <th className="py-4 px-6 text-center">Total Data</th>
                  <th className="py-4 px-6 text-center">Status Email</th>
                  <th className="py-4 px-6 text-center w-24">Detail</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
                      Memuat data dokumen valid...
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((item, i) => (
                    <tr
                      key={item.batch_code || item.batchCode || item.raw?.batch_code || item.id || i}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 text-center font-semibold text-gray-800">
                        {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}.
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-gray-900">
                        {item.batch || item.nomor_batch_upload || "-"}
                      </td>
                      <td className="py-4 px-6 text-center font-normal text-gray-700">
                        {item.fakultas || "-"}
                      </td>
                      <td className="py-4 px-6 text-center font-normal text-gray-700">
                        {item.tahun || "-"}
                      </td>
                      <td className="py-4 px-6 text-center font-normal text-gray-700">
                        {item.periode || "-"}
                      </td>
                      <td className="py-4 px-6 text-center font-normal text-gray-700">
                        {item.total || 0}
                      </td>
                      <td className="py-4 px-6 text-center align-middle">
                        <div className="flex justify-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${getStatusBadgeClass(item.status_email)}`}
                          >
                            {item.status_email || "Belum Terkirim"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleGoDetail(item)}
                          className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition flex-shrink-0"
                          title="Lihat Detail Batch"
                        >
                          <DetailIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
                      <div className="flex flex-col items-center justify-center">
                        <FiSearch className="text-4xl mb-3 text-gray-300" />
                        <p>Data dokumen tidak ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-5 border-t border-gray-100 bg-white flex justify-between items-center">
            <p className="text-sm text-gray-400 font-medium">
              Menampilkan {currentData.length} dari {pagination.total_data || 0} data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-2 text-[18px] font-bold text-gray-400 hover:text-gray-800 disabled:opacity-30 transition-colors cursor-pointer"
              >
                &lt;
              </button>
              {renderPages()}
              <button
                onClick={() => handlePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center px-2 text-[18px] font-bold text-[#117065] hover:text-teal-900 disabled:opacity-30 transition-colors cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RektorDokumenValid;