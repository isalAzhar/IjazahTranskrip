import React, { useState, useMemo, useRef, useEffect } from "react";
import { FiSearch, FiChevronDown, FiXCircle, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";

// ✅ Ditambahkan properti 'status' agar saat pindah ke halaman Detail Mahasiswa, badge warnanya menyala
const DUMMY_STUDENTS = [
  { nama: "Adi Saputra",       nim: "231106040900", prodi: "Teknik Informatika",          fakultas: "Fakultas Teknik dan Sains",              batch: "Batch 1 - FTS",   status: "Proses" },
  { nama: "Rani Maharani",     nim: "231106040901", prodi: "Teknik Mesin",                fakultas: "Fakultas Teknik dan Sains",              batch: "Batch 1 - FTS",   status: "Terbit" },
  { nama: "Siti Nurhaliza",    nim: "231106040905", prodi: "Pendidikan Agama Islam",      fakultas: "Fakultas Agama Islam",                   batch: "Batch 1 - FAI",   status: "Revoke" },
  { nama: "Ahmad Fauzi",       nim: "231106040906", prodi: "Ekonomi Syariah",             fakultas: "Fakultas Agama Islam",                   batch: "Batch 2 - FAI",   status: "Reject" },
  { nama: "Dimas Anggara",     nim: "231106040907", prodi: "Manajemen",                  fakultas: "Fakultas Ekonomi dan Bisnis",             batch: "Batch 1 - FEB",   status: "Proses" },
  { nama: "Chelsea Islan",     nim: "231106040908", prodi: "Akuntansi",                  fakultas: "Fakultas Ekonomi dan Bisnis",             batch: "Batch 2 - FEB",   status: "Terbit" },
  { nama: "Reza Firmansyah",   nim: "231106040910", prodi: "Ilmu Hukum",                 fakultas: "Fakultas Hukum",                         batch: "Batch 1 - FH",    status: "Proses" },
  { nama: "Putri Andini",      nim: "231106040911", prodi: "Pendidikan Matematika",      fakultas: "Fakultas Keguruan dan Ilmu Pendidikan",   batch: "Batch 1 - FKIP",  status: "Revoke" },
  { nama: "Bagas Saputro",     nim: "231106040912", prodi: "Kesehatan Masyarakat",       fakultas: "Fakultas Ilmu Kesehatan",                batch: "Batch 1 - FIKES", status: "Reject" },
  { nama: "Nicholas Saputra",  nim: "231106040909", prodi: "Sistem Informasi",            fakultas: "Fakultas Teknik dan Sains",              batch: "Batch 3 - FTS",   status: "Proses" },
];

const DaftarBatch = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery]       = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedYear, setSelectedYear]     = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const filterBarRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showRejectReason, setShowRejectReason]   = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showRejectSuccess, setShowRejectSuccess] = useState(false);
  const [rejectReason, setRejectReason]           = useState("");
  const [selectedBatch, setSelectedBatch]         = useState(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2021 + 1 }, (_, i) => currentYear - i);

  const dummyBatchData = useMemo(() => {
    const fakultasList = [
      { nama: "Fakultas Agama Islam",                   kode: "FAI"   },
      { nama: "Fakultas Keguruan dan Ilmu Pendidikan",  kode: "FKIP"  },
      { nama: "Fakultas Ekonomi dan Bisnis",            kode: "FEB"   },
      { nama: "Fakultas Teknik dan Sains",              kode: "FTS"   },
      { nama: "Fakultas Hukum",                         kode: "FH"    },
      { nama: "Fakultas Ilmu Kesehatan",                kode: "FIKES" },
    ];
    const list = [];
    for (let i = 1; i <= 45; i++) {
      const f = fakultasList[i % fakultasList.length];
      list.push({
        id: i,
        batch: `Batch ${i} - ${f.kode}`,
        fakultas: f.nama,
        tahun: 2026 - (i % 3),
        periode: i % 2 === 0 ? "Semester Genap" : "Semester Ganjil",
        total: 10,
      });
    }
    return list;
  }, []);

  const filteredData = useMemo(() => {
    return dummyBatchData.filter((item) => {
      const matchSearch   = item.batch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFakultas = selectedFakultas === "" || item.fakultas === selectedFakultas;
      const matchYear     = selectedYear === "" || item.tahun.toString() === selectedYear;
      return matchSearch && matchFakultas && matchYear;
    });
  }, [searchQuery, selectedFakultas, selectedYear, dummyBatchData]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return DUMMY_STUDENTS;
    return DUMMY_STUDENTS.filter(
      (s) => s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nim.includes(searchQuery)
    );
  }, [searchQuery]);

  const totalPages      = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentTableData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Jika user klik di luar kotak Filter dan Sugesti, tutup dropdown sugesti
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenReject   = (batch) => { setSelectedBatch(batch); setRejectReason(""); setShowRejectReason(true); };
  const handleSubmitReason = ()      => { setShowRejectReason(false); setShowRejectConfirm(true); };
  const handleConfirmReject = ()     => { setShowRejectConfirm(false); setShowRejectSuccess(true); };
  const handleFinishReject  = ()     => { setShowRejectSuccess(false); setSelectedBatch(null); };

  const DetailIcon = () => <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>;

  return (
    <DashboardLayout title="Manajemen Data">
      <div className="w-full pb-10">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Manajemen Data</h1>
          <p className="text-[#9CA3AF] text-[14px] font-medium mt-1">
            Kelola validasi dan kirim data mahasiswa ke Wakil Dekan Fakultas
          </p>
        </div>

        {/* 🔥 KOTAK FILTER & SUGESTI (Dibungkus 1 Ref agar bisa diklik dan mendorong tabel) */}
        <div ref={filterBarRef} className="mb-6">
          
          {/* Bagian Bar Filter */}
          <div className={`bg-white p-4 shadow-sm border border-gray-100 ${showSuggestions ? 'rounded-t-xl border-b-0' : 'rounded-xl'}`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="w-full lg:max-w-md">
              <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
                <FiSearch className="text-gray-400 text-lg mr-3" />
                <input
                  type="text"
                  placeholder="Cari: Nama, NIM Mahasiswa..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); setCurrentPage(1); }}
                  onFocus={() => setShowSuggestions(true)}
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

           {/* Dropdowns */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full lg:w-72">
               <select value={selectedFakultas} onChange={(e) => { setSelectedFakultas(e.target.value); setCurrentPage(1); }}
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left">
                  <option value="">Semua Fakultas</option>
                  <option value="Fakultas Agama Islam">Fakultas Agama Islam</option>
                  <option value="Fakultas Keguruan dan Ilmu Pendidikan">Fakultas Keguruan dan Ilmu Pendidikan</option>
                  <option value="Fakultas Ekonomi dan Bisnis">Fakultas Ekonomi dan Bisnis</option>
                  <option value="Fakultas Teknik dan Sains">Fakultas Teknik dan Sains</option>
                  <option value="Fakultas Hukum">Fakultas Hukum</option>
                  <option value="Fakultas Ilmu Kesehatan">Fakultas Ilmu Kesehatan</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>

              <div className="relative w-full lg:w-44">
                <select
                  value={selectedYear}
                  onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-left"
                >
                  <option value="">Semua Tahun</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>
            </div>
            </div>
          </div>

          {/* Bagian Sugesti (Normal flow, mendorong tabel ke bawah) */}
          {showSuggestions && (
            <div className="bg-white border-x border-b border-gray-100 shadow-md rounded-b-xl max-h-[420px] overflow-y-auto w-full">
              {searchSuggestions.length > 0 ? (
                searchSuggestions.map((student, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setShowSuggestions(false);
                      // ✅ Langsung pindah ke Detail Mahasiswa
                      navigate(`/detail-mahasiswa/${student.nim}`, { state: student });
                    }}
                    className="px-6 py-4 border-b border-gray-50 hover:bg-teal-50 cursor-pointer flex justify-between items-center transition-colors last:border-b-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="font-bold text-[#1F2937] text-[14px] mb-1">{student.nama}</div>
                      <div className="text-[12px] font-normal text-gray-500">{student.nim} • {student.prodi}</div>
                      <div className="text-[12px] font-normal text-gray-400">{student.fakultas}</div>
                    </div>
                    <div className="text-[11px] font-semibold bg-[#F3F4F6] text-gray-500 px-3 py-1.5 rounded-md h-fit whitespace-nowrap ml-4">
                      {student.batch}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-gray-400">Mahasiswa tidak ditemukan</div>
              )}
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 w-[200px]">List Batch</th>
                  <th className="py-4 px-6">Fakultas</th>
                  <th className="py-4 px-6 text-center">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center">Periode</th>
                  <th className="py-4 px-6 text-center">Total Data</th>
                  <th className="py-4 px-6 text-center w-20">Detail</th>
                  <th className="py-4 px-6 text-center w-20">Reject</th>
                </tr>
              </thead>
              <tbody>
                {currentTableData.map((item, i) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{(currentPage - 1) * itemsPerPage + i + 1}.</td>
                    <td className="py-4 px-6 font-bold text-gray-900">{item.batch}</td>
                    <td className="py-4 px-6 font-normal text-gray-800">{item.fakultas}</td>
                    <td className="py-4 px-6 text-center font-semibold text-gray-700">{item.tahun}</td>
                    <td className="py-4 px-6 text-center font-semibold text-gray-700">{item.periode}</td>
                    <td className="py-4 px-6 text-center font-semibold text-gray-700">{item.total}</td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => navigate(`/detail-batch/${item.id}`, { state: item })}
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
                {currentTableData.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
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
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="flex items-center justify-center px-2 text-[18px] font-bold text-gray-400 hover:text-gray-800 disabled:opacity-30 transition-colors cursor-pointer">&lt;</button>
              <button onClick={() => setCurrentPage(1)} className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold shadow-sm transition-colors ${currentPage === 1 ? 'bg-[#117065] text-white' : 'bg-[#E5E7EB] text-gray-500 hover:bg-gray-300'}`}>1</button>
              {totalPages >= 2 && <button onClick={() => setCurrentPage(2)} className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold shadow-sm transition-colors ${currentPage === 2 ? 'bg-[#117065] text-white' : 'bg-[#E5E7EB] text-gray-500 hover:bg-gray-300'}`}>2</button>}
              {totalPages > 3 && <span className="w-8 h-8 flex items-center justify-center rounded bg-[#E5E7EB] text-gray-400 text-sm font-bold">...</span>}
              {totalPages > 2 && <button onClick={() => setCurrentPage(totalPages)} className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold shadow-sm transition-colors ${currentPage === totalPages ? 'bg-[#117065] text-white' : 'bg-[#E5E7EB] text-gray-500 hover:bg-gray-300'}`}>{totalPages}</button>}
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="flex items-center justify-center px-2 text-[18px] font-bold text-gray-400 hover:text-gray-800 disabled:opacity-30 transition-colors cursor-pointer">&gt;</button>
            </div>
          )}
        </div>

        {/* MODAL 1: ALASAN REJECT */}
        {showRejectReason && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Alasan Reject</h2>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Kesalahan pada penulisan nama Fakultas..." className="w-full bg-[#F3F4F6] border border-transparent focus:border-red-500 focus:bg-white rounded-xl p-4 text-sm font-medium outline-none resize-none h-32 transition-colors placeholder-gray-400" />
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowRejectReason(false)} className="px-6 py-2.5 rounded-lg font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={handleSubmitReason} disabled={!rejectReason.trim()} className="px-6 py-2.5 rounded-lg font-bold text-white bg-[#117065] hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Konfirmasi</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: KONFIRMASI REJECT */}
        {showRejectConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="text-red-500 text-3xl" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Apakah Anda yakin ingin melakukan reject?</h2>
              <div className="flex justify-center gap-3 mt-8">
                <button onClick={() => setShowRejectConfirm(false)} className="flex-1 px-4 py-2.5 rounded-lg font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={handleConfirmReject} className="flex-1 px-4 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">Reject</button>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Reject Berhasil</h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">Data telah berhasil ditolak dan status telah diperbarui</p>
              <button onClick={handleFinishReject} className="w-full px-4 py-3 rounded-xl font-bold text-white bg-[#117065] hover:bg-teal-800 transition-colors">Selesai</button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default DaftarBatch;