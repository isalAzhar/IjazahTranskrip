import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/ui/DashboardLayout";

const BatchTerbit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const index = Number(id ?? 0);

  const fakultasData = [
    {
      nama: "Fakultas Teknik dan Sains",
      prodi: ["Teknik Informatika", "Teknik Mesin", "Teknik Sipil"],
    },
    {
      nama: "Fakultas Ekonomi dan Bisnis",
      prodi: ["Manajemen", "Akuntansi"],
    },
    {
      nama: "Fakultas Hukum",
      prodi: ["Ilmu Hukum"],
    },
    {
      nama: "Fakultas Ilmu Kesehatan",
      prodi: ["Keperawatan", "Kesehatan Masyarakat"],
    },
  ];

  const selectedFakultas =
    fakultasData[index % fakultasData.length];

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
    "Hendra Gunawan",
    "Aulia Rahman",
    "Dewi Kartika",
  ];

  const mahasiswa = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const randomNama =
        namaList[Math.floor(Math.random() * namaList.length)];

      const randomProdi =
        selectedFakultas.prodi[
          Math.floor(Math.random() * selectedFakultas.prodi.length)
        ];

      return {
        id: i,
        nama: randomNama,
        nim: `2311060409${String(i + 1).padStart(2, "0")}`,
        prodi: randomProdi,
        fakultas: selectedFakultas.nama,
        tahun: "2026",
      };
    });
  }, [index]);

  return (
    <DashboardLayout>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">

        <div>
          <h1 className="text-2xl font-bold">
            Data Ijazah Terbit
          </h1>

          <p className="text-gray-400 text-sm mt-1 leading-tight max-w-xl">
            Daftar mahasiswa dengan status ijazah terbit
          </p>

          <p className="text-gray-400 text-sm">
            {selectedFakultas.nama}
          </p>
        </div>

        <button
          onClick={() => navigate("/ijazah-terbit")}
          className="text-sm text-[#27AE60] font-semibold"
        >
          ← Kembali
        </button>

      </div>

      {/* TABLE */}
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
            {mahasiswa.map((mhs, i) => (
              <tr
                key={i}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-center">
                  {i + 1}
                </td>

                <td className="px-4 py-3 font-medium text-gray-800">
                  {mhs.nama}
                </td>

                <td className="px-4 py-3 text-center">
                  {mhs.nim}
                </td>

                <td className="px-4 py-3 text-center">
                  {mhs.prodi}
                </td>

                <td className="px-4 py-3 text-center">
                  {mhs.tahun}
                </td>

                {/* STATUS TERBIT */}
                <td className="px-4 py-3 text-center">
                  <span className="bg-[#27AE60] text-white px-3 py-1 rounded-full text-xs font-medium">
                    Terbit
                  </span>
                </td>

                {/* DETAIL */}
                <td className="px-4 py-3 text-center">
                  <div
                    onClick={() =>
                      navigate("/detail-mahasiswa", {
                        state: { mahasiswa: mhs },
                      })
                    }
                    className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="w-3 h-3 border-t-2 border-b-2 border-gray-400"></div>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
};

export default BatchTerbit;