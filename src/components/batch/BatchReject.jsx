import React, { useMemo, useState } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch } from "react-icons/fi";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const BatchReject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Ambil data batch dari halaman sebelumnya
  const batchData = location.state || {
    batch: `Batch ${id || "1"}`,
    fakultas: "Fakultas Teknik dan Sains",
  };

  const [search, setSearch] = useState("");

  // DATA DUMMY
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
    ];

    const prodiMap = {
      "Fakultas Teknik dan Sains": [
        "Teknik Informatika",
        "Teknik Mesin",
        "Teknik Sipil",
        "Teknik Elektro",
      ],

      "Fakultas Hukum": [
        "Ilmu Hukum",
        "Hukum Bisnis",
      ],

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

      "Fakultas Ilmu Kesehatan": [
        "Kesehatan Masyarakat",
        "Ilmu Gizi",
      ],

      "Fakultas Keguruan dan Ilmu Pendidikan": [
        "Pendidikan Bahasa Inggris",
        "Teknologi Pendidikan",
      ],
    };

    const selectedProdis =
      prodiMap[batchData.fakultas] || [
        "Program Studi Umum",
      ];

    // TOTAL DATA 45
    return Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,

      nim: `2311060409${(i + 1)
        .toString()
        .padStart(2, "0")}`,

      nama: names[i % names.length],

      prodi:
        selectedProdis[
          i % selectedProdis.length
        ],

      tahun: "2025",

      status: "Reject",

      batch: batchData.batch,

      fakultas: batchData.fakultas,
    }));
  }, [batchData]);

  // FILTER SEARCH
  const filteredData = dummyMahasiswa.filter(
    (item) =>
      item.nama
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.nim.includes(search) ||
      item.prodi
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="w-full pb-10">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col gap-1">

            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
              Jumlah Ijazah Reject
            </h1>

            <p className="text-[#9CA3AF] text-[14px] font-medium">
              Update terakhir: 17 Januari 2026,
              09:10 WIB • {batchData.fakultas}
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
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="bg-transparent outline-none text-sm w-full font-medium text-gray-700 placeholder-gray-500"
            />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">

          {/* Awal tampil hanya 10 data */}
          <div className="max-h-[655px] overflow-y-auto relative">

            <table className="w-full text-sm text-left whitespace-nowrap border-collapse">

              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200 sticky top-0 z-10 shadow-sm">

                <tr>
                  <th className="py-4 px-6 text-center w-16">
                    No.
                  </th>

                  <th className="py-4 px-6">
                    Nama
                  </th>

                  <th className="py-4 px-6">
                    NIM
                  </th>

                  <th className="py-4 px-6">
                    Program Studi
                  </th>

                  <th className="py-4 px-6 text-center">
                    Tahun Lulus
                  </th>

                  <th className="py-4 px-6 text-center">
                    Status
                  </th>

                  <th className="py-4 px-6 text-center w-24">
                    Detail
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, i) => (
                  <tr
                    key={i}
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

                    {/* STATUS REJECT */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block bg-[#DC2626] text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
                        {item.status}
                      </span>
                    </td>

                    {/* DETAIL */}
                    <td className="py-4 px-6 text-center">
                      <div
                        onClick={() =>
                          navigate(
                            `/detail-mahasiswa/${item.nim}`,
                            {
                              state: item,
                            }
                          )
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

export default BatchReject;