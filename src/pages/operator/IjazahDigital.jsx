// src/pages/operator/IjazahDigital.jsx

import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPrinter, FiDownload } from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";

const IjazahDigital = () => {
  const navigate = useNavigate();
  const { nim } = useParams();
  const { state } = useLocation();
  const mahasiswa = state;

  const nama = mahasiswa?.nama || "Muhammad Jameson";
  const nimVal = mahasiswa?.nim || nim || "2311002040506";
  const fakultas = mahasiswa?.fakultas || "Fakultas Teknik dan Sains";
  const prodi = mahasiswa?.prodi || "Teknik Informatika";
  const tahunLulus = mahasiswa?.tahunLulus || "2026";
  const tempatLahir = mahasiswa?.tempatLahir || "Bogor";
  const tanggalLahir = mahasiswa?.tanggalLahir || "18 Oktober 2004";
  
  const noSeriIjazah = `077/S.4.0/UIKA/${tahunLulus}`;
  const nomorPokok = "12345";
  const nik = "1400240000002";
  const tanggalKelulusan = `24 Juni ${tahunLulus}`;
  
  const getGelar = () => {
    const prodiLower = prodi.toLowerCase();
    if (prodiLower.includes("informatika") || prodiLower.includes("mesin") || prodiLower.includes("sipil")) {
      return "Bachelor of Engineering / Sarjana Teknik (S.T.)";
    }
    if (prodiLower.includes("manajemen") || prodiLower.includes("akuntansi") || prodiLower.includes("bisnis digital")) {
      return "Bachelor of Economics / Sarjana Ekonomi (S.E.)";
    }
    if (prodiLower.includes("hukum")) {
      return "Bachelor of Laws / Sarjana Hukum (S.H.)";
    }
    if (prodiLower.includes("agama") || prodiLower.includes("syariah")) {
      return "Bachelor of Arts / Sarjana Agama (S.Ag.)";
    }
    if (prodiLower.includes("kesehatan") || prodiLower.includes("gizi")) {
      return "Bachelor of Public Health / Sarjana Kesehatan Masyarakat (S.K.M.)";
    }
    if (prodiLower.includes("pendidikan")) {
      return "Bachelor of Education / Sarjana Pendidikan (S.Pd.)";
    }
    return "Sarjana (S.1)";
  };
  
  const gelar = getGelar();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Fitur download akan segera tersedia");
  };

  return (
    <DashboardLayout title="Ijazah Digital">
      <div className="w-full">
        <div className="flex items-center justify-between mb-5">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            <FiArrowLeft size={15} /> Kembali
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <FiPrinter size={15} /> Print
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B4B48] text-white text-sm font-semibold hover:bg-[#093b38] shadow-sm transition-all"
            >
              <FiDownload size={15} /> Download
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="border-4 border-[#0B4B48] rounded-xl p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%)" }}>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <div className="w-96 h-96 rounded-full border-8 border-[#0B4B48]" />
              </div>

              <div className="flex flex-wrap items-start justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#0B4B48] flex items-center justify-center flex-shrink-0">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="2"/>
                      <text x="24" y="30" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="serif">U</text>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#0B4B48]" style={{ fontFamily: "serif" }}>
                      Universitas Ibn Khaldun Bogor
                    </h1>
                    <p className="text-sm text-gray-600 italic mt-0.5">IJAZAH</p>
                    <p className="text-xs text-gray-500 italic">Certificate of Graduation</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <rect x="4" y="4" width="24" height="24" rx="2" fill="#0B4B48"/>
                      <rect x="8" y="8" width="16" height="16" rx="1" fill="white"/>
                      <rect x="12" y="12" width="8" height="8" fill="#0B4B48"/>
                      <rect x="36" y="4" width="24" height="24" rx="2" fill="#0B4B48"/>
                      <rect x="40" y="8" width="16" height="16" rx="1" fill="white"/>
                      <rect x="44" y="12" width="8" height="8" fill="#0B4B48"/>
                      <rect x="4" y="36" width="24" height="24" rx="2" fill="#0B4B48"/>
                      <rect x="8" y="40" width="16" height="16" rx="1" fill="white"/>
                      <rect x="12" y="44" width="8" height="8" fill="#0B4B48"/>
                      <rect x="36" y="36" width="6" height="6" fill="#0B4B48"/>
                      <rect x="46" y="36" width="6" height="6" fill="#0B4B48"/>
                      <rect x="56" y="36" width="4" height="4" fill="#0B4B48"/>
                      <rect x="36" y="46" width="4" height="4" fill="#0B4B48"/>
                      <rect x="44" y="44" width="8" height="4" fill="#0B4B48"/>
                      <rect x="36" y="54" width="6" height="6" fill="#0B4B48"/>
                      <rect x="50" y="50" width="10" height="10" fill="#0B4B48"/>
                    </svg>
                  </div>
                  <p className="text-[9px] text-gray-400 text-center mt-1">Scan QR</p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-[#0B4B48] to-transparent mb-6" />

              <p className="text-sm text-center text-gray-600 mb-6 leading-relaxed">
                Berkat Rahmat Allah Yang Maha Kuasa, dengan ini memberikan ijazah kepada:<br/>
                <span className="text-xs italic text-gray-400">By the Grace of Almighty Allah, this certificate is hereby awarded to:</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm mb-6">
                <div className="flex gap-2"><span className="text-gray-500 w-44">Tanggal Kelulusan</span><span className="font-semibold">: {tanggalKelulusan}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-44">Nama</span><span className="font-semibold">: {nama}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-44">NIM</span><span className="font-semibold">: {nimVal}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-44">Tempat & Tanggal Lahir</span><span className="font-semibold">: {tempatLahir}, {tanggalLahir}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-44">Nomor Seri Ijazah</span><span className="font-semibold">: {noSeriIjazah}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-44">Nomor Pokok Mahasiswa</span><span className="font-semibold">: {nomorPokok}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-44">NIK</span><span className="font-semibold">: {nik}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-44">Akreditasi</span><span className="font-semibold">: AIPT</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-44">Fakultas</span><span className="font-semibold">: {fakultas}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-44">Program Studi</span><span className="font-semibold">: {prodi}</span></div>
                <div className="flex gap-2"><span className="text-gray-500 w-44">Program</span><span className="font-semibold">: Strata 1</span></div>
              </div>

              <div className="mb-6">
                <span className="inline-block border-2 border-[#0B4B48] text-[#0B4B48] text-xs font-bold px-4 py-1 rounded">Unggul</span>
              </div>

              <p className="text-xs text-center text-gray-600 mb-4 leading-relaxed px-4">
                Kepadanya dilimpahkan segala wewenang dan hak yang berhubungan dengan ijazah ini, serta berhak menyandang gelar:<br/>
                <span className="italic text-gray-400">Therefore he/she has the authority and rights associated with the certificate, including the right to bear the academic degree of:</span>
              </p>

              <p className="text-center text-base font-bold text-[#0B4B48] mb-8">{gelar}</p>

              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="w-24 h-32 border-2 border-gray-300 rounded bg-gray-100 flex flex-col items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <p className="text-[9px] text-gray-400 mt-1">{nama.split(" ")[0]}</p>
                </div>

                <div className="flex flex-wrap gap-8">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Bogor, {tanggalKelulusan}</p>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Rektor</p>
                    <div className="h-10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#0B4B48]" style={{ fontFamily: "cursive" }}>Rektor</span>
                    </div>
                    <div className="h-px w-40 bg-gray-400 mt-2 mb-1" />
                    <p className="text-xs font-bold text-gray-700">Prof. Dr. H. L. Mujahidin, M.Si.</p>
                    <p className="text-[10px] text-gray-500">NIK. 410 100 562</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">&nbsp;</p>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Dekan</p>
                    <div className="h-10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#0B4B48]" style={{ fontFamily: "cursive" }}>Dekan</span>
                    </div>
                    <div className="h-px w-40 bg-gray-400 mt-2 mb-1" />
                    <p className="text-xs font-bold text-gray-700">Dr. Lumie Lumine, M.T.</p>
                    <p className="text-[10px] text-gray-500">NIK. 410 100 000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IjazahDigital;