// src/pages/operator/DetailBatchDokumenValid.jsx

import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";

// Data mahasiswa per batch dengan prodi sesuai fakultas
const getMahasiswaByBatch = (batchId, fakultas, tahunLulus) => {
  const baseNim = 900 + (batchId || 1);
  
  const dataByFakultas = {
    "Fakultas Teknik dan Sains": [
      { id: 1, nama: "Adi Saputra", nim: `23110604${baseNim}01`, prodi: "Teknik Informatika" },
      { id: 2, nama: "Budi Pratama", nim: `23110604${baseNim}02`, prodi: "Teknik Informatika" },
      { id: 3, nama: "Citra Dewi", nim: `23110604${baseNim}03`, prodi: "Teknik Informatika" },
      { id: 4, nama: "Dwi Cahyo", nim: `23110604${baseNim}04`, prodi: "Teknik Mesin" },
      { id: 5, nama: "Eka Putri", nim: `23110604${baseNim}05`, prodi: "Teknik Informatika" },
      { id: 6, nama: "Farhan Hidayat", nim: `23110604${baseNim}06`, prodi: "Teknik Sipil" },
      { id: 7, nama: "Gita Lestari", nim: `23110604${baseNim}07`, prodi: "Sistem Informasi" },
      { id: 8, nama: "Hendra Gunawan", nim: `23110604${baseNim}08`, prodi: "Teknik Informatika" },
      { id: 9, nama: "Indah Permatasari", nim: `23110604${baseNim}09`, prodi: "Teknik Mesin" },
      { id: 10, nama: "Joko Susilo", nim: `23110604${baseNim}10`, prodi: "Teknik Sipil" },
    ],
    "Fakultas Ekonomi dan Bisnis": [
      { id: 1, nama: "Maya Sari", nim: `23110604${baseNim}01`, prodi: "Manajemen" },
      { id: 2, nama: "Nanda Putra", nim: `23110604${baseNim}02`, prodi: "Akuntansi" },
      { id: 3, nama: "Oktavia Dewi", nim: `23110604${baseNim}03`, prodi: "Bisnis Digital" },
      { id: 4, nama: "Pramono Surya", nim: `23110604${baseNim}04`, prodi: "Manajemen" },
      { id: 5, nama: "Qonita Khairunnisa", nim: `23110604${baseNim}05`, prodi: "Akuntansi" },
      { id: 6, nama: "Raka Aditya", nim: `23110604${baseNim}06`, prodi: "Bisnis Digital" },
      { id: 7, nama: "Sinta Melati", nim: `23110604${baseNim}07`, prodi: "Manajemen" },
      { id: 8, nama: "Tasya Cantika", nim: `23110604${baseNim}08`, prodi: "Manajemen" },
      { id: 9, nama: "Zahra Nur", nim: `23110604${baseNim}09`, prodi: "Akuntansi" },
      { id: 10, nama: "Zulvikri", nim: `23110604${baseNim}10`, prodi: "Bisnis Digital" },
    ],
    "Fakultas Hukum": [
      { id: 1, nama: "Ahmad Zaki", nim: `23110604${baseNim}01`, prodi: "Ilmu Hukum" },
      { id: 2, nama: "Fajar Ramadhan", nim: `23110604${baseNim}02`, prodi: "Ilmu Hukum" },
      { id: 3, nama: "Putri Lestari", nim: `23110604${baseNim}03`, prodi: "Ilmu Hukum" },
      { id: 4, nama: "Dimas Nugraha", nim: `23110604${baseNim}04`, prodi: "Ilmu Hukum" },
      { id: 5, nama: "Citra Dewi", nim: `23110604${baseNim}05`, prodi: "Ilmu Hukum" },
      { id: 6, nama: "Teguh Santoso", nim: `23110604${baseNim}06`, prodi: "Ilmu Hukum" },
      { id: 7, nama: "Umi Kalsum", nim: `23110604${baseNim}07`, prodi: "Ilmu Hukum" },
      { id: 8, nama: "Vicky Firmansyah", nim: `23110604${baseNim}08`, prodi: "Ilmu Hukum" },
      { id: 9, nama: "Winda Sari", nim: `23110604${baseNim}09`, prodi: "Ilmu Hukum" },
      { id: 10, nama: "Xavier Nathaniel", nim: `23110604${baseNim}10`, prodi: "Ilmu Hukum" },
    ],
    "Fakultas Agama Islam": [
      { id: 1, nama: "Andi Wijaya", nim: `23110604${baseNim}01`, prodi: "Pendidikan Agama Islam" },
      { id: 2, nama: "Rizky Maulana", nim: `23110604${baseNim}02`, prodi: "Ekonomi Syariah" },
      { id: 3, nama: "Nabila Putri", nim: `23110604${baseNim}03`, prodi: "Pendidikan Agama Islam" },
      { id: 4, nama: "Yoga Pratama", nim: `23110604${baseNim}04`, prodi: "Ekonomi Syariah" },
      { id: 5, nama: "Dewi Kartika", nim: `23110604${baseNim}05`, prodi: "Pendidikan Agama Islam" },
      { id: 6, nama: "Yusuf Maulana", nim: `23110604${baseNim}06`, prodi: "Ekonomi Syariah" },
      { id: 7, nama: "Zahra Aulia", nim: `23110604${baseNim}07`, prodi: "Pendidikan Agama Islam" },
      { id: 8, nama: "Aisyah Putri", nim: `23110604${baseNim}08`, prodi: "Pendidikan Agama Islam" },
      { id: 9, nama: "Bambang Sutrisno", nim: `23110604${baseNim}09`, prodi: "Ekonomi Syariah" },
      { id: 10, nama: "Cindy Larasati", nim: `23110604${baseNim}10`, prodi: "Pendidikan Agama Islam" },
    ],
    "Fakultas Ilmu Kesehatan": [
      { id: 1, nama: "Hendra Gunawan", nim: `23110604${baseNim}01`, prodi: "Kesehatan Masyarakat" },
      { id: 2, nama: "Aulia Rahman", nim: `23110604${baseNim}02`, prodi: "Ilmu Gizi" },
      { id: 3, nama: "Farhan Kurniawan", nim: `23110604${baseNim}03`, prodi: "Kesehatan Masyarakat" },
      { id: 4, nama: "Sari Wijayanti", nim: `23110604${baseNim}04`, prodi: "Ilmu Gizi" },
      { id: 5, nama: "Rina Maharani", nim: `23110604${baseNim}05`, prodi: "Kesehatan Masyarakat" },
      { id: 6, nama: "Aisyah Putri", nim: `23110604${baseNim}06`, prodi: "Kesehatan Masyarakat" },
      { id: 7, nama: "Bambang Sutrisno", nim: `23110604${baseNim}07`, prodi: "Ilmu Gizi" },
      { id: 8, nama: "Cindy Larasati", nim: `23110604${baseNim}08`, prodi: "Kesehatan Masyarakat" },
      { id: 9, nama: "Dedi Kurniawan", nim: `23110604${baseNim}09`, prodi: "Ilmu Gizi" },
      { id: 10, nama: "Erisa Anggraini", nim: `23110604${baseNim}10`, prodi: "Kesehatan Masyarakat" },
    ],
    "Fakultas Keguruan dan Ilmu Pendidikan": [
      { id: 1, nama: "Indra Saputra", nim: `23110604${baseNim}01`, prodi: "Pendidikan Bahasa Inggris" },
      { id: 2, nama: "Maya Sari", nim: `23110604${baseNim}02`, prodi: "Teknologi Pendidikan" },
      { id: 3, nama: "Agus Salim", nim: `23110604${baseNim}03`, prodi: "Pendidikan Bahasa Inggris" },
      { id: 4, nama: "Rina Wulandari", nim: `23110604${baseNim}04`, prodi: "Teknologi Pendidikan" },
      { id: 5, nama: "Eko Prasetyo", nim: `23110604${baseNim}05`, prodi: "Pendidikan Bahasa Inggris" },
      { id: 6, nama: "Dedi Kurniawan", nim: `23110604${baseNim}06`, prodi: "Pendidikan Bahasa Inggris" },
      { id: 7, nama: "Erisa Anggraini", nim: `23110604${baseNim}07`, prodi: "Teknologi Pendidikan" },
      { id: 8, nama: "Febriyanto", nim: `23110604${baseNim}08`, prodi: "Pendidikan Bahasa Inggris" },
      { id: 9, nama: "Gita Lestari", nim: `23110604${baseNim}09`, prodi: "Teknologi Pendidikan" },
      { id: 10, nama: "Hendra Gunawan", nim: `23110604${baseNim}10`, prodi: "Pendidikan Bahasa Inggris" },
    ],
  };

  const list = dataByFakultas[fakultas] || dataByFakultas["Fakultas Teknik dan Sains"];
  return list.map(m => ({ ...m, tahunLulus: tahunLulus, status: "Terbit" }));
};

