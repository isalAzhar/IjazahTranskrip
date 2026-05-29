import React, { useState, useMemo, useRef, useEffect } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";

const fakultasList = [
  { nama: "Fakultas Agama Islam",                  kode: "FAI"   },
  { nama: "Fakultas Keguruan dan Ilmu Pendidikan", kode: "FKIP"  },
  { nama: "Fakultas Ekonomi dan Bisnis",           kode: "FEB"   },
  { nama: "Fakultas Teknik dan Sains",             kode: "FTS"   },
  { nama: "Fakultas Hukum",                        kode: "FH"    },
  { nama: "Fakultas Ilmu Kesehatan",               kode: "FIKES" },
];

const DUMMY_STUDENTS = [
  { nama: "Adi Saputra",      nim: "231106040900", prodi: "Teknik Informatika",               fakultas: "Fakultas Teknik dan Sains",            batch: "Batch 1 - FTS"   },
  { nama: "Rani Maharani",    nim: "231106040901", prodi: "Teknik Mesin",                     fakultas: "Fakultas Teknik dan Sains",            batch: "Batch 1 - FTS"   },
  { nama: "Budi Pratama",     nim: "231106040902", prodi: "Teknik Sipil",                     fakultas: "Fakultas Teknik dan Sains",            batch: "Batch 1 - FTS"   },
  { nama: "Kayla Keyla",      nim: "231106040903", prodi: "Sistem Informasi",                 fakultas: "Fakultas Teknik dan Sains",            batch: "Batch 1 - FTS"   },
  { nama: "Siti Nurhaliza",   nim: "231106040905", prodi: "Pendidikan Agama Islam",           fakultas: "Fakultas Agama Islam",                 batch: "Batch 2 - FAI"   },
  { nama: "Ahmad Fauzi",      nim: "231106040906", prodi: "Ekonomi Syariah",                  fakultas: "Fakultas Agama Islam",                 batch: "Batch 2 - FAI"   },
  { nama: "Dimas Anggara",    nim: "231106040907", prodi: "Manajemen",                       fakultas: "Fakultas Ekonomi dan Bisnis",           batch: "Batch 3 - FEB"   },
  { nama: "Chelsea Islan",    nim: "231106040908", prodi: "Akuntansi",                       fakultas: "Fakultas Ekonomi dan Bisnis",           batch: "Batch 3 - FEB"   },
  { nama: "Reza Firmansyah",  nim: "231106040910", prodi: "Ilmu Hukum",                      fakultas: "Fakultas Hukum",                       batch: "Batch 4 - FH"    },
  { nama: "Putri Andini",     nim: "231106040911", prodi: "Pendidikan Matematika",           fakultas: "Fakultas Keguruan dan Ilmu Pendidikan", batch: "Batch 5 - FKIP"  },
  { nama: "Bagas Saputro",    nim: "231106040912", prodi: "Kesehatan Masyarakat",            fakultas: "Fakultas Ilmu Kesehatan",              batch: "Batch 6 - FIKES" },
  { nama: "Nicholas Saputra", nim: "231106040909", prodi: "Ilmu Gizi",                       fakultas: "Fakultas Ilmu Kesehatan",              batch: "Batch 6 - FIKES" },
  { nama: "Rizky Gusti",      nim: "231106040839", prodi: "Rekayasa Pertanian dan Biosistem",fakultas: "Fakultas Teknik dan Sains",            batch: "Batch 1 - FTS"   },
  { nama: "Risma Puspita",    nim: "231106040290", prodi: "Teknik Elektro",                  fakultas: "Fakultas Teknik dan Sains",            batch: "Batch 1 - FTS"   },
  { nama: "Dewi Rahayu",      nim: "231106040291", prodi: "Pendidikan Bahasa Inggris",       fakultas: "Fakultas Keguruan dan Ilmu Pendidikan", batch: "Batch 5 - FKIP"  },
];

const DUMMY_BATCH = Array.from({ length: 45 }, (_, i) => {
  const f = fakultasList[i % fakultasList.length];
  return {
    id: i + 1,
    batch: `Batch ${i + 1} - ${f.kode}`,
    fakultas: f.nama,
    tahun: 2021 + (i % 6),
    periode: i % 2 === 0 ? "Semester Ganjil" : "Semester Genap",
    total: 10,
  };
});

const ITEMS_PER_PAGE = 10;

