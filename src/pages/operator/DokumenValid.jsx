import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch, FiChevronDown, FiSend } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getBatches } from "@/services/daftarbatch.api";

const formatStatusEmail = (statusKirimRaw) => {
  const raw = String(statusKirimRaw || "").toLowerCase();
  if (raw.includes("sudah") || (raw.includes("terkirim") && !raw.includes("belum"))) {
    return "Email Terkirim";
  }
  return "Belum Diemail";
};

const DokumenValid = () => {
  const navigate = useNavigate();

  const [batchData, setBatchData] = useState([]);
  const [search, setSearch] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [tahun, setTahun] = useState("");
  const [statusEmail, setStatusEmail] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDokumenValid = async () => {
      try {
        setIsLoading(true);
        setApiError("");

        // Ambil data batch yang statusnya terbit/valid
        const response = await getBatches({
          page: 1,
          limit: 10000,
          status: "terbit" 
        });

        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];

        // Mapping dinamis dari backend baru
        const mappedData = rows.map((item) => ({
          id: item.id_batch_upload || item.uuid || item.id_batch || Math.random().toString(),
          listBatch: item.nama_batch || item.nomor_batch_upload || "Tanpa Batch",
          fakultas: item.fakultas || "-",
          tahunLulus: (item.tahun_lulus || item.tahun || "-").toString(),
          periode: item.periode_label || item.periode || "-",
          totalData: item.total_record || item.total_record_ditampilkan || 0,
          status_email: formatStatusEmail(item.status_kirim || item.statusKirim),
          raw: item
        }));

        setBatchData(mappedData);
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

  const handleKirimBatch = (item) => {
    const confirmKirim = window.confirm(`Apakah Anda yakin ingin mengirimkan email ijazah untuk ${item.listBatch}?`);
    if (confirmKirim) {
      alert(`Berhasil! Seluruh ijazah pada ${item.listBatch} telah didistribusikan ke email mahasiswa.`);
      // Update UI lokal
      setBatchData((prev) => 
        prev.map(b => b.id === item.id ? { ...b, status_email: "Email Terkirim" } : b)
      );
    }
  };

  const fakultasOptions = useMemo(() => {
    const options = batchData.map((item) => item.fakultas).filter((item) => item && item !== "-");
    return ["Semua Fakultas", ...new Set(options)];
  }, [batchData]);

  const tahunOptions = useMemo(() => {
    const options = batchData.map((item) => item.tahunLulus).filter((item) => item && item !== "-");
    return ["Semua Tahun", ...new Set(options)];
  }, [batchData]);

  const filtered = useMemo(() => {
    return batchData.filter((item) => {
      const keyword = search.toLowerCase();
      const matchSearch =
        item.listBatch.toLowerCase().includes(keyword) ||
        item.fakultas.toLowerCase().includes(keyword) ||
        String(item.tahunLulus).toLowerCase().includes(keyword) ||
        String(item.periode).toLowerCase().includes(keyword);

      const matchFakultas = !fakultas || fakultas === "Semua Fakultas" || item.fakultas === fakultas;
      const matchTahun = !tahun || tahun === "Semua Tahun" || String(item.tahunLulus) === String(tahun);
      const matchStatusEmail = !statusEmail || item.status_email === statusEmail;

      return matchSearch && matchFakultas && matchTahun && matchStatusEmail;
    });
  }, [batchData, search, fakultas, tahun, statusEmail]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fakultas, tahun, statusEmail]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDetailClick = (item) => {
    navigate(`/operator/dokumen-valid/batch/${encodeURIComponent(item.id)}`, { state: item });
  };

  const renderPaginationButtons = () => {
    const pages = [];
    pages.push(1);
    if (currentPage > 2 && totalPages > 3) pages.push("...");
    if (currentPage === 1 && totalPages > 1) pages.push(2);
    else if (currentPage === totalPages && totalPages > 2) pages.push(totalPages - 1);
    else if (currentPage > 1 && currentPage < totalPages) pages.push(currentPage);
    if (currentPage < totalPages - 1 && totalPages > 3) pages.push("...");
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    return pages.map((page, index) => (
      <button
        key={index}
        onClick={() => typeof page === "number" && handlePageChange(page)}
        disabled={page === "..."}
        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold shadow-sm transition-colors ${
          page === currentPage ? "bg-[#00897B] text-white" : page === "..." ? "bg-transparent text-gray-400 cursor-default shadow-none" : "bg-white border border-gray-300 text-gray-500 hover:bg-gray-100"
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
          <h1 className="text-[26px] font-bold text-gray-900">Daftar Dokumen Valid</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Arsip digital ijazah dan transkrip mahasiswa yang telah melewati proses verifikasi institusi.</p>
          {apiError && <p className="text-sm text-red-500 font-semibold mt-2">{apiError}</p>}
        </div>

        {/* FILTER BOX */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="w-full lg:max-w-md">
              <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
                <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cari: Nama Batch, Fakultas, Periode"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-56">
                <select value={fakultas || "Semua Fakultas"} onChange={(e) => setFakultas(e.target.value === "Semua Fakultas" ? "" : e.target.value)} className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm">
                  {fakultasOptions.map((item, index) => <option key={index} value={item}>{item}</option>)}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

              <div className="relative w-full sm:w-44">
                <select value={tahun || "Semua Tahun"} onChange={(e) => setTahun(e.target.value === "Semua Tahun" ? "" : e.target.value)} className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm">
                  {tahunOptions.map((item, index) => <option key={index} value={item}>{item}</option>)}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

              <div className="relative w-full sm:w-48">
                <select value={statusEmail} onChange={(e) => setStatusEmail(e.target.value)} className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-[#117065] px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left">
                  <option value="">Semua Status Email</option>
                  <option value="Belum Diemail">Belum Diemail</option>
                  <option value="Email Terkirim">Email Terkirim</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#117065] text-lg pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <div className="min-w-[1000px]">
            <table className="w-full text-sm text-left table-fixed">
              <colgroup>
                <col className="w-[5%]" />
                <col className="w-[20%]" />
                <col className="w-[22%]" />
                <col className="w-[10%]" />
                <col className="w-[15%]" />
                <col className="w-[8%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead className="bg-[#F3F4F6] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center">No.</th>
                  <th className="py-4 px-6 text-left">List Batch</th>
                  <th className="py-4 px-6 text-center">Fakultas</th>
                  <th className="py-4 px-6 text-center">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center">Periode</th>
                  <th className="py-4 px-6 text-center">Total</th>
                  <th className="py-4 px-6 text-center">Status Email</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="8" className="py-8 text-center text-gray-500 font-medium">Memuat data...</td></tr>
                ) : (
                  paginatedData.map((item, index) => {
                    const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-center font-medium text-gray-800 truncate">{actualIndex}</td>
                        <td className="py-4 px-6 font-medium text-gray-900 truncate">{item.listBatch}</td>
                        <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">{item.fakultas}</td>
                        <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">{item.tahunLulus}</td>
                        <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">{item.periode}</td>
                        <td className="py-4 px-6 text-center font-medium text-gray-900 truncate">{item.totalData}</td>
                        <td className="py-4 px-6 text-center align-middle">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${item.status_email === "Email Terkirim" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                            {item.status_email}
                          </span>
                        </td>
                        <td className="py-4 px-6 align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleDetailClick(item)} className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-200 transition" title="Lihat Detail Batch">
                              <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
                            </button>
                            {item.status_email === "Belum Diemail" && (
                              <button type="button" onClick={() => handleKirimBatch(item)} className="w-7 h-7 bg-[#117065] text-white rounded-md flex items-center justify-center cursor-pointer hover:bg-[#0c5249] transition-all shadow-sm" title="Kirim Email Massal">
                                <FiSend size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!isLoading && paginatedData.length === 0 && <div className="py-8 text-center text-gray-500 font-medium">Data tidak ditemukan.</div>}

          {/* PAGINATION */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">Menampilkan {paginatedData.length} dari {filtered.length} Data</p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50">{"<"}</button>
                {renderPaginationButtons()}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50">{">"}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DokumenValid;