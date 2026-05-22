import React, { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";

const DetailBatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil data dari halaman sebelumnya (state)
  const batchData = location.state || {
    batch: `Batch ${id || "1"}`,
    fakultas: "Fakultas Teknik dan Sains",
    tahun: "2026",
    periode: "Semester Ganjil",
  };

  const [search, setSearch] = useState("");

  const dummyMahasiswa = useMemo(() => {
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
      "Joko Susilo",
      "Kartika Sari",
      "Lestari Dewi",
      "Miftahul Jannah",
      "Nugroho Santoso",
    ];

    // Mapping Program Studi berdasarkan Fakultas
    const prodiMap = {
      "Fakultas Teknik dan Sains": [
        "Teknik Informatika",
        "Teknik Mesin",
        "Teknik Sipil",
        "Teknik Elektro",
        "Sistem Informasi",
      ],
      "Fakultas Hukum": [
        "Ilmu Hukum",
        "Hukum Bisnis",
      ],
      "Fakultas Ekonomi dan Bisnis": [
        "Manajemen",
        "Akuntansi",
        "Keuangan dan Perbankan",
        "Bisnis Digital",
      ],
      "Fakultas Agama Islam": [
        "Pendidikan Agama Islam",
        "Ekonomi Syariah",
        "Komunikasi dan Penyiaran Islam",
        "Hukum Keluarga Islam",
      ],
      "Fakultas Ilmu Kesehatan": [
        "Kesehatan Masyarakat",
        "Ilmu Gizi",
        "Keperawatan",
      ],
      "Fakultas Keguruan dan Ilmu Pendidikan": [
        "Pendidikan Bahasa Inggris",
        "Teknologi Pendidikan",
        "Pendidikan Matematika",
      ],
    };

    const selectedProdis = prodiMap[batchData.fakultas] || ["Program Studi Umum"];
    const totalMahasiswa = batchData.total || 45;

    return Array.from({ length: totalMahasiswa }, (_, i) => ({
      id: i + 1,
      nim: `23110604${String(i + 1).padStart(4, "0")}`,
      nama: names[i % names.length],
      prodi: selectedProdis[i % selectedProdis.length],
      tahun: batchData.tahun || "2026",
      status: batchData.status || "Proses",
      batch: batchData.batch,
      fakultas: batchData.fakultas,
    }));
  }, [batchData]);

  const filteredData = dummyMahasiswa.filter(
    (item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.nim.includes(search) ||
      item.prodi.toLowerCase().includes(search.toLowerCase())
  );

  // Hitung jumlah data per status
  const totalMahasiswa = filteredData.length;

  return (
    <DashboardLayout>
      <div className="w-full pb-10">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
              Detail Batch - {batchData.batch}
            </h1>
            <p className="text-[#9CA3AF] text-[14px] font-medium">
              Update terakhir: 17 Januari 2026, 09:10 WIB • {batchData.fakultas} • {batchData.periode} • {batchData.tahun}
            </p>
          </div>
        </div>

        {/* FILTER BOX */}
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

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
          <div className="max-h-[655px] overflow-y-auto relative">
            <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6">Nama</th>
                  <th className="py-4 px-6">NIM</th>
                  <th className="py-4 px-6">Program Studi</th>
                  <th className="py-4 px-6 text-center">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center w-24">Detail</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, i) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-center font-bold text-gray-800">
                      {i + 1}.
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {item.nama}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {item.nim}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {item.prodi}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      {item.tahun}
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block px-5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm ${
                          item.status === "Terbit"
                            ? "bg-[#27AE60] text-white"
                            : item.status === "Proses"
                            ? "bg-[#2F80ED] text-white"
                            : item.status === "Reject"
                            ? "bg-[#EF4444] text-white"
                            : item.status === "Revoke"
                            ? "bg-[#F59E0B] text-white"
                            : "bg-[#2F80ED] text-white"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* DETAIL */}
                    <td className="py-4 px-6 text-center">
                      <div
                        onClick={() =>
                          navigate(`/detail-mahasiswa/${item.nim}`, {
                            state: item,
                          })
                        }
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition"
                        title="Lihat Detail"
                      >
                        <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EMPTY STATE */}
          {filteredData.length === 0 && (
            <div className="py-8 text-center text-gray-500 font-medium">
              Data mahasiswa tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DetailBatch;