import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch } from "react-icons/fi";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const DetailBatchDokumenValid = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { batchId } = useParams();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Ambil data batch dari halaman sebelumnya
  const batchData = location.state || {
    listBatch: `Batch ${batchId || "1"}`,
    fakultas: "Fakultas Teknik dan Sains",
    tahunLulus: "2026",
    periode: "Semester Ganjil",
  };


  const normalizeMahasiswa = (item, index, batchData) => {
  const raw = item.raw || item;

  return {
    ...item,
    id: item.id || item.id_mahasiswa || index + 1,
    mahasiswa_code:
      item.mahasiswa_code ||
      item.mahasiswaCode ||
      raw.mahasiswa_code ||
      null,
    nim: item.nim || raw.nim || "-",
    nama:
      item.nama ||
      item.nama_mahasiswa ||
      raw.nama ||
      raw.nama_mahasiswa ||
      "-",
    prodi:
      item.prodi ||
      item.program_studi ||
      raw.prodi ||
      raw.program_studi ||
      "-",
    tahunLulus:
      item.tahunLulus ||
      item.tahun_lulus ||
      raw.tahun_lulus ||
      batchData.tahunLulus ||
      "-",
    status: item.status || raw.status || "Terbit",
    raw,
  };
};

  // Data mahasiswa dalam batch
const mahasiswaList = useMemo(() => {
  const sourceMahasiswa =
    batchData.mahasiswa ||
    batchData.data ||
    batchData.listMahasiswa ||
    batchData.students ||
    [];

  if (Array.isArray(sourceMahasiswa) && sourceMahasiswa.length > 0) {
    return sourceMahasiswa.map((item, index) =>
      normalizeMahasiswa(item, index, batchData),
    );
  }

  return [];
}, [batchData]);

  const getBadgeColor = (status) => {
    switch (status) {
      case "Terbit":
        return "bg-[#27AE60] text-white";
      case "Proses":
        return "bg-[#3B82F6] text-white";
      case "Reject":
        return "bg-[#EF4444] text-white";
      case "Revoke":
        return "bg-[#F59E0B] text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Filter data mahasiswa berdasarkan search
  const filteredMahasiswa = mahasiswaList.filter((item) => {
    const keyword = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.nim.toLowerCase().includes(keyword) ||
      item.prodi.toLowerCase().includes(keyword)
    );
  });

  const totalPages = Math.ceil(filteredMahasiswa.length / itemsPerPage);
  const paginatedData = filteredMahasiswa.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

 const handleDetailMahasiswa = (mhs) => {
  const mahasiswaCode =
    mhs.mahasiswa_code || mhs.mahasiswaCode || mhs.raw?.mahasiswa_code;

  if (!mahasiswaCode) {
    console.error("Mahasiswa code tidak ditemukan:", mhs);
    alert("Kode mahasiswa tidak ditemukan.");
    return;
  }

  const navState = {
    state: {
      mahasiswa: {
        ...mhs,
        fakultas: mhs.fakultas || batchData.fakultas,
        batch: mhs.batch || batchData.listBatch,
        status: mhs.status,
      },
      batch: batchData,
    },
  };

  if (mhs.status === "Terbit") {
    navigate(
      `/operator/detail-dokumen-valid/${encodeURIComponent(mahasiswaCode)}`,
      navState,
    );
    return;
  }

  navigate(
    `/operator/detail-pelaporan/${encodeURIComponent(mahasiswaCode)}`,
    navState,
  );
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
          className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold shadow-sm transition-colors ${
            isActive
              ? "bg-[#00897B] text-white"
              : "bg-white border border-gray-300 text-gray-500 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <DashboardLayout title="Detail Validasi Dokumen">
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900">
            Detail Validasi Dokumen
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            {batchData.listBatch} • {batchData.fakultas} • {batchData.periode} •{" "}
            {batchData.tahunLulus}
          </p>
        </div>

        {/* SEARCH BOX - PUTIH (tanpa dropdown) */}
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
            <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari: Nama, NIM, Prodi"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* TABLE SECTION - DAFTAR MAHASISWA */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F7F7] text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-center w-16">No.</th>
                  <th className="px-4 py-4 text-left min-w-[200px]">Nama</th>
                  <th className="px-4 py-4 text-center min-w-[140px]">NIM</th>
                  <th className="px-4 py-4 text-center min-w-[200px]">
                    Program Studi
                  </th>
                  <th className="px-4 py-4 text-center w-28">Tahun Lulus</th>
                  <th className="px-4 py-4 text-center w-28">Status</th>
                  <th className="px-4 py-4 text-center w-24">Detail</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((item, i) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + i + 1;
                  return (
                    <tr
                      key={item.mahasiswa_code || item.id || item.nim || i}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-center font-medium text-gray-800">
                        {actualIndex}.
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        {item.nama}
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-gray-800">
                        {item.nim}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600">
                        {item.prodi}
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-gray-800">
                        {item.tahunLulus}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-block min-w-[86px] px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleDetailMahasiswa(item)}
                          className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition flex-shrink-0"
                        >
                          <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
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
                      Data mahasiswa tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 0 && filteredMahasiswa.length > 0 && (
            <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Menampilkan {paginatedData.length} dari{" "}
                {filteredMahasiswa.length} Data
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DetailBatchDokumenValid;