const RektorDokumenValid = () => {
  const navigate = useNavigate();

  const [search, setSearch]                     = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedYear, setSelectedYear]         = useState("");
  const [currentPage, setCurrentPage]           = useState(1);
  const [showSuggestions, setShowSuggestions]   = useState(false);
  const filterBarRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2021 + 1 }, (_, i) => currentYear - i);

  const filtered = useMemo(() => {
    return DUMMY_BATCH.filter((item) => {
      const matchSearch   = item.batch.toLowerCase().includes(search.toLowerCase());
      const matchFakultas = !selectedFakultas || item.fakultas === selectedFakultas;
      const matchYear     = !selectedYear || item.tahun.toString() === selectedYear;
      return matchSearch && matchFakultas && matchYear;
    });
  }, [search, selectedFakultas, selectedYear]);

  const searchSuggestions = useMemo(() => {
    if (!search.trim()) return DUMMY_STUDENTS;
    return DUMMY_STUDENTS.filter(
      (s) => s.nama.toLowerCase().includes(search.toLowerCase()) || s.nim.includes(search)
    );
  }, [search]);

  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const currentData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePage = (p) => { if (p >= 1 && p <= totalPages) setCurrentPage(p); };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderPages = () => {
    let pages = [];
    if (totalPages <= 4) pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    else if (currentPage <= 2) pages = [1, 2, "...", totalPages];
    else if (currentPage >= totalPages - 1) pages = [1, "...", totalPages - 1, totalPages];
    else pages = [1, "...", currentPage, "...", totalPages];

    return pages.map((p, idx) => {
      const isActive   = p === currentPage;
      const isEllipsis = p === "...";
      return (
        <button
          key={idx}
          onClick={() => !isEllipsis && handlePage(p)}
          disabled={isEllipsis}
          className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-bold transition-all
            ${isActive   ? "bg-[#117065] text-white shadow-md" : "bg-[#E5E7EB] text-gray-500 hover:bg-gray-300"}
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

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Daftar Dokumen Valid</h1>
          <p className="text-[#9CA3AF] text-[14px] font-medium mt-1">
            Arsip digital ijazah dan transkrip mahasiswa yang telah melewati proses verifikasi institusi.
          </p>
        </div>

        {/* ✅ FILTER BAR — bg-white, border, focus ring teal */}
        <div ref={filterBarRef} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-0">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

            {/* Search — putih dengan border & focus ring teal */}
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

            {/* Dropdowns — putih dengan border & focus ring teal */}
            <div className="flex items-center gap-3 w-full lg:w-auto">

              {/* Semua Fakultas */}
              <div className="relative w-full lg:w-72">
                <select
                  value={selectedFakultas}
                  onChange={(e) => { setSelectedFakultas(e.target.value); setCurrentPage(1); }}
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-center"
                >
                  <option value="">Semua Fakultas</option>
                  {fakultasList.map((f) => (
                    <option key={f.kode} value={f.nama}>{f.nama}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>

              {/* Semua Tahun */}
              <div className="relative w-full lg:w-44">
                <select
                  value={selectedYear}
                  onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-center"
                >
                  <option value="">Semua Tahun</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ SUGGESTIONS — in-flow, scrollbar otomatis muncul kalau data banyak */}
        {showSuggestions && (
          <div
            className="bg-white border-x border-b border-gray-100 shadow-md rounded-b-xl mb-6 overflow-y-auto"
            style={{ maxHeight: "260px" }}
          >
            {searchSuggestions.length > 0 ? (
              searchSuggestions.map((student, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setShowSuggestions(false);
                    navigate(`/rektor/detail-mahasiswa/${student.nim}`, { state: student });
                  }}
                  className="px-6 py-4 border-b border-gray-50 hover:bg-teal-50 cursor-pointer flex justify-between items-center transition-colors last:border-b-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="font-bold text-[#1F2937] text-[14px] mb-0.5">{student.nama}</div>
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
        {!showSuggestions && <div className="mb-6" />}

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
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, i) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-center font-semibold text-gray-800">
                      {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}.
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">{item.batch}</td>
                    <td className="py-4 px-6 font-normal text-gray-700">{item.fakultas}</td>
                    <td className="py-4 px-6 text-center font-normal text-gray-700">{item.tahun}</td>
                    <td className="py-4 px-6 text-center font-normal text-gray-700">{item.periode}</td>
                    <td className="py-4 px-6 text-center font-normal text-gray-700">{item.total}</td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => navigate(`/rektor/detail-dokumen-valid/${item.id}`, { state: item })}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition flex-shrink-0"
                      >
                        <DetailIcon />
                      </button>
                    </td>
                  </tr>
                ))}

                {currentData.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400 font-medium">
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

          {/* PAGINATION */}
          <div className="px-6 py-5 border-t border-gray-100 bg-white flex justify-between items-center">
            <p className="text-sm text-gray-400 font-medium">
              Menampilkan {currentData.length} dari {filtered.length} data
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