const DetailBatchDokumenValid = () => {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const { state } = useLocation();
  const batch = state;
  const [search, setSearch] = useState("");

  const mahasiswaList = batch ? getMahasiswaByBatch(batch.id, batch.fakultas, batch.tahunLulus) : [];
  
  const filtered = mahasiswaList.filter((m) => {
    const q = search.toLowerCase();
    return m.nama.toLowerCase().includes(q) || m.nim.includes(q) || m.prodi.toLowerCase().includes(q);
  });

  if (!batch) {
    return (
      <DashboardLayout title="Dokumen Valid - Detail Batch">
        <div className="w-full text-center py-10">
          <p className="text-gray-500 mb-3">Data batch tidak ditemukan.</p>
          <button 
            onClick={() => navigate("/operator/dokumen-valid")} 
            className="text-[#115E59] font-bold hover:underline"
          >
            ← Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Dokumen Valid - ${batch.listBatch}`}>
      <div className="w-full">
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-[#0B6B63] mb-4 transition-colors"
        >
          <FiArrowLeft size={18} />
          <span className="text-sm font-medium">Kembali</span>
        </button>

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Daftar Mahasiswa</h1>
          <p className="text-sm text-gray-400 mt-1">{batch.listBatch} · {batch.fakultas} · {batch.tahunLulus}</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 mb-5">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Cari: Nama, NIM, Prodi"
              className="w-full h-11 bg-[#F3F4F6] rounded-xl pl-11 pr-4 outline-none text-sm border border-transparent focus:border-[#0B4B48]" 
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-[#F9FAFB] border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 text-left">Nama</th>
                  <th className="py-4 px-6 text-center">NIM</th>
                  <th className="py-4 px-6 text-center">Program Studi</th>
                  <th className="py-4 px-6 text-center">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center w-24">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((mhs, idx) => (
                  <tr key={mhs.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{idx + 1}.</td>
                    <td className="py-4 px-6 font-bold text-gray-800">{mhs.nama}</td>
                    <td className="py-4 px-6 text-center font-bold text-gray-700">{mhs.nim}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{mhs.prodi}</td>
                    <td className="py-4 px-6 text-center font-bold text-gray-700">{mhs.tahunLulus}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#16A36B] text-white">Terbit</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => navigate(`/operator/detail-dokumen-valid/${mhs.id}`, { 
                          state: { 
                            ...mhs, 
                            batch: batch.listBatch, 
                            fakultas: batch.fakultas,
                            tahunLulus: batch.tahunLulus
                          } 
                        })}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition"
                      >
                        <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">Menampilkan {filtered.length} dari {mahasiswaList.length} Data</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DetailBatchDokumenValid;