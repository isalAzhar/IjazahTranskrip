import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch, FiChevronDown, FiFileText, FiCheckCircle, FiXCircle, FiClock, FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const DetailBatchDokumenValid = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { batchId } = useParams();

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Ambil data batch dari halaman sebelumnya
  const batchData = location.state || {
    listBatch: `Batch ${batchId || "1"}`,
    fakultas: "Fakultas Teknik dan Sains",
    tahunLulus: "2026",
    periode: "Semester Ganjil",
  };

  const statusOptions = [
    "Semua Status",
    "Sudah Valid",
    "Belum Valid",
    "Proses Verifikasi",
    "Perbaikan",
  ];

  // Data dokumen yang akan divalidasi
  const dokumenList = useMemo(() => {
    const dokumen = [
      { id: 1, nama: "Ijazah", keterangan: "Dokumen ijazah asli", required: true },
      { id: 2, nama: "Transkrip Nilai", keterangan: "Transkrip nilai akademik", required: true },
      { id: 3, nama: "Surat Keterangan Lulus", keterangan: "Surat keterangan telah menyelesaikan studi", required: true },
      { id: 4, nama: "Foto Ijazah", keterangan: "Scan ijazah berwarna", required: true },
      { id: 5, nama: "KTP", keterangan: "Kartu Tanda Penduduk", required: true },
      { id: 6, nama: "KK", keterangan: "Kartu Keluarga", required: false },
      { id: 7, nama: "Akta Kelahiran", keterangan: "Akta kelahiran", required: false },
      { id: 8, nama: "Sertifikat Akreditasi Prodi", keterangan: "Sertifikat akreditasi program studi", required: true },
      { id: 9, nama: "Surat Pernyataan", keterangan: "Surat pernyataan kebenaran data", required: true },
      { id: 10, nama: "Pas Foto", keterangan: "Pas foto terbaru 3x4", required: true },
    ];

    // Generate status random untuk demo
    return dokumen.map((doc, i) => {
      const statusRandom = Math.random();
      let status = "";
      let statusColor = "";
      
      if (statusRandom < 0.3) {
        status = "Sudah Valid";
        statusColor = "bg-[#27AE60]";
      } else if (statusRandom < 0.5) {
        status = "Belum Valid";
        statusColor = "bg-[#EF4444]";
      } else if (statusRandom < 0.75) {
        status = "Proses Verifikasi";
        statusColor = "bg-[#3B82F6]";
      } else {
        status = "Perbaikan";
        statusColor = "bg-[#F59E0B]";
      }

      return {
        ...doc,
        status,
        statusColor,
        tanggalUpload: `2026-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        verifikator: ["Rektor", "Wakil Rektor", "Dekan", "Wakil Dekan", "TU"][Math.floor(Math.random() * 5)],
      };
    });
  }, []);

  // Data mahasiswa dalam batch
  const mahasiswaList = useMemo(() => {
    const names = [
      "Adi Saputra", "Rani Maharani", "Budi Pratama", "Siti Aisyah",
      "Dimas Nugraha", "Fajar Ramadhan", "Putri Lestari", "Andi Wijaya",
      "Rizky Maulana", "Nabila Putri", "Yoga Pratama", "Citra Dewi",
      "Kayla Keyla", "Rizky Gusti A", "Risma Puspita", "Budi Doremi",
      "Eagle Al-Haikal", "Zahra Nabil", "Dila Fadilla", "Nayla Nim",
    ];

    const prodiList = {
      "Fakultas Teknik dan Sains": ["Teknik Informatika", "Teknik Mesin", "Teknik Sipil", "Sistem Informasi", "Teknik Elektro"],
      "Fakultas Ekonomi dan Bisnis": ["Manajemen", "Akuntansi", "Bisnis Digital"],
      "Fakultas Hukum": ["Ilmu Hukum"],
      "Fakultas Agama Islam": ["Pendidikan Agama Islam", "Ekonomi Syariah"],
      "Fakultas Ilmu Kesehatan": ["Kesehatan Masyarakat", "Ilmu Gizi"],
      "Fakultas Keguruan dan Ilmu Pendidikan": ["Pendidikan Bahasa Inggris", "Teknologi Pendidikan"],
    };

    const availableProdi = prodiList[batchData.fakultas] || ["Teknik Informatika"];

    return Array.from({ length: batchData.totalData || 25 }, (_, i) => ({
      id: i + 1,
      nim: `23110604${String(i + 1).padStart(4, "0")}`,
      nama: names[i % names.length],
      prodi: availableProdi[i % availableProdi.length],
      statusVerifikasi: ["Sudah Valid", "Belum Valid", "Proses Verifikasi", "Perbaikan"][i % 4],
    }));
  }, [batchData.fakultas, batchData.totalData]);

  // Filter data dokumen berdasarkan search dan status
  const filteredDokumen = dokumenList.filter((item) => {
    const keyword = search.toLowerCase();
    const matchesSearch = item.nama.toLowerCase().includes(keyword) ||
                          item.keterangan.toLowerCase().includes(keyword);
    const matchesStatus = selectedStatus === "Semua Status" || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDokumen.length / itemsPerPage);
  const paginatedData = filteredDokumen.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Sudah Valid":
        return <FiCheckCircle className="text-white" size={14} />;
      case "Belum Valid":
        return <FiXCircle className="text-white" size={14} />;
      case "Proses Verifikasi":
        return <FiClock className="text-white" size={14} />;
      case "Perbaikan":
        return <FiRefreshCw className="text-white" size={14} />;
      default:
        return null;
    }
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    
    let pages = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 2) {
      pages = [1, 2, "...", totalPages];
    } else if (currentPage >= totalPages - 1) {
      pages = [1, "...", totalPages - 1, totalPages];
    } else {
      pages = [1, "...", currentPage, "...", totalPages];
    }

    return pages.map((page, index) => {
      const isActive = currentPage === page;
      const isEllipsis = page === "...";

      return (
        <button
          key={index}
          type="button"
          onClick={() => !isEllipsis && handlePageChange(page)}
          disabled={isEllipsis}
          className={`w-[46px] h-[46px] flex items-center justify-center rounded-[12px] font-bold text-[18px] transition-all ${
            isActive
              ? "bg-[#115E59] text-white shadow-sm"
              : "bg-[#CBD5E1] text-white hover:bg-[#b0bcc9]"
          } ${isEllipsis ? "cursor-default hover:bg-[#CBD5E1]" : ""}`}
        >
          {page}
        </button>
      );
    });
  };

  const handleDetailMahasiswa = (mhs) => {
    navigate(`/operator/detail-dokumen-valid/${mhs.nim}`, { state: mhs });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <DashboardLayout title="Detail Validasi Dokumen">
      <div className="w-full">
        {/* Tombol Kembali */}
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-[#0B6B63] mb-4 transition-colors"
        >
          <FiArrowLeft size={18} />
          <span className="text-sm font-medium">Kembali</span>
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900">
            Detail Validasi Dokumen
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            {batchData.listBatch} • {batchData.fakultas} • {batchData.periode} • {batchData.tahunLulus}
          </p>
        </div>

        {/* INFO BATCH CARD */}
        <div className="bg-gradient-to-r from-[#115E59] to-[#0B4B48] rounded-xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[#A7F3D0] text-[11px] font-medium">Total Mahasiswa</p>
              <p className="text-white text-[22px] font-bold">{mahasiswaList.length}</p>
            </div>
            <div>
              <p className="text-[#A7F3D0] text-[11px] font-medium">Sudah Valid</p>
              <p className="text-white text-[22px] font-bold">
                {mahasiswaList.filter(m => m.statusVerifikasi === "Sudah Valid").length}
              </p>
            </div>
            <div>
              <p className="text-[#A7F3D0] text-[11px] font-medium">Belum Valid</p>
              <p className="text-white text-[22px] font-bold">
                {mahasiswaList.filter(m => m.statusVerifikasi === "Belum Valid").length}
              </p>
            </div>
            <div>
              <p className="text-[#A7F3D0] text-[11px] font-medium">Proses / Perbaikan</p>
              <p className="text-white text-[22px] font-bold">
                {mahasiswaList.filter(m => m.statusVerifikasi === "Proses Verifikasi" || m.statusVerifikasi === "Perbaikan").length}
              </p>
            </div>
          </div>
        </div>

        {/* FILTER BOX */}
        <div className="bg-white border border-[#E5E7EB] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 mb-5 shadow-sm">
          <div className="flex items-center bg-[#E5E5E5] rounded-lg px-3 h-10 w-72">
            <FiSearch className="text-gray-500 text-sm mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari: Nama Dokumen, Keterangan"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-[#E5E5E5] text-sm px-4 h-10 rounded-lg pr-10 min-w-[180px] outline-none cursor-pointer"
              >
                {statusOptions.map((status, i) => (
                  <option key={i} value={status}>{status}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
            </div>
          </div>
        </div>

        {/* TABLE SECTION - DOKUMEN VALIDASI */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[6%]" />
                <col className="w-[20%]" />
                <col className="w-[30%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[14%]" />
              </colgroup>

              <thead className="bg-[#F7F7F7] text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-center">No</th>
                  <th className="px-4 py-4 text-left">Nama Dokumen</th>
                  <th className="px-4 py-4 text-left">Keterangan</th>
                  <th className="px-4 py-4 text-center">Tanggal Upload</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-center">Verifikator</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((item, i) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + i + 1;
                  return (
                    <tr
                      key={item.id}
                      className="h-[70px] border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-center align-middle">
                        {actualIndex}
                      </td>

                      <td className="px-4 py-4 font-medium text-gray-800 align-middle">
                        <div className="flex items-center gap-2">
                          <FiFileText className="text-[#115E59]" size={16} />
                          <span>{item.nama}</span>
                          {item.required && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Wajib</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-gray-500 align-middle">
                        {item.keterangan}
                      </td>

                      <td className="px-4 py-4 text-center align-middle">
                        {item.tanggalUpload}
                      </td>

                      <td className="px-4 py-4 text-center align-middle">
                        <span
                          className={`inline-flex items-center gap-1 min-w-[100px] justify-center px-3 py-1.5 rounded-full text-xs font-bold text-white ${item.statusColor}`}
                        >
                          {getStatusIcon(item.status)}
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center align-middle">
                        {item.verifikator}
                      </td>
                    </tr>
                  );
                })}

                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                      Data dokumen tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 0 && filteredDokumen.length > 0 && (
            <div className="flex justify-end items-center px-6 py-6 gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center px-2 text-[28px] font-bold transition-colors ${
                  currentPage === 1
                    ? "text-[#CBD5E1] cursor-not-allowed"
                    : "text-[#94a3b8] hover:text-[#64748b]"
                }`}
              >
                &lt;
              </button>

              {renderPaginationButtons()}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center px-2 text-[28px] font-bold transition-colors ${
                  currentPage === totalPages
                    ? "text-[#CBD5E1] cursor-not-allowed"
                    : "text-[#115E59] hover:text-[#0B4B48]"
                }`}
              >
                &gt;
              </button>
            </div>
          )}
        </div>

        {/* DAFTAR MAHASISWA PER BATCH */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Daftar Mahasiswa {batchData.listBatch}
          </h2>
          
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F7F7] text-gray-500 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-center w-16">No</th>
                    <th className="px-4 py-3 text-left">Nama Mahasiswa</th>
                    <th className="px-4 py-3 text-center">NIM</th>
                    <th className="px-4 py-3 text-center">Program Studi</th>
                    <th className="px-4 py-3 text-center">Status Verifikasi</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {mahasiswaList.map((mhs, i) => {
                    const statusColor = mhs.statusVerifikasi === "Sudah Valid" ? "bg-[#27AE60]" :
                                       mhs.statusVerifikasi === "Belum Valid" ? "bg-[#EF4444]" :
                                       mhs.statusVerifikasi === "Proses Verifikasi" ? "bg-[#3B82F6]" :
                                       "bg-[#F59E0B]";
                    return (
                      <tr key={mhs.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-center">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{mhs.nama}</td>
                        <td className="px-4 py-3 text-center font-mono text-sm">{mhs.nim}</td>
                        <td className="px-4 py-3 text-center">{mhs.prodi}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${statusColor}`}>
                            {mhs.statusVerifikasi}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDetailMahasiswa(mhs)}
                            className="text-[#115E59] hover:text-[#0B4B48] font-medium text-sm underline"
                          >
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DetailBatchDokumenValid;