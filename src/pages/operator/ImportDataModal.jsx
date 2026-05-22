// src/components/ui/ImportDataModal.jsx

import React, { useState } from "react";
import { FiChevronDown, FiInfo, FiCheckCircle } from "react-icons/fi";

const ImportDataModal = ({ onClose, onSuccess }) => {
  const [tahun, setTahun] = useState("");
  const [periode, setPeriode] = useState("");
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startImport = () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulasi progress dari 0% ke 100%
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (onSuccess) onSuccess();
            setTimeout(() => {
              onClose();
            }, 1000);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleImport = () => {
    if (!tahun) {
      alert("Silakan pilih tahun lulus terlebih dahulu!");
      return;
    }
    if (!periode) {
      alert("Silakan pilih periode terlebih dahulu!");
      return;
    }
    if (!file) {
      alert("Silakan pilih file Excel terlebih dahulu!");
      return;
    }
    startImport();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileSize = selectedFile.size / 1024 / 1024;
      if (fileSize > 2) {
        alert("Ukuran file maksimal 2 MB!");
        return;
      }
      setFile(selectedFile);
    }
  };

  // Tampilan loading
  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-[999] bg-black/45 flex items-center justify-center">
        <div className="w-[520px] bg-white rounded-[8px] shadow-xl px-10 py-9 text-center">
          
          {/* Icon Progress */}
          <div className="mx-auto mb-4 w-[36px] h-[36px] rounded-full border border-[#0B6B63] flex items-center justify-center text-[12px] font-bold text-[#1F2937]">
            {progress}%
          </div>

          <h2 className="text-[22px] font-bold text-[#0B6B63] mb-5">
            {progress === 100 ? "Import Data Berhasil!" : "Sedang Memproses Data...."}
          </h2>

          <p className="text-[15px] text-[#1F2937] font-semibold leading-[22px] mb-8">
            Mohon tunggu sebentar,
            <br />
            sistem sedang melakukan penginputan data
          </p>

          {/* Progress Bar */}
          <div className="w-full h-[14px] bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0B6B63] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-right text-[9px] text-gray-500 font-bold mt-1">
            {progress}%
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black/45 flex items-center justify-center">
      <div className="w-[430px] bg-white rounded-[10px] shadow-xl px-8 py-7">

        <h2 className="text-[20px] font-bold text-[#1F2937]">
          Konfigurasi Unggahan Data
        </h2>

        <p className="text-[12px] text-gray-500 mt-1 mb-5 font-medium">
          Tentukan periode akademik sebelum memproses berkas Excel.
        </p>

        {/* Pilih Tahun Lulus */}
        <div className="mb-4">
          <label className="block text-[12px] font-bold text-[#1F2937] mb-2">
            Pilih Tahun Lulus <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className={`w-full h-[42px] rounded-[8px] border border-gray-300 px-4 pr-10 text-[12px] outline-none appearance-none font-medium focus:border-[#0B6B63] focus:ring-1 focus:ring-[#0B6B63] transition-all ${
                tahun ? "text-black" : "text-gray-400"
              }`}
            >
              <option value="">Pilih Tahun Lulus</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>

            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
          </div>
        </div>

        {/* Pilih Periode */}
        <div className="mb-4">
          <label className="block text-[12px] font-bold text-[#1F2937] mb-2">
            Pilih Periode <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className={`w-full h-[42px] rounded-[8px] border border-gray-300 px-4 pr-10 text-[12px] outline-none appearance-none font-medium focus:border-[#0B6B63] focus:ring-1 focus:ring-[#0B6B63] transition-all ${
                periode ? "text-black" : "text-gray-400"
              }`}
            >
              <option value="">Pilih Periode</option>
              <option value="Semester Ganjil">Semester Ganjil</option>
              <option value="Semester Genap">Semester Genap</option>
            </select>

            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
          </div>
        </div>

        {/* File Excel */}
        <div className="mb-4">
          <label className="block text-[12px] font-bold text-[#1F2937] mb-2">
            File Excel <span className="text-red-500">*</span>
          </label>

          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            className="block w-full text-[11px]
            file:mr-3
            file:py-1.5
            file:px-3
            file:rounded
            file:border-0
            file:text-[10px]
            file:bg-gray-100
            file:text-gray-700
            file:font-medium
            file:cursor-pointer
            hover:file:bg-gray-200
            cursor-pointer"
          />

          <p className="text-[9px] text-gray-500 mt-1">
            .xlsx (maksimal 2 MB)
          </p>
          {file && (
            <p className="text-[10px] text-[#0B6B63] font-medium mt-1">
              ✓ {file.name}
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="border border-gray-300 rounded-[8px] px-4 py-3 flex gap-3 items-start mb-6 bg-gray-50">
          <FiInfo className="text-[#0B6B63] text-[16px] mt-[2px] flex-shrink-0" />

          <p className="text-[10px] text-gray-600 leading-[14px] font-medium">
            Pastikan data dalam Excel sesuai dengan format yang telah di
            tentukan untuk periode akademik yang di pilih. Kesalahan
            pemilihan periode dapat berakibat pada duplikasi data.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-[38px] px-8 rounded-[8px] bg-[#E5E7EB] text-gray-600 text-[13px] font-bold hover:bg-gray-300 transition-all"
          >
            Batal
          </button>

          <button
            onClick={handleImport}
            className="h-[38px] px-7 rounded-[8px] bg-[#0B6B63] text-white text-[13px] font-bold hover:bg-[#09544e] transition-all shadow-sm"
          >
            Lanjutkan Import
          </button>
        </div>

      </div>
    </div>
  );
};

export default ImportDataModal;