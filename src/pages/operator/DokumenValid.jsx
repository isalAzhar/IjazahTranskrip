import React, { useState, useRef, useEffect } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiSend,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import {
  getValidDocumentBatches,
  sendBatchDocumentEmail,
} from "../../services/document.api";

const ITEMS_PER_PAGE = 10;

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

const OperatorDokumenValid = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [statusEmail, setStatusEmail] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filterBarRef = useRef(null);

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
  const [emailModal, setEmailModal] = useState({
    show: false,
    type: "",
    data: null,
    message: "",
  });

  const totalPages = pagination.total_page || 1;
  const currentData = batches;

  // 🔥 PERBAIKAN TRACKING JALUR DATA MAHASISWA (SAMA SEPERTI REKTOR)
  const searchSuggestions = (() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    let suggestions = [];

    batches.forEach((batch) => {
      const mhsList =
        Array.isArray(batch.mahasiswa_match) && batch.mahasiswa_match.length > 0
          ? batch.mahasiswa_match
          : Array.isArray(batch.mahasiswa)
            ? batch.mahasiswa
            : [];

      mhsList.forEach((mhs) => {
        const nama = String(mhs.nama_mahasiswa || mhs.nama || "").toLowerCase();
        const nim = String(mhs.nim || "").toLowerCase();
        const prodi = String(
          mhs.program_studi ||
            mhs.programStudi ||
            mhs.prodi ||
            mhs.nama_prodi ||
            "",
        ).toLowerCase();

        if (nama.includes(q) || nim.includes(q) || prodi.includes(q)) {
          // Ambil kode identitas mahasiswa se-aman mungkin
          const code =
            mhs.mahasiswa_code ||
            mhs.mahasiswaCode ||
            mhs.uuid ||
            mhs.mahasiswa_uuid ||
            mhs.raw?.mahasiswa_code ||
            mhs.raw?.uuid ||
            null;

          suggestions.push({
            id: mhs.nim || Math.random().toString(),
            mahasiswa_code: code, // Di-inject langsung di luar agar gampang diakses onClick
            nama: mhs.nama_mahasiswa || mhs.nama || "-",
            nim: mhs.nim || "-",
            prodi:
              mhs.program_studi ||
              mhs.programStudi ||
              mhs.prodi ||
              mhs.nama_prodi ||
              "Program Studi",
            fakultas: mhs.fakultas || batch.fakultas || "-",
            batchName: batch.nomor_batch_upload || batch.batch || "-",
            batchData: batch,
            mahasiswaData: mhs,
          });
        }
      });
    });

    return suggestions.filter(
      (v, i, a) => a.findIndex((t) => t.nim === v.nim) === i,
    );
  })();

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
        return {
          ...item,
          id: batchCode || item.id || item.id_batch_upload,
          batch_code: batchCode,
          batchCode,
          mahasiswa_match: Array.isArray(item.mahasiswa_match)
            ? item.mahasiswa_match
            : [],
          status_email: formatStatusEmail(
            item.status_kirim ||
              item.statusKirim ||
              item.status_email ||
              item.raw?.status_kirim ||
              item.raw?.statusKirim,
          ),
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
    fetchValidBatches();
  }, [
    currentPage,
    debouncedSearch,
    selectedFakultas,
    selectedYear,
    statusEmail,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusEmail]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    navigate(
      `/operator/detail-dokumen-valid/${encodeURIComponent(batchCode)}`,
      { state: { batch: item } },
    );
  };

  const handleKirimBatch = (item) => {
    setEmailModal({ show: true, type: "confirm", data: item, message: "" });
  };

  const confirmKirimEmail = async () => {
    const item = emailModal.data;
    const batchCode =
      item.batch_code ||
      item.batchCode ||
      item.uuid ||
      item.batch_uuid ||
      item.raw?.batch_code ||
      item.raw?.uuid ||
      item.id;
    if (!batchCode) return;

    setEmailModal({ show: true, type: "loading", data: item, message: "" });

    try {
      const result = await sendBatchDocumentEmail(batchCode);
      const data = result.data || {};

      setBatches((prev) =>
        prev.map((batch) => {
          const currentBatchCode =
            batch.batch_code ||
            batch.batchCode ||
            batch.uuid ||
            batch.batch_uuid ||
            batch.raw?.batch_code ||
            batch.raw?.uuid ||
            batch.id;
          return currentBatchCode === batchCode
            ? { ...batch, status_email: "Terkirim" }
            : batch;
        }),
      );

      setEmailModal({
        show: true,
        type: "success",
        data: item,
        message: `Berhasil terkirim: ${data.berhasil || 0} Mahasiswa\nGagal terkirim: ${data.gagal || 0} Mahasiswa`,
      });
      fetchValidBatches();
    } catch (error) {
      console.error("Gagal mengirim email batch:", error);
      setEmailModal({
        show: true,
        type: "error",
        data: item,
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengirim email batch.",
      });
    }
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

        {/* FILTER BAR */}
        <div ref={filterBarRef} className="relative z-20 mb-6">
          <div
            className={`bg-white p-4 shadow-sm border border-gray-100 ${showSuggestions && searchSuggestions.length > 0 ? "rounded-t-xl" : "rounded-xl"}`}
          >
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
                      setShowSuggestions(true);
                      setCurrentPage(1);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full lg:w-80">
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

          {showSuggestions && searchSuggestions.length > 0 && (
            <div
              className="absolute left-0 right-0 top-full bg-white border-x border-b border-gray-100 shadow-lg rounded-b-xl overflow-y-auto"
              style={{ maxHeight: "260px", marginTop: "-1px" }}
            >
              {searchSuggestions.map((student, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setShowSuggestions(false);
                    setSearch("");

                    const mahasiswaCode = student.mahasiswa_code;

                    if (!mahasiswaCode) {
                      console.error("Kode mahasiswa tidak ditemukan:", student);
                      alert(
                        "Kode mahasiswa tidak ditemukan pada data pencarian ini.",
                      );
                      return;
                    }

                    navigate(
                      `/operator/detail-pelaporan/${encodeURIComponent(mahasiswaCode)}`,
                      {
                        state: {
                          mahasiswa: student.mahasiswaData,
                          batch: student.batchData,
                          source: "dokumen_valid_search",
                        },
                      },
                    );
                  }}
                  className="px-6 py-4 border-b border-gray-50 hover:bg-teal-50 cursor-pointer flex justify-between items-center transition-colors last:border-b-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="font-bold text-[#1F2937] text-[14px] mb-0.5">
                      {student.nama}
                    </div>
                    <div className="text-[12px] font-normal text-gray-500">
                      {student.nim} • {student.prodi}
                    </div>
                    <div className="text-[12px] font-normal text-gray-400">
                      {student.fakultas}
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold bg-[#F3F4F6] text-gray-500 px-3 py-1.5 rounded-md h-fit whitespace-nowrap ml-4">
                    {student.batchName}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  <th className="py-4 px-6 text-center w-28">Detail / Kirim</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-12 text-center text-gray-400 font-medium"
                    >
                      Memuat data dokumen valid...
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((item, i) => {
                    const isTerkirim = item.status_email === "Terkirim";
                    return (
                      <tr
                        key={
                          item.batch_code ||
                          item.batchCode ||
                          item.raw?.batch_code ||
                          item.id ||
                          i
                        }
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
                            {/* 🔥 WHITESPACE NOWRAP AGAR TIDAK TURUN BARIS */}
                            <span
                              className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-bold ${
                                isTerkirim
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {item.status_email || "Belum Terkirim"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleGoDetail(item)}
                              className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-200 transition flex-shrink-0"
                              title="Lihat Detail Batch"
                            >
                              <DetailIcon />
                            </button>
                            {/* 🔥 TOMBOL KIRIM EMAIL (DISABLED JIKA SUDAH TERKIRIM) */}
                            <button
                              type="button"
                              onClick={() =>
                                !isTerkirim && handleKirimBatch(item)
                              }
                              disabled={isTerkirim}
                              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all shadow-sm ${
                                isTerkirim
                                  ? "bg-gray-300 text-gray-100 cursor-not-allowed"
                                  : "bg-[#117065] text-white hover:bg-[#0c5249] cursor-pointer"
                              }`}
                              title={
                                isTerkirim
                                  ? "Email Sudah Terkirim"
                                  : "Kirim Email"
                              }
                            >
                              <FiSend size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-12 text-center text-gray-400 font-medium"
                    >
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
              Menampilkan {currentData.length} dari {pagination.total_data || 0}{" "}
              data
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

      {/* EMAIL MODAL */}
      {emailModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-sm mx-4">
            {emailModal.type === "confirm" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                    <FiSend className="text-[#117065]" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-[16px]">
                      Kirim Email
                    </h3>
                    <p className="text-gray-500 text-[13px]">
                      Konfirmasi pengiriman
                    </p>
                  </div>
                </div>
                <p className="text-[13px] text-gray-700 mb-6 leading-relaxed">
                  Apakah Anda yakin ingin mengirimkan email dokumen untuk{" "}
                  <span className="font-bold text-gray-900">
                    {emailModal.data?.batch ||
                      emailModal.data?.nomor_batch_upload ||
                      "batch ini"}
                  </span>
                  ? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setEmailModal({
                        show: false,
                        type: "",
                        data: null,
                        message: "",
                      })
                    }
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmKirimEmail}
                    className="flex-1 py-2.5 rounded-xl bg-[#117065] text-white font-bold text-sm hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
                  >
                    Ya, Kirim
                  </button>
                </div>
              </>
            )}
            {emailModal.type === "loading" && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#117065] mb-4"></div>
                <h3 className="font-bold text-gray-900 text-[16px] mb-1">
                  Mengirim Email...
                </h3>
                <p className="text-gray-500 text-[13px]">
                  Mohon tunggu sebentar, proses ini memakan waktu dan jangan
                  tutup halaman ini.
                </p>
              </div>
            )}
            {emailModal.type === "success" && (
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="text-green-500" size={28} />
                </div>
                <h3 className="font-bold text-gray-900 text-[17px] mb-2">
                  Proses Selesai
                </h3>
                <p className="text-gray-500 text-[13px] mb-6 whitespace-pre-line leading-relaxed">
                  {emailModal.message}
                </p>
                <button
                  onClick={() =>
                    setEmailModal({
                      show: false,
                      type: "",
                      data: null,
                      message: "",
                    })
                  }
                  className="w-full py-2.5 rounded-xl bg-[#117065] text-white font-bold text-sm hover:bg-teal-800 transition-colors"
                >
                  Tutup
                </button>
              </div>
            )}
            {emailModal.type === "error" && (
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <FiAlertTriangle className="text-red-500" size={28} />
                </div>
                <h3 className="font-bold text-gray-900 text-[17px] mb-2">
                  Pengiriman Gagal
                </h3>
                <p className="text-gray-500 text-[13px] mb-6 whitespace-pre-line leading-relaxed">
                  {emailModal.message}
                </p>
                <button
                  onClick={() =>
                    setEmailModal({
                      show: false,
                      type: "",
                      data: null,
                      message: "",
                    })
                  }
                  className="w-full py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                >
                  Kembali
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OperatorDokumenValid;
