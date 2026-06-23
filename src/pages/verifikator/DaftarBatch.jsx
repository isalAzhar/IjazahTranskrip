import React, { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiXCircle,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { useAuth } from "../../pages/context/AuthContext";
import { getPendingBatches, rejectBatch } from "@/services/api";

// Role-role yang termasuk level fakultas (filter by id_unit, backend handle)
const FAKULTAS_ROLES = ["tu_fakultas", "wakil_dekan_1", "dekan"];
// Role-role yang bisa lihat semua fakultas (level rektorat)
const REKTORAT_ROLES = ["tu_rektorat", "wakil_rektor_1", "rektor"];

const DaftarBatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || "";

  // States Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // STATE BARU UNTUK DROPDOWN DINAMIS
  const [fakultasList, setFakultasList] = useState([]);
  const [years, setYears] = useState([]);

  // Autocomplete States
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // States Pagination & API
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [realBatchData, setRealBatchData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // States Modal Reject
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showRejectSuccess, setShowRejectSuccess] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const renderFakultas = (fakultas) => {
    if (Array.isArray(fakultas)) return fakultas.join(", ") || "-";
    return fakultas || "-";
  };

  // FETCH DATA FAKULTAS DAN TAHUN SECARA DINAMIS DARI BACKEND
  useEffect(() => {
    const fetchGlobalOptions = async () => {
      try {
        const result = await getPendingBatches({ limit: 5000 });
        const rows = Array.isArray(result.data) ? result.data : [];

        // Ekstrak list Fakultas
        const allFakultas = rows.flatMap(item => 
          Array.isArray(item.fakultas) ? item.fakultas : [item.fakultas || item.raw?.fakultas]
        );
        const uniqueFakultas = [...new Set(allFakultas.filter((f) => f && f !== "-"))];
        setFakultasList(uniqueFakultas);

        // Ekstrak list Tahun dan Urutkan Descending (Terbaru ke Lama)
        const uniqueYears = [
          ...new Set(
            rows
              .map((item) => (item.tahun_lulus || item.tahun || item.raw?.tahun_lulus || item.raw?.tahun)?.toString())
              .filter((y) => y && y !== "-")
          ),
        ].sort((a, b) => Number(b) - Number(a));
        
        setYears(uniqueYears);
      } catch (error) {
        console.error("Gagal memuat opsi filter fakultas dan tahun", error);
      }
    };

    fetchGlobalOptions();
  }, []);

  // Fetch data batch pending dari backend
  const fetchBatchData = async () => {
    setIsLoading(true);
    try {
      const response = await getPendingBatches({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        fakultas: selectedFakultas,
        tahun: selectedYear,
      });

      let data = Array.isArray(response.data)
        ? response.data.map((item) => {
            const raw = item.raw || item;

            const batchCode =
              item.batch_code ||
              item.batchCode ||
              item.uuid ||
              raw.batch_code ||
              raw.uuid ||
              item.id ||
              raw.id;

            return {
              ...item,

              raw,

              id: batchCode,
              batch_code: batchCode,

              nomor_batch_upload:
                item.nomor_batch_upload || raw.nomor_batch_upload || "-",

              fakultas: item.fakultas || raw.fakultas || [],

              tahun_lulus: item.tahun_lulus || raw.tahun_lulus || "-",

              periode: item.periode || raw.periode || "-",

              pending_count:
                item.pending_count ??
                raw.pending_count ??
                item.total_mahasiswa ??
                raw.total_mahasiswa ??
                0,

              mahasiswa: item.mahasiswa || raw.mahasiswa || [],
            };
          })
        : [];

      // Filter search di frontend
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();

        data = data.filter((item) => {
          // 🔥 PERBAIKAN: Izinkan pencarian berdasarkan Nomor Batch untuk tabel
          const batchText = String(item.nomor_batch_upload || "").toLowerCase();
          
          const mahasiswaText = Array.isArray(item.mahasiswa)
            ? item.mahasiswa
                .map((mhs) =>
                  [
                    mhs.nama_mahasiswa,
                    mhs.nama,
                    mhs.nim,
                    mhs.prodi,
                    mhs.nama_prodi,
                    mhs.program_studi,
                    mhs.programStudi,
                  ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase(),
                )
                .join(" ")
            : "";

          // Tabel akan tampil jika Batch ATAU data Mahasiswa cocok
          return batchText.includes(q) || mahasiswaText.includes(q);
        });
      }

      // Filter tahun di frontend
      if (selectedYear) {
        data = data.filter(
          (item) => String(item.tahun_lulus) === String(selectedYear),
        );
      }

      // Filter fakultas di frontend
      if (selectedFakultas) {
        const selFak = selectedFakultas.toLowerCase();
        data = data.filter((item) =>
          Array.isArray(item.fakultas)
            ? item.fakultas.some((f) =>
                String(f || "")
                  .toLowerCase()
                  .includes(selFak),
              )
            : String(item.fakultas || "")
                .toLowerCase()
                .includes(selFak),
        );
      }

      setRealBatchData(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage) || 1);
    } catch (error) {
      console.error("Gagal load data batch pending:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, selectedFakultas, selectedYear]);

  // Handle Click Outside untuk menutup suggestion dropdown
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

  // Mengekstrak data mahasiswa dari batch untuk ditampilkan di dropdown suggestion
  const getSuggestions = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    let suggestions = [];

    realBatchData.forEach((batch) => {
      if (Array.isArray(batch.mahasiswa)) {
        batch.mahasiswa.forEach((mhs) => {
          const nama = String(mhs.nama_mahasiswa || mhs.nama || "").toLowerCase();
          const nim = String(mhs.nim || "").toLowerCase();
          const prodi = String(
            mhs.program_studi ||
              mhs.programStudi ||
              mhs.prodi ||
              mhs.nama_prodi ||
              "",
          ).toLowerCase();

          // 🔥 KUNCI PENTING: Dropdown HANYA merespons Nama, NIM, Prodi
          if (nama.includes(q) || nim.includes(q) || prodi.includes(q)) {
            suggestions.push({
              id: mhs.nim || Math.random().toString(),
              nama: mhs.nama_mahasiswa || mhs.nama || "-",
              nim: mhs.nim || "-",
              prodi:
                mhs.program_studi ||
                mhs.programStudi ||
                mhs.prodi ||
                mhs.nama_prodi ||
                "Program Studi",
              fakultas: mhs.fakultas || renderFakultas(batch.fakultas),
              batchName: batch.nomor_batch_upload || "-",
              batchData: batch,
              mahasiswaData: mhs,
            });
          }
        });
      }
    });

    return suggestions.filter(
      (v, i, a) => a.findIndex((t) => t.nim === v.nim) === i,
    );
  };

  const currentSuggestions = getSuggestions();

  const handleNavigateDetail = (item) => {
    const batchCode =
      item.batch_code ||
      item.batchCode ||
      item.uuid ||
      item.raw?.batch_code ||
      item.raw?.uuid ||
      item.id;

    if (!batchCode) {
      console.error("Batch code tidak ditemukan:", item);
      return;
    }

    const route =
      userRole === "rektor"
        ? `/rektor/detail-batch/${encodeURIComponent(batchCode)}`
        : `/verifikator/detail-batch/${encodeURIComponent(batchCode)}`;

    navigate(route, {
      state: {
        batch: item,
      },
    });
  };

  // Handler Modal Reject
  const handleOpenReject = (batch) => {
    setSelectedBatch(batch);
    setRejectReason("");
    setShowRejectReason(true);
  };

  const handleSubmitReason = () => {
    setShowRejectReason(false);
    setShowRejectConfirm(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedBatch) return;
    setIsRejecting(true);
    try {
      const batchCode =
        selectedBatch.batch_code ||
        selectedBatch.batchCode ||
        selectedBatch.uuid ||
        selectedBatch.raw?.batch_code ||
        selectedBatch.raw?.uuid ||
        selectedBatch.id;

      if (!batchCode) {
        throw new Error("Kode batch tidak ditemukan.");
      }

      await rejectBatch(batchCode, rejectReason);
      setShowRejectConfirm(false);
      setShowRejectSuccess(true);
    } catch (error) {
      console.error("Gagal reject batch:", error);
      alert(error.message || "Gagal melakukan reject batch.");
      setShowRejectConfirm(false);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleFinishReject = () => {
    setShowRejectSuccess(false);
    setSelectedBatch(null);
    fetchBatchData(); // refresh tabel
  };

  const DetailIcon = () => (
    <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
  );

  return (
    <DashboardLayout title="Daftar Batch">
      <div className="w-full pb-10">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Daftar Batch
          </h1>
          <p className="text-[#9CA3AF] text-[14px] font-medium mt-1">
            Kelola validasi dan kirim data mahasiswa ke tahap berikutnya
          </p>
        </div>

        {/* BAGIAN FILTER & SEARCH */}
        <div className="mb-6" ref={searchContainerRef}>
          <div className="bg-white p-4 shadow-sm border border-gray-100 rounded-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
             {/* Search */}
            <div className="w-full lg:max-w-md">
              <div className="flex items-center bg-white border border-gray-300 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
                <FiSearch className="text-gray-400 text-lg mr-3" />
                <input
                  type="text"
                  placeholder="Cari: Nama, NIM, Prodi..." // 🔥 Teks "Batch," telah dihapus dari placeholder
                  value={searchQuery}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                    setShowSuggestions(true);
                  }}
                  className="bg-transparent outline-none text-sm w-full text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                {REKTORAT_ROLES.includes(userRole) && (
                  <div className="relative w-full lg:w-80">
                    <select
                      value={selectedFakultas}
                      onChange={(e) => {
                        setSelectedFakultas(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="appearance-none bg-white border border-gray-300 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm text-gray-800 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm"
                    >
                      <option value="">Semua Fakultas</option>
                      {/* 🔥 Render Fakultas Dinamis dari Backend */}
                      {fakultasList.map((f, i) => (
                        <option key={i} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
                  </div>
                )}

                {/* Filter Tahun */}
                <div className="relative w-full lg:w-44">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white border border-gray-300 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm text-gray-800 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm"
                  >
                    <option value="">Semua Tahun</option>
                    {/* 🔥 Render Tahun Dinamis dari Backend */}
                    {years.map((y, i) => (
                      <option key={i} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* AUTOCOMPLETE SUGGESTION LIST */}
          {showSuggestions &&
            searchQuery.trim() &&
            currentSuggestions.length > 0 && (
              <div className="mt-4 w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-h-[400px] overflow-y-auto">
                {currentSuggestions.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setShowSuggestions(false);

                      const mahasiswaCode =
                        item.mahasiswaData?.mahasiswa_code ||
                        item.mahasiswaData?.mahasiswaCode ||
                        item.mahasiswaData?.uuid ||
                        item.mahasiswaData?.mahasiswa_uuid ||
                        item.mahasiswaData?.raw?.mahasiswa_code ||
                        item.mahasiswaData?.raw?.uuid;

                      if (!mahasiswaCode) {
                        console.error("Mahasiswa code tidak ditemukan:", item);
                        alert("Kode mahasiswa tidak ditemukan.");
                        return;
                      }

                      const safeMahasiswaCode =
                        encodeURIComponent(mahasiswaCode);

                      if (userRole === "rektor") {
                        navigate(
                          `/rektor/detail-mahasiswa/${safeMahasiswaCode}`,
                          {
                            state: {
                              mahasiswa: item.mahasiswaData,
                              batch: item.batchData,
                            },
                          },
                        );
                      } else if (
                        userRole === "operator" ||
                        userRole === "operator_data"
                      ) {
                        navigate(
                          `/operator/detail-mahasiswa/${safeMahasiswaCode}`,
                          {
                            state: {
                              mahasiswa: item.mahasiswaData,
                              batch: item.batchData,
                            },
                          },
                        );
                      } else {
                        navigate(
                          `/verifikator/detail-mahasiswa/${safeMahasiswaCode}`,
                          {
                            state: {
                              mahasiswa: item.mahasiswaData,
                              batch: item.batchData,
                            },
                          },
                        );
                      }
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

        {/* TABEL BATCH */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 text-center w-[220px]">List Batch</th>
                  <th className="py-4 px-6 text-center">Fakultas</th>
                  <th className="py-4 px-6 text-center">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center">Periode</th>
                  <th className="py-4 px-6 text-center">Total Data</th>
                  <th className="py-4 px-6 text-center w-20">Detail</th>
                  <th className="py-4 px-6 text-center w-20">Reject</th>
                </tr>
              </thead>
              <tbody
                className={`${isLoading ? "opacity-50" : ""} transition-opacity duration-200`}
              >
                {realBatchData.map((item, i) => (
                  <tr
                    key={
                      item.batch_code ||
                      item.batchCode ||
                      item.uuid ||
                      item.raw?.batch_code ||
                      item.raw?.uuid ||
                      item.id ||
                      item.nomor_batch_upload ||
                      i
                    }
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-center font-bold text-gray-800">
                      {(currentPage - 1) * itemsPerPage + i + 1}.
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      {item.nomor_batch_upload}
                    </td>
                    <td className="py-4 px-6 text-center font-normal text-gray-800">
                      {renderFakultas(item.fakultas)}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-gray-700">
                      {item.tahun_lulus}
                    </td>

                    <td className="py-4 px-6 text-center font-semibold text-gray-700 capitalize">
                      {item.periode ? item.periode.replace(/_/g, " ") : "-"}
                    </td>

                    <td className="py-4 px-6 text-center font-semibold text-gray-700">
                      {item.pending_count}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleNavigateDetail(item)}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition flex-shrink-0"
                      >
                        <DetailIcon />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleOpenReject(item)}
                        className="inline-flex items-center justify-center p-1.5 w-8 h-8 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 border border-transparent hover:border-red-200 transition-colors"
                        title="Reject Batch"
                      >
                        <FiXCircle size={22} />
                      </button>
                    </td>
                  </tr>
                ))}

                {realBatchData.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-12 text-center text-gray-400 font-medium"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <FiSearch className="text-4xl mb-3 text-gray-300" />
                        <p>Data batch tidak ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center px-6 py-5 gap-2 border-t border-gray-100 bg-white">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-2 text-[18px] font-bold text-gray-400 hover:text-gray-800 disabled:opacity-30 transition-colors cursor-pointer"
              >
                &lt;
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold shadow-sm transition-colors ${currentPage === 1 ? "bg-[#117065] text-white" : "bg-[#E5E7EB] text-gray-500 hover:bg-gray-300"}`}
              >
                1
              </button>
              {totalPages >= 2 && (
                <button
                  onClick={() => setCurrentPage(2)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold shadow-sm transition-colors ${currentPage === 2 ? "bg-[#117065] text-white" : "bg-[#E5E7EB] text-gray-500 hover:bg-gray-300"}`}
                >
                  2
                </button>
              )}
              {totalPages > 3 && (
                <span className="w-8 h-8 flex items-center justify-center rounded bg-[#E5E7EB] text-gray-400 text-sm font-bold">
                  ...
                </span>
              )}
              {totalPages > 2 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold shadow-sm transition-colors ${currentPage === totalPages ? "bg-[#117065] text-white" : "bg-[#E5E7EB] text-gray-500 hover:bg-gray-300"}`}
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center justify-center px-2 text-[18px] font-bold text-gray-400 hover:text-gray-800 disabled:opacity-30 transition-colors cursor-pointer"
              >
                &gt;
              </button>
            </div>
          )}
        </div>

        {/* MODAL 1: ALASAN REJECT */}
        {showRejectReason && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Alasan Reject
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Batch:{" "}
                <span className="font-semibold text-gray-600">
                  {selectedBatch?.nomor_batch_upload}
                </span>
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Tuliskan alasan reject batch ini..."
                className="w-full bg-[#F3F4F6] border border-transparent focus:border-red-500 focus:bg-white rounded-xl p-4 text-sm font-medium outline-none resize-none h-32 transition-colors placeholder-gray-400"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowRejectReason(false)}
                  className="px-6 py-2.5 rounded-lg font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitReason}
                  disabled={!rejectReason.trim()}
                  className="px-6 py-2.5 rounded-lg font-bold text-white bg-[#117065] hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 MODAL 2: KONFIRMASI REJECT (DENGAN SPINNER LOADING) */}
        {showRejectConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="text-red-500 text-3xl" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Apakah Anda yakin ingin melakukan reject?
              </h2>
              <div className="flex justify-center gap-3 mt-8">
                <button
                  onClick={() => setShowRejectConfirm(false)}
                  disabled={isRejecting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={isRejecting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-75 disabled:cursor-wait"
                >
                  {isRejecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Reject</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: REJECT BERHASIL */}
        {showRejectSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-8 text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-sm">
                <FiCheckCircle className="text-[#117065] text-5xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Reject Berhasil
              </h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
                Data telah berhasil ditolak dan status telah diperbarui
              </p>
              <button
                onClick={handleFinishReject}
                className="w-full px-4 py-3 rounded-xl font-bold text-white bg-[#117065] hover:bg-teal-800 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DaftarBatch;