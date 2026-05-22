import React, { useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { FiSearch } from "react-icons/fi";

const BatchTerbit = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const index = Number(id ?? 0);

  const fakultasData = [
    {
      nama: "Fakultas Teknik dan Sains",
      kode: "FTS",
      prodi: [
        "Teknik Informatika",
        "Teknik Mesin",
        "Teknik Sipil",
        "Sistem Informasi",
        "Ilmu Lingkungan",
        "Rekayasa Pertanian dan Biosistem",
        "Teknik Elektro",
      ],
    },
    {
      nama: "Fakultas Hukum",
      kode: "FH",
      prodi: ["Hukum Bisnis", "Ilmu Hukum"],
    },
    {
      nama: "Fakultas Ekonomi dan Bisnis",
      kode: "FEB",
      prodi: [
        "Manajemen",
        "Akuntansi",
        "Keuangan dan Perbankan",
        "Perbankan dan Keuangan Digital",
      ],
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
      prodi: ["Pendidikan Bahasa Inggris", "Teknologi Pendidikan"],
    },
  ];

  const passedFakultasName = location.state?.fakultas;

  const selectedFakultas = useMemo(() => {
    if (passedFakultasName) {
      const match = fakultasData.find(
        (f) => f.nama === passedFakultasName
      );

      if (match) return match;
    }

    return fakultasData[index % fakultasData.length];
  }, [passedFakultasName, index]);

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

  // TOTAL DATA 45
  const mahasiswa = useMemo(() => {
    return Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      nama: names[i % names.length],
      nim: `2311060409${(i + 1)
        .toString()
        .padStart(2, "0")}`,
      prodi:
        selectedFakultas.prodi[
          i % selectedFakultas.prodi.length
        ],
      fakultas: selectedFakultas.nama,
      tahun: "2025",
      status: "Terbit",
    }));
  }, [selectedFakultas]);

  const filteredMahasiswa = mahasiswa.filter((mhs) => {
    const keyword = search.toLowerCase();

    return (
      mhs.nama.toLowerCase().includes(keyword) ||
      mhs.nim.includes(keyword) ||
      mhs.prodi.toLowerCase().includes(keyword)
    );
  });

  return (
    <DashboardLayout>
      <div className="w-full pb-10">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
              Jumlah Ijazah Terbit
            </h1>

            <p className="text-[#9CA3AF] text-[14px] font-medium">
              Update terakhir: 17 Januari 2026, 09:10 WIB •{" "}
              {selectedFakultas.nama}
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

          {/* Hanya tampil 10 row di awal */}
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
                {filteredMahasiswa.map((mhs, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-center font-bold text-gray-800">
                      {i + 1}.
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900">
                      {mhs.nama}
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900">
                      {mhs.nim}
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900">
                      {mhs.prodi}
                    </td>

                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      {mhs.tahun}
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block bg-[#27AE60] text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
                        Terbit
                      </span>
                    </td>

                    {/* DETAIL */}
                    <td className="py-4 px-6 text-center">
                      <div
                        onClick={() =>
                          navigate(
                            `/detail-mahasiswa/${mhs.nim}`,
                            {
                              state: mhs,
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
          {filteredMahasiswa.length === 0 && (
            <div className="py-8 text-center text-gray-500 font-medium">
              Data mahasiswa tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BatchTerbit;