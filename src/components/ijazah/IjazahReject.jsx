import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const IjazahReject = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [fakultas, setFakultas] = useState("");
  const [tahun, setTahun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // ==========================================================================
  // DATA FAKULTAS (dari Kode 2)
  // ==========================================================================
  const fakultasList = [
    {
      nama: "Fakultas Teknik dan Sains",
      kode: "FTS",
      prodi: ["Teknik Informatika", "Teknik Mesin", "Teknik Sipil"],
    },
    {
      nama: "Fakultas Hukum",
      kode: "FH",
      prodi: ["Ilmu Hukum", "Hukum Bisnis"],
    },
    {
      nama: "Fakultas Ekonomi dan Bisnis",
      kode: "FEB",
      prodi: ["Manajemen", "Akuntansi", "Bisnis Digital"],
    },
    {
      nama: "Fakultas Agama Islam",
      kode: "FAI",
      prodi: [
        "Pendidikan Agama Islam",
        "Ekonomi Syariah",
        "Komunikasi dan Penyiaran Islam",
      ],
    },
    {
      nama: "Fakultas Ilmu Kesehatan",
      kode: "FIKES",
      prodi: ["Kesehatan Masyarakat", "Ilmu Gizi"],
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
    "Yoga Pratama",
    "Nabila Putri",
    "Dimas Nugraha",
    "Putri Lestari",
    "Andi Wijaya",
    "Rizky Maulana",
  ];

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const getBatchNumber = (batchName) => {
    const match = batchName.match(/Batch\s+(\d+)/i);
    return match ? Number(match[1]) : 0;
  };

  // ==========================================================================
  // DUMMY DATA (dari Kode 2)
  // ==========================================================================
  const dummyData = useMemo(() => {
    const result = [];

    fakultasList.forEach((fak) => {
      for (let i = 1; i <= 285; i++) {
        const batchTahun = getRandom(years);
        const periode =
          Math.random() > 0.5 ? "Semester Genap" : "Semester Ganjil";
        const batchName = `Batch ${i} - ${fak.kode}`;

        const mahasiswa = Array.from({ length: 10 }, (_, index) => ({
          id: index + 1,
          nama: getRandom(namaList),
          nim: "23" + Math.floor(Math.random() * 99999999),
          prodi: getRandom(fak.prodi),
          fakultas: fak.nama,
          tahun: batchTahun,
          status: "Reject",
          batch: batchName,
        }));

        result.push({
          id: `${fak.kode}-${i}`,
          batch: batchName,
          fakultas: fak.nama,
          tahun: batchTahun,
          periode,
          total: mahasiswa.length,
          status: "Reject",
          mahasiswa,
        });
      }
    });

    return result;
  }, []);

  // ==========================================================================
  // SEARCH RESULT (dari Kode 2)
  // ==========================================================================
  const searchResult = useMemo(() => {
    if (!search) return [];

    const keyword = search.toLowerCase();
    const result = [];

    dummyData.forEach((batch) => {
      batch.mahasiswa.forEach((mhs) => {
        const matchNama = mhs.nama.toLowerCase().includes(keyword);
        const matchNim = String(mhs.nim).toLowerCase().includes(keyword);
        const matchProdi = mhs.prodi.toLowerCase().includes(keyword);

        if (matchNama || matchNim || matchProdi) {
          result.push({
            nama: mhs.nama,
            nim: mhs.nim,
            prodi: mhs.prodi,
            batch: mhs.batch || batch.batch,
            fakultas: mhs.fakultas || batch.fakultas,
            tahun: mhs.tahun || batch.tahun,
            mahasiswa: {
              ...mhs,
              batch: mhs.batch || batch.batch,
              fakultas: mhs.fakultas || batch.fakultas,
              tahun: mhs.tahun || batch.tahun,
              status: batch.status,
            },
          });
        }
      });
    });

    return result;
  }, [search, dummyData]);

  // ==========================================================================
  // FILTER DATA (dari Kode 2)
  // ==========================================================================
  const filtered = dummyData
    .filter((item) => {
      const keyword = search.toLowerCase();

      const matchBatch = item.batch.toLowerCase().includes(keyword);
      const matchNama = item.mahasiswa.some((m) =>
        m.nama.toLowerCase().includes(keyword)
      );
      const matchNim = item.mahasiswa.some((m) =>
        String(m.nim).toLowerCase().includes(keyword)
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

  // ==========================================================================
  // HANDLE DETAIL BATCH - ROUTE DARI KODE 1 (TIDAK DIUBAH)
  // ==========================================================================
  const handleDetailBatch = (item) => {
    navigate(`/batch/reject/${item.id}`, { state: item });
  };

  // ==========================================================================
  // PAGINATION STYLE DARI KODE 2
  // ==========================================================================
  const renderPaginationButtons = () => {
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

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* HEADER - gaya dari Kode 2 */}
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900">
            Jumlah Ijazah di Reject
          </h1>

          <p className="text-[#9CA3AF] text-sm mt-1">
            Update terakhir: 17 Januari 2026, 09:10 WIB
          </p>
        </div>

        {/* FILTER BOX - gaya dari Kode 2 */}
        <div className="bg-white border border-[#E5E7EB] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 mb-5 shadow-sm">
          <div className="flex items-center bg-[#E5E5E5] rounded-lg px-3 h-10 w-72">
            <FiSearch className="text-gray-500 text-sm mr-2 flex-shrink-0" />

            <input
              type="text"
              placeholder="Cari: Nama, NIM, Prodi"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <select
                value={fakultas}
                onChange={(e) => setFakultas(e.target.value)}
                className="appearance-none bg-[#E5E5E5] text-sm px-4 h-10 rounded-lg pr-10 min-w-[260px] outline-none cursor-pointer"
              >
                <option value="">Semua Fakultas</option>

                {fakultasList.map((f, i) => (
                  <option key={i} value={f.nama}>
                    {f.nama}
                  </option>
                ))}
              </select>

              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="appearance-none bg-[#E5E5E5] text-sm px-4 h-10 rounded-lg pr-10 min-w-[160px] outline-none cursor-pointer"
              >
                <option value="">Semua Tahun</option>

                {years.map((y, i) => (
                  <option key={i} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
            </div>
          </div>
        </div>

        {/* HASIL SEARCH NAMA / NIM / PRODI (dari Kode 2) */}
        {search && searchResult.length > 0 && (
          <div className="bg-white border border-[#ECECEC] rounded-xl mb-4 overflow-hidden">
            {searchResult.slice(0, 4).map((item, i) => (
              <div
                key={i}
                onClick={() =>
                  navigate("/detail-mahasiswa", {
                    state: {
                      mahasiswa: item.mahasiswa,
                    },
                  })
                }
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

        {/* TABLE SECTION - gaya dari Kode 2 */}
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
                    key={`${item.batch}-${item.fakultas}-${item.tahun}-${item.periode}`}
                    className="h-[70px] border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 text-center align-middle">
                      {actualIndex}
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-800 align-middle">
                      {item.batch}
                    </td>

                    <td className="py-4 px-4 text-center text-gray-600 font-medium align-middle">
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

                    <td className="px-4 py-4 text-center font-medium align-middle">
                      {item.total}
                    </td>

                    <td className="px-4 py-3 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleDetailBatch(item)}
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

          {/* PAGINATION - gaya dari Kode 2 */}
          {totalPages > 0 && (
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
      </div>
    </DashboardLayout>
  );
};

export default IjazahReject;