import React, { useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { useAuth } from "../../pages/context/AuthContext";

const BatchTerbit = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 🔥 TAMBAHKAN INI
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || "";

  const [search, setSearch] = useState("");
  // ... sisa kode lainnya

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

  // Ambil data dari halaman IjazahTerbit.jsx (dari Kode 2)
  const batchDariHalamanSebelumnya = location.state?.batch;
  const mahasiswaDariHalamanSebelumnya =
    location.state?.mahasiswa || batchDariHalamanSebelumnya?.mahasiswa || [];

  const passedFakultasName =
    location.state?.fakultas || batchDariHalamanSebelumnya?.fakultas;

  const selectedFakultas = useMemo(() => {
    if (passedFakultasName) {
      const match = fakultasData.find((f) => f.nama === passedFakultasName);
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

  // DATA DUMMY CADANGAN (dari Kode 2)
  const mahasiswaDummy = useMemo(() => {
    return Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      nama: names[i % names.length],
      nim: `2311060409${(i + 1).toString().padStart(2, "0")}`,
      prodi: selectedFakultas.prodi[i % selectedFakultas.prodi.length],
      fakultas: selectedFakultas.nama,
      tahun: "2025",
      status: "Terbit",
      batch: batchDariHalamanSebelumnya?.batch || "Batch 15",
    }));
  }, [selectedFakultas, batchDariHalamanSebelumnya]);

  // Gunakan data dari halaman sebelumnya jika ada, else gunakan dummy
  const mahasiswa =
    mahasiswaDariHalamanSebelumnya.length > 0
      ? mahasiswaDariHalamanSebelumnya.map((mhs, idx) => ({
          ...mhs,
          id: mhs.id || idx + 1,
          nama: mhs.nama || names[idx % names.length],
          nim: mhs.nim || `2311060409${(idx + 1).toString().padStart(2, "0")}`,
          prodi: mhs.prodi || selectedFakultas.prodi[0],
          fakultas: mhs.fakultas || selectedFakultas.nama,
          tahun: mhs.tahun || batchDariHalamanSebelumnya?.tahun || "2025",
          status: mhs.status || "Terbit",
          batch: batchDariHalamanSebelumnya?.batch || "Batch 15",
        }))
      : mahasiswaDummy;

  const filteredMahasiswa = mahasiswa
    .filter((mhs) => {
      const keyword = search.toLowerCase();
      return (
        mhs.nama.toLowerCase().includes(keyword) ||
        String(mhs.nim).includes(keyword) ||
        mhs.prodi.toLowerCase().includes(keyword)
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
  // HANDLE DETAIL MAHASISWA - ROUTING DINAMIS BERDASARKAN ROLE
  // ==========================================================================
  const handleDetailMahasiswa = (mhs) => {
    const safeNim = encodeURIComponent(mhs.nim);

    // 🔥 FORMAT ULANG DATA: Menyamakan properti agar terbaca oleh DetailMahasiswa.jsx
    const formattedMahasiswa = {
      ...mhs,
      nama_mahasiswa: mhs.nama_mahasiswa || mhs.nama, 
      program_studi: mhs.program_studi || mhs.prodi,  
      tahun_lulus: mhs.tahun_lulus || mhs.tahun       
    };

    // Kirim data yang sudah diformat beserta info batch-nya (jika diperlukan)
    const navState = { 
      state: { 
        mahasiswa: formattedMahasiswa, 
        batch: batchDariHalamanSebelumnya || "Batch 15" 
      } 
    };

    if (userRole === "rektor") {
      navigate(`/rektor/detail-mahasiswa/${safeNim}`, navState);
    } else if (userRole.includes("operator")) {
      navigate(`/operator/detail-mahasiswa/${safeNim}`, navState);
    } else if (userRole.includes("admin")) {
      navigate(`/admin/detail-mahasiswa/${safeNim}`, navState);
    } else {
      // Masuk ke rute Verifikator
      navigate(`/verifikator/detail-mahasiswa/${safeNim}`, navState);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full pb-10">
      {/* BAGIAN HEADER & PENCARIAN */}
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col gap-4">
          
          {/* Header Text */}
          <div className="flex flex-col gap-1">
            <h1 className="text-[24px] md:text-[28px] font-bold text-gray-900 tracking-tight">
              Jumlah Ijazah Terbit
            </h1>
            <p className="text-[#9CA3AF] text-[13px] md:text-[14px] font-medium">
              Update terakhir: 17 Januari 2026, 09:10 WIB •{" "}
              {selectedFakultas?.nama || "Semua Fakultas"}
            </p>
          </div>

          {/* Search Box - Pindah ke kiri bawah text & lebarnya disesuaikan */}
          <div className="w-full sm:max-w-md mt-1">
            <div className="flex items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 focus-within:bg-white focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-xl px-4 h-[44px] transition-all duration-300 shadow-inner focus-within:shadow-sm">
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
        </div>

        {/* TABLE SECTION */}
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
              {filteredMahasiswa.map((mhs, i) => (
                <tr
                  key={mhs.id || i}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-center">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {mhs.nama}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 text-center">
                    {mhs.nim}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 text-center">
                    {mhs.prodi}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 text-center">
                    {mhs.tahun}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block min-w-[86px] px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(
                        mhs.status || "Terbit"
                      )}`}
                    >
                      {mhs.status || "Terbit"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDetailMahasiswa(mhs)}
                      className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-100 transition"
                      title="Lihat Detail Mahasiswa"
                    >
                      <div className="w-3 h-3 border-t-2 border-b-2 border-gray-400"></div>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredMahasiswa.length === 0 && (
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

export default BatchTerbit;