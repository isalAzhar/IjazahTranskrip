import React, { useMemo, useState } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch } from "react-icons/fi";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const BatchReject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [search, setSearch] = useState("");

  // Ambil data dari halaman IjazahReject.jsx (dari Kode 2)
  const batchDariHalamanSebelumnya = location.state?.batch;
  const mahasiswaDariHalamanSebelumnya =
    location.state?.mahasiswa || batchDariHalamanSebelumnya?.mahasiswa || [];

  const batchData = batchDariHalamanSebelumnya || {
    batch: `Batch ${id || "1"}`,
    fakultas: "Fakultas Teknik dan Sains",
    tahun: "2025",
    status: "Reject",
  };

  const names = [
    "Adi Saputra",
    "Rani Maharani",
    "Budi Pratama",
    "Kayla Key",
    "Rizky Gusti A",
    "Risma Puspita",
    "Budi Doremi",
    "Siti Aisyah",
    "Eagle Al-Haikal",
    "Zahra Nabil",
    "Daffa Zaidan",
    "Fitri Handayani",
    "Gilang Ramadhan",
    "Hana Pertiwi",
    "Indra Wijaya",
  ];

  const prodiMap = {
    "Fakultas Teknik dan Sains": [
      "Teknik Informatika",
      "Teknik Mesin",
      "Teknik Sipil",
      "Teknik Elektro",
    ],
    "Fakultas Hukum": ["Ilmu Hukum", "Hukum Bisnis"],
    "Fakultas Ekonomi dan Bisnis": [
      "Manajemen",
      "Akuntansi",
      "Keuangan dan Perbankan",
    ],
    "Fakultas Agama Islam": [
      "Pendidikan Agama Islam",
      "Ekonomi Syariah",
      "Komunikasi dan Penyiaran Islam",
    ],
    "Fakultas Ilmu Kesehatan": ["Kesehatan Masyarakat", "Ilmu Gizi"],
    "Fakultas Keguruan dan Ilmu Pendidikan": [
      "Pendidikan Bahasa Inggris",
      "Teknologi Pendidikan",
    ],
  };

  // DATA DUMMY CADANGAN (dari Kode 2)
  const dummyMahasiswa = useMemo(() => {
    const selectedProdis = prodiMap[batchData.fakultas] || [
      "Program Studi Umum",
    ];

    return Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      nim: `2311060409${(i + 1).toString().padStart(2, "0")}`,
      nama: names[i % names.length],
      prodi: selectedProdis[i % selectedProdis.length],
      tahun: batchData.tahun || "2025",
      status: "Reject",
      batch: batchData.batch,
      fakultas: batchData.fakultas,
    }));
  }, [batchData]);

  // Gunakan data dari halaman sebelumnya jika ada, else gunakan dummy
  const mahasiswa =
    mahasiswaDariHalamanSebelumnya.length > 0
      ? mahasiswaDariHalamanSebelumnya.map((mhs, index) => ({
          ...mhs,
          id: mhs.id || index + 1,
          nim:
            mhs.nim ||
            mhs.npm ||
            `2311060409${(index + 1).toString().padStart(2, "0")}`,
          nama: mhs.nama || names[index % names.length],
          prodi: mhs.prodi || "Program Studi Umum",
          fakultas: mhs.fakultas || batchData.fakultas,
          tahun: mhs.tahun || batchData.tahun || "2025",
          status: mhs.status || "Reject",
          batch: batchData.batch,
        }))
      : dummyMahasiswa;

  const filteredData = mahasiswa
    .filter((item) => {
      const keyword = search.toLowerCase();

      return (
        item.nama.toLowerCase().includes(keyword) ||
        String(item.nim).includes(keyword) ||
        item.prodi.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      return a.nama.localeCompare(b.nama);
    });

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

  // ==========================================================================
  // HANDLE DETAIL MAHASISWA - ROUTE DARI KODE 1 (TIDAK DIUBAH)
  // ==========================================================================
  const handleDetailMahasiswa = (item) => {
    navigate(`/detail-mahasiswa/${item.nim}`, {
      state: item,
    });
  };

  return (
    <DashboardLayout>
      <div className="w-full pb-10">
        {/* HEADER - gaya dari Kode 2 */}
        <div className="mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
              Jumlah Ijazah Reject
            </h1>

            <p className="text-[#9CA3AF] text-[14px] font-medium">
              Update terakhir: 17 Januari 2026, 09:10 WIB •{" "}
              {batchData.fakultas}
            </p>
          </div>
        </div>

        {/* FILTER BOX - gaya dari Kode 2 */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          <div className="flex items-center bg-[#F3F4F6] rounded-lg px-4 h-[44px] w-full">
            <FiSearch className="text-gray-500 text-lg mr-3" />

            <input
              type="text"
              placeholder="Cari: Nama, NIM, Prodi"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full font-medium text-gray-700 placeholder-gray-500"
            />
          </div>
        </div>

        {/* TABLE SECTION - gaya dari Kode 2 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F7F7] text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-center">No</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-center">NIM</th>
                <th className="px-4 py-3 text-center">Program Studi</th>
                <th className="px-4 py-3 text-center">Tahun Lulus</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Detail</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, i) => (
                <tr
                  key={item.id || i}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-center">{i + 1}</td>

                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {item.nama}
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-800 text-center">
                    {item.nim}
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-800 text-center">
                    {item.prodi}
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-800 text-center">
                    {item.tahun}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block min-w-[86px] px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(
                        item.status || "Reject"
                      )}`}
                    >
                      {item.status || "Reject"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDetailMahasiswa(item)}
                      className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-100 transition"
                      title="Lihat Detail Mahasiswa"
                    >
                      <div className="w-3 h-3 border-t-2 border-b-2 border-gray-400"></div>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
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
      </div>
    </DashboardLayout>
  );
};

export default BatchReject;