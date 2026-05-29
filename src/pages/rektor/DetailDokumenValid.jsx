import React, { useState, useMemo, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";

const DUMMY_MAHASISWA = [
  { no: 1,  nama: "Adi Saputra",      nim: "231106040902", prodi: "Teknik Informatika", tahun: 2025, status: "Terbit" },
  { no: 2,  nama: "Rani Maharani",    nim: "231106040903", prodi: "Teknik Mesin",       tahun: 2025, status: "Terbit" },
  { no: 3,  nama: "Budi Pratama",     nim: "231106040910", prodi: "Teknik Sipil",       tahun: 2025, status: "Terbit" },
  { no: 4,  nama: "Kayla Key",        nim: "231106040912", prodi: "Teknik Mesin",       tahun: 2025, status: "Terbit" },
  { no: 5,  nama: "Rizky Gusti A",    nim: "231106040839", prodi: "Teknik Informatika", tahun: 2025, status: "Terbit" },
  { no: 6,  nama: "Risma Puspita",    nim: "231106040290", prodi: "Teknik Sipil",       tahun: 2025, status: "Terbit" },
  { no: 7,  nama: "Budi Doremi",      nim: "231106040923", prodi: "Teknik Elektro",     tahun: 2025, status: "Terbit" },
  { no: 8,  nama: "Siti Aisyah",      nim: "231106040906", prodi: "Teknik Elektro",     tahun: 2025, status: "Terbit" },
  { no: 9,  nama: "Eagle Al-Haikal",  nim: "231106040907", prodi: "Teknik Informatika", tahun: 2025, status: "Terbit" },
  { no: 10, nama: "Zahra Nabil",      nim: "231106040918", prodi: "Teknik Mesin",       tahun: 2025, status: "Terbit" },
];

const DetailDokumenValidRektor = () => {
  const navigate      = useNavigate();
  const { state }     = useLocation();
  const batch         = state || {};

  const [search, setSearch]             = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const searchSuggestions = useMemo(() => {
    if (!search.trim()) return DUMMY_MAHASISWA;
    return DUMMY_MAHASISWA.filter(
      (s) => s.nama.toLowerCase().includes(search.toLowerCase()) || s.nim.includes(search)
    );
  }, [search]);

  const filteredTable = useMemo(() => {
    if (!search.trim()) return DUMMY_MAHASISWA;
    return DUMMY_MAHASISWA.filter(
      (s) => s.nama.toLowerCase().includes(search.toLowerCase()) || s.nim.includes(search)
    );
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const DetailIcon = () => <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500" />;

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

        {/* Info Batch — muncul kalau ada state dari halaman sebelumnya */}
        {batch.batch && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Batch</p>
              <p className="text-sm font-bold text-gray-800">{batch.batch}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Fakultas</p>
              <p className="text-sm font-semibold text-gray-700">{batch.fakultas}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Tahun Lulus</p>
              <p className="text-sm font-semibold text-gray-700">{batch.tahun}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Periode</p>
              <p className="text-sm font-semibold text-gray-700">{batch.periode}</p>
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        <div ref={searchRef} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-0">
          <div className="w-full lg:max-w-md">
            <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
              <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari: Nama, NIM..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* SUGGESTIONS — scrollable, in-flow */}
        {showSuggestions && search.trim() && (
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
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#16A34A] ml-4 whitespace-nowrap">
                    {student.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-gray-400">Mahasiswa tidak ditemukan</div>
            )}
          </div>
        )}
        {!(showSuggestions && search.trim()) && <div className="mb-6" />}

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 w-[180px]">Nama</th>
                  <th className="py-4 px-6 text-center w-[160px]">NIM</th>
                  <th className="py-4 px-6 text-center">Program Studi</th>
                  <th className="py-4 px-6 text-center w-[120px]">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center w-[120px]">Status</th>
                  <th className="py-4 px-6 text-center w-20">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredTable.map((item, i) => (
                  <tr key={item.nim} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-center font-semibold text-gray-800">{i + 1}.</td>
                    <td className="py-4 px-6 font-semibold text-gray-900">{item.nama}</td>
                    <td className="py-4 px-6 text-center font-normal text-gray-700">{item.nim}</td>
                    <td className="py-4 px-6 text-center font-normal text-gray-700">{item.prodi}</td>
                    <td className="py-4 px-6 text-center font-normal text-gray-700">{item.tahun}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-5 py-1.5 rounded-full text-xs font-bold text-white bg-[#16A36B]">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {/* Klik → ke detail mahasiswa */}
                      <button
                        onClick={() => navigate(`/rektor/detail-mahasiswa/${item.nim}`, { state: item })}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition flex-shrink-0"
                      >
                        <DetailIcon />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTable.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400 font-medium">
                      <div className="flex flex-col items-center justify-center">
                        <FiSearch className="text-4xl mb-3 text-gray-300" />
                        <p>Mahasiswa tidak ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DetailDokumenValidRektor;