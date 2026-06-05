import React, { useState, useMemo, useEffect } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";

const DataMahasiswa = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [tahun, setTahun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fakultasList = [
    {
      nama: "Fakultas Teknik dan Sains",
      kode: "FTS",
      prodi: ["Teknik Informatika", "Teknik Mesin", "Teknik Sipil", "Sistem Informasi", "Teknik Elektro"],
    },
    {
      nama: "Fakultas Ekonomi dan Bisnis",
      kode: "FEB",
      prodi: ["Manajemen", "Akuntansi", "Bisnis Digital"],
    },
    {
      nama: "Fakultas Hukum",
      kode: "FH",
      prodi: ["Ilmu Hukum"],
    },
    {
      nama: "Fakultas Ilmu Kesehatan",
      kode: "FIKES",
      prodi: ["Kesehatan Masyarakat", "Ilmu Gizi"],
    },
    {
      nama: "Fakultas Agama Islam",
      kode: "FAI",
      prodi: ["Pendidikan Agama Islam", "Ekonomi Syariah"],
    },
    {
      nama: "Fakultas Keguruan dan Ilmu Pendidikan",
      kode: "FKIP",
      prodi: [
        "Pendidikan Bahasa Inggris",
        "Teknologi Pendidikan",
        "Pendidikan Matematika",
      ],
    },
  ];

  const years = ["2021", "2022", "2023", "2024", "2025", "2026"];

  const namaList = [
    "Adi Saputra",
    "Rani Maharani",
    "Budi Pratama",
    "Siti Aisyah",
    "Dimas Nugraha",
    "Fajar Ramadhan",
    "Putri Lestari",
    "Andi Wijaya",
    "Rizky Maulana",
    "Nabila Putri",
    "Yoga Pratama",
    "Citra Dewi",
    "Dila Fadilla",
    "Nayla Nim",
    "Samsul Jun",
    "Rayyan Hesa",
    "Zahra Nur",
    "Zulvikri",
    "Tasya Cantika",
    "Baedilah",
    "Mutqin",
    "Husni Haqiqi"
  ];

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const getBatchNumber = (batchName) => {
    const match = batchName.match(/Batch\s+(\d+)/i);
    return match ? Number(match[1]) : 0;
  };

  const tempatLahirList = ["Bogor", "Jakarta", "Bandung", "Depok", "Bekasi", "Tangerang"];
  const tanggalLahirList = ["15 Januari 2004", "20 Maret 2004", "10 Februari 2004", "22 April 2004", "12 Mei 2004", "18 Oktober 2004", "21 Januari 2003", "9 Agustus 2004", "5 Februari 2003"];

  const dummyData = useMemo(() => {
    let result = [];
    let id = 1;

    fakultasList.forEach((fak) => {
      for (let i = 1; i <= 10; i++) {
        const batchTahun = getRandom(years);
        const batchName = `Batch ${i} - ${fak.kode}`;
        const periode = Math.random() > 0.5 ? "Semester Genap" : "Semester Ganjil";

        const mahasiswa = Array.from({ length: 10 }, (_, index) => {
          const nama = getRandom(namaList);
          const isCewe = ["Rani", "Siti", "Putri", "Nabila", "Citra", "Dewi", "Aulia", "Zahra", "Nayla", "Tasya", "Dila"].some(n => nama.includes(n));
          
          return {
            nama: nama,
            nim: `23110604${String(900 + id * 10 + index).padStart(3, "0")}`,
            prodi: getRandom(fak.prodi),
            batch: batchName,
            fakultas: fak.nama,
            tahunLulus: batchTahun,
            jenisKelamin: isCewe ? "Perempuan" : "Laki-laki",
            ipk: (3.0 + (Math.random() * 1.0)).toFixed(2),
            tempatLahir: getRandom(tempatLahirList),
            tanggalLahir: getRandom(tanggalLahirList),
            email: `${nama.toLowerCase().replace(/\s+/g, ".")}${Math.floor(Math.random() * 100)}@student.uika.ac.id`,
            noTelp: `0812${Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}`,
            tahunMasuk: parseInt(batchTahun) - 3,
            totalSks: 144
          };
        });

        result.push({
          id: id++,
          batch: batchName,
          fakultas: fak.nama,
          tahun: batchTahun,
          periode,
          total: mahasiswa.length,
          mahasiswa: mahasiswa,
        });
      }
    });

    return result;
  }, []);

  const searchResult = useMemo(() => {
    if (!search) return [];

    const keyword = search.toLowerCase();
    let result = [];

    dummyData.forEach((batch) => {
      batch.mahasiswa.forEach((mhs) => {
        const matchNama = mhs.nama.toLowerCase().includes(keyword);
        const matchNim = mhs.nim.toLowerCase().includes(keyword);
        const matchProdi = mhs.prodi.toLowerCase().includes(keyword);

        if (matchNama || matchNim || matchProdi) {
          result.push({
            nama: mhs.nama,
            nim: mhs.nim,
            prodi: mhs.prodi,
            batch: mhs.batch,
            fakultas: mhs.fakultas,
            tahun: mhs.tahunLulus,
            mahasiswa: mhs,
          });
        }
      });
    });

    return result;
  }, [search, dummyData]);

  const filtered = dummyData
    .filter((item) => {
      const keyword = search.toLowerCase();

      const matchBatch = item.batch.toLowerCase().includes(keyword);
      const matchNama = item.mahasiswa.some((m) =>
        m.nama.toLowerCase().includes(keyword)
      );
      const matchNim = item.mahasiswa.some((m) =>
        m.nim.toLowerCase().includes(keyword)
      );
      const matchProdi = item.mahasiswa.some((m) =>
        m.prodi.toLowerCase().includes(keyword)
      );

      return (
        (matchBatch || matchNama || matchNim || matchProdi) &&
        (fakultas ? item.fakultas === fakultas : true) &&
        (tahun ? item.tahun === tahun : true)
      );
    })
    .sort((a, b) => {
      return (
        a.fakultas.localeCompare(b.fakultas) ||
        getBatchNumber(a.batch) - getBatchNumber(b.batch) ||
        a.tahun.localeCompare(b.tahun) ||
        a.periode.localeCompare(b.periode)
      );
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fakultas, tahun]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
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

    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    return pages.map((page, index) => (
      <button
        key={index}
        type="button"
        onClick={() => typeof page === "number" && handlePageChange(page)}
        disabled={page === "..."}
        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold shadow-sm transition-colors ${
          page === currentPage
            ? "bg-[#00897B] text-white"
            : page === "..."
            ? "bg-transparent text-gray-400 cursor-default shadow-none"
            : "bg-white border border-gray-300 text-gray-500 hover:bg-gray-100" // ✅ DIUBAH: dari bg-[#E5E7EB] jadi bg-white border
        }`}
      >
        {page}
      </button>
    ));
  };

  const handleMahasiswaClick = (item) => {
    navigate(`/admin/detail-mahasiswa/${item.nim}`, {
      state: {
        mahasiswa: {
          ...item.mahasiswa,
          nim: item.nim,
          nama: item.nama,
          prodi: item.prodi,
          fakultas: item.fakultas,
          batch: item.batch,
          tahunLulus: item.tahun,
        }
      },
    });
  };

  return (
    <DashboardLayout title="Daftar Batch">
      <div className="w-full">
        <div className="mb-7">
          <h1 className="text-[28px] font-bold text-[#111827] leading-tight">
            Daftar Batch
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Melihat data yang sedang di proses validasi
          </p>
        </div>

        {/* FILTER BOX - DIUBAH jadi putih seperti RektorDokumenValid */}
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="w-full lg:max-w-md">
              <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
                <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cari: Nama, NIM, Prodi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full lg:w-72">
                <select
                  value={fakultas}
                  onChange={(e) => setFakultas(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-center"
                >
                  <option value="">Semua Fakultas</option>
                  {fakultasList.map((f, i) => (
                    <option key={i} value={f.nama}>
                      {f.nama}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
              </div>

              <div className="relative w-full lg:w-44">
                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 focus:border-[#117065] focus:ring-1 focus:ring-[#117065] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg w-full outline-none cursor-pointer transition-all shadow-sm text-center"
                >
                  <option value="">Semua Tahun</option>
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

        {/* HASIL SEARCH NAMA / NIM / PRODI */}
        {search && searchResult.length > 0 && (
          <div className="bg-white border border-[#ECECEC] rounded-xl mb-4 overflow-hidden">
            {searchResult.slice(0, 4).map((item, i) => (
              <div
                key={i}
                onClick={() => handleMahasiswaClick(item)}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-[#FAFAFA] transition border-b border-[#F5F5F5] last:border-b-0 cursor-pointer"
              >
                <div>
                  <p className="text-[13px] font-semibold text-[#111827] leading-none">
                    {item.nama}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">
                    {item.nim} • {item.prodi}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">
                    {item.fakultas}
                  </p>
                </div>
                <div className="text-[11px] text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-md">
                  {item.batch}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[20%]" />
              <col className="w-[24%]" />
              <col className="w-[12%]" />
              <col className="w-[18%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>

            <thead className="bg-[#F7F7F7] text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 text-center">No</th>
                <th className="px-4 py-4 text-left">List Batch</th>
                <th className="px-4 py-4 text-center">Fakultas</th>
                <th className="px-4 py-4 text-center">Tahun Lulus</th>
                <th className="px-4 py-4 text-center">Periode</th>
                <th className="px-4 py-4 text-center">Total</th>
                <th className="px-4 py-4 text-center">Detail</th>
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
                    <td className="px-4 py-4 font-semibold text-gray-800 align-middle">
                      {item.batch}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600 font-semibold align-middle">
                      <div
                        className="whitespace-normal leading-snug overflow-hidden max-w-[260px] mx-auto"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {item.fakultas}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center align-middle">
                      {item.tahun}
                    </td>
                    <td className="px-4 py-4 text-center align-middle">
                      {item.periode}
                    </td>
                    <td className="px-4 py-4 text-center font-semibold align-middle">
                      {item.total}
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/detail-batch/${item.id}`, {
                            state: item,
                          })
                        }
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-100 transition"
                        title="Lihat detail batch"
                      >
                        <div className="w-3 h-3 border-t-2 border-b-2 border-gray-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {paginatedData.length} dari {filtered.length} Data
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50"
                >
                  {"<"}
                </button>

                {renderPaginationButtons()}

                <button
                  type="button"
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

export default DataMahasiswa;