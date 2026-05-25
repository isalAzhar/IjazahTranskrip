// src/components/ui/ImportDataModal.jsx

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FiChevronDown, FiInfo, FiCheckCircle, FiAlertCircle, FiX, FiFileText, FiDownload } from "react-icons/fi";

const ImportDataModal = ({ onClose, onSuccess }) => {
  const [tahun, setTahun] = useState("");
  const [periode, setPeriode] = useState("");
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [importResult, setImportResult] = useState({
    success: [],
    failed: [],
    totalSuccess: 0,
    totalFailed: 0,
    totalData: 0,
    importInfo: {
      tahun: "",
      periode: "",
      fakultas: []
    }
  });

  // Mapping kolom Excel ke field yang dibutuhkan
  const mapExcelData = (row) => {
    return {
      nim: row.nim ? String(row.nim).trim() : "",
      nik: row.nik ? String(row.nik).trim() : "",
      nomorSeriIjazah: row.nomor_seri_ijazah ? String(row.nomor_seri_ijazah).trim() : "",
      pisn: row.pisn ? String(row.pisn).trim() : "",
      nama: row.nama_mahasiswa || "",
      fakultas: getFakultasFromProdi(row.nama_prodi || ""),
      prodi: row.nama_prodi || "",
      tahunLulus: row.tahun_lulus ? String(row.tahun_lulus) : "",
      tempatLahir: row.tempat_lahir || "",
      tanggalLahir: row.tanggal_lahir || "",
      jenisKelamin: row.jenis_kelamin || "",
      email: row.email || "",
      noTelp: row.telepon ? String(row.telepon) : "",
      ipk: row.ipk || "",
      predikat: row.predikat || "",
      judulSkripsi: row.judul_skripsi || "",
      statusKelulusan: row.status_kelulusan || "",
      tanggalKelulusan: row.tanggal_kelulusan || ""
    };
  };

  // Mendapatkan fakultas berdasarkan prodi
  const getFakultasFromProdi = (prodi) => {
    const fakultasMap = {
      "Teknik Informatika": "Fakultas Teknik dan Sains",
      "Teknik Mesin": "Fakultas Teknik dan Sains",
      "Teknik Sipil": "Fakultas Teknik dan Sains",
      "Sistem Informasi": "Fakultas Teknik dan Sains",
      "Teknik Elektro": "Fakultas Teknik dan Sains",
      "Ilmu Lingkungan": "Fakultas Teknik dan Sains",
      "Manajemen": "Fakultas Ekonomi dan Bisnis",
      "Akuntansi": "Fakultas Ekonomi dan Bisnis",
      "Bisnis Digital": "Fakultas Ekonomi dan Bisnis",
      "Ilmu Hukum": "Fakultas Hukum",
      "Pendidikan Agama Islam": "Fakultas Agama Islam",
      "Ekonomi Syariah": "Fakultas Agama Islam",
      "Kesehatan Masyarakat": "Fakultas Ilmu Kesehatan",
      "Ilmu Gizi": "Fakultas Ilmu Kesehatan",
      "Pendidikan Bahasa Inggris": "Fakultas Keguruan dan Ilmu Pendidikan",
      "Teknologi Pendidikan": "Fakultas Keguruan dan Ilmu Pendidikan"
    };
    return fakultasMap[prodi] || "Fakultas Teknik dan Sains";
  };

  // Cek duplikat untuk NIM, NIK, Nomor Seri Ijazah, dan PISN
  const checkDuplicateFields = (data) => {
    const nimMap = new Map();
    const nikMap = new Map();
    const nomorSeriIjazahMap = new Map();
    const pisnMap = new Map();
    const duplicateFields = new Set();
    
    // First pass: detect duplicates for each field
    data.forEach((item, index) => {
      const nim = item.nim;
      const nik = item.nik;
      const nomorSeriIjazah = item.nomorSeriIjazah;
      const pisn = item.pisn;
      
      // Check NIM duplicate
      if (nim && nim !== "") {
        if (nimMap.has(nim)) {
          duplicateFields.add(`NIM: ${nim}`);
          const prevIndex = nimMap.get(nim);
          if (data[prevIndex] && !data[prevIndex]._duplicateFields) {
            data[prevIndex]._duplicateFields = data[prevIndex]._duplicateFields || [];
            data[prevIndex]._duplicateFields.push(`NIM (${nim})`);
          }
        } else {
          nimMap.set(nim, index);
        }
      }
      
      // Check NIK duplicate
      if (nik && nik !== "") {
        if (nikMap.has(nik)) {
          duplicateFields.add(`NIK: ${nik}`);
          const prevIndex = nikMap.get(nik);
          if (data[prevIndex] && !data[prevIndex]._duplicateFields) {
            data[prevIndex]._duplicateFields = data[prevIndex]._duplicateFields || [];
            data[prevIndex]._duplicateFields.push(`NIK (${nik})`);
          }
        } else {
          nikMap.set(nik, index);
        }
      }
      
      // Check Nomor Seri Ijazah duplicate
      if (nomorSeriIjazah && nomorSeriIjazah !== "") {
        if (nomorSeriIjazahMap.has(nomorSeriIjazah)) {
          duplicateFields.add(`Nomor Seri Ijazah: ${nomorSeriIjazah}`);
          const prevIndex = nomorSeriIjazahMap.get(nomorSeriIjazah);
          if (data[prevIndex] && !data[prevIndex]._duplicateFields) {
            data[prevIndex]._duplicateFields = data[prevIndex]._duplicateFields || [];
            data[prevIndex]._duplicateFields.push(`Nomor Seri Ijazah (${nomorSeriIjazah})`);
          }
        } else {
          nomorSeriIjazahMap.set(nomorSeriIjazah, index);
        }
      }
      
      // Check PISN duplicate
      if (pisn && pisn !== "") {
        if (pisnMap.has(pisn)) {
          duplicateFields.add(`PISN: ${pisn}`);
          const prevIndex = pisnMap.get(pisn);
          if (data[prevIndex] && !data[prevIndex]._duplicateFields) {
            data[prevIndex]._duplicateFields = data[prevIndex]._duplicateFields || [];
            data[prevIndex]._duplicateFields.push(`PISN (${pisn})`);
          }
        } else {
          pisnMap.set(pisn, index);
        }
      }
    });
    
    // Second pass: mark all items that have duplicate fields
    data.forEach((item, index) => {
      const nim = item.nim;
      const nik = item.nik;
      const nomorSeriIjazah = item.nomorSeriIjazah;
      const pisn = item.pisn;
      
      const duplicateTypes = [];
      
      if (nim && nim !== "" && nimMap.has(nim) && nimMap.get(nim) !== index) {
        duplicateTypes.push(`NIM (${nim})`);
      }
      if (nik && nik !== "" && nikMap.has(nik) && nikMap.get(nik) !== index) {
        duplicateTypes.push(`NIK (${nik})`);
      }
      if (nomorSeriIjazah && nomorSeriIjazah !== "" && nomorSeriIjazahMap.has(nomorSeriIjazah) && nomorSeriIjazahMap.get(nomorSeriIjazah) !== index) {
        duplicateTypes.push(`Nomor Seri Ijazah (${nomorSeriIjazah})`);
      }
      if (pisn && pisn !== "" && pisnMap.has(pisn) && pisnMap.get(pisn) !== index) {
        duplicateTypes.push(`PISN (${pisn})`);
      }
      
      if (duplicateTypes.length > 0) {
        item._duplicateFields = duplicateTypes;
      }
    });
    
    return duplicateFields;
  };

  // Validasi data
  const validateData = (data, tahun, periode, duplicateFields = []) => {
    const requiredFields = ['nama', 'nim', 'fakultas', 'prodi', 'tahunLulus', 'tempatLahir', 'tanggalLahir', 'jenisKelamin', 'email', 'noTelp'];
    const validFakultas = ["Fakultas Teknik dan Sains", "Fakultas Ekonomi dan Bisnis", "Fakultas Hukum", "Fakultas Agama Islam", "Fakultas Ilmu Kesehatan", "Fakultas Keguruan dan Ilmu Pendidikan"];
    const validProdi = {
      "Fakultas Teknik dan Sains": ["Teknik Informatika", "Teknik Mesin", "Teknik Sipil", "Sistem Informasi", "Teknik Elektro", "Ilmu Lingkungan"],
      "Fakultas Ekonomi dan Bisnis": ["Manajemen", "Akuntansi", "Bisnis Digital"],
      "Fakultas Hukum": ["Ilmu Hukum"],
      "Fakultas Agama Islam": ["Pendidikan Agama Islam", "Ekonomi Syariah"],
      "Fakultas Ilmu Kesehatan": ["Kesehatan Masyarakat", "Ilmu Gizi"],
      "Fakultas Keguruan dan Ilmu Pendidikan": ["Pendidikan Bahasa Inggris", "Teknologi Pendidikan"]
    };
    
    const errors = [];
    
    // Cek duplikat field (NIM, NIK, Nomor Seri Ijazah, PISN)
    if (duplicateFields && duplicateFields.length > 0) {
      duplicateFields.forEach(field => {
        errors.push(`${field} duplikat dalam file Excel`);
      });
    }
    
    // Cek field wajib
    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push(`${field} tidak boleh kosong`);
      }
    }
    
    // Cek fakultas valid
    if (data.fakultas && !validFakultas.includes(data.fakultas)) {
      errors.push(`Fakultas "${data.fakultas}" tidak valid`);
    }
    
    // Cek prodi sesuai fakultas
    if (data.fakultas && data.prodi && validProdi[data.fakultas] && !validProdi[data.fakultas].includes(data.prodi)) {
      errors.push(`Program Studi "${data.prodi}" tidak sesuai dengan Fakultas "${data.fakultas}"`);
    }
    
    // Cek tahun lulus sesuai periode
    if (data.tahunLulus && tahun && String(data.tahunLulus) !== String(tahun)) {
      errors.push(`Tahun Lulus "${data.tahunLulus}" tidak sesuai dengan pilihan "${tahun}"`);
    }
    
    // Cek format NIM (harus 10 digit)
    if (data.nim && !/^\d{10}$/.test(String(data.nim))) {
      errors.push(`NIM "${data.nim}" harus 10 digit angka`);
    }
    
    // Cek format NIK (harus 16 digit)
    if (data.nik && data.nik !== "" && !/^\d{16}$/.test(String(data.nik))) {
      errors.push(`NIK "${data.nik}" harus 16 digit angka`);
    }
    
    // Cek format email
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push(`Email "${data.email}" tidak valid`);
    }

    // Cek format telepon
    if (data.noTelp && !/^\d{10,13}$/.test(String(data.noTelp))) {
      errors.push(`Nomor Telepon "${data.noTelp}" tidak valid (minimal 10 digit, maksimal 13 digit)`);
    }

    // Cek format tanggal lahir
    if (data.tanggalLahir) {
      const isValidDate = !isNaN(new Date(data.tanggalLahir).getTime());
      if (!isValidDate) {
        errors.push(`Tanggal Lahir "${data.tanggalLahir}" tidak valid`);
      }
    }
    
    return errors;
  };

  // Membaca file Excel
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Mendapatkan daftar fakultas unik dari data
  const getUniqueFakultas = (data) => {
    const fakultasSet = new Set();
    data.forEach(item => {
      if (item.fakultas) {
        fakultasSet.add(item.fakultas);
      }
    });
    return Array.from(fakultasSet);
  };

  // Proses import data
  const processImport = async (file, tahun, periode) => {
    try {
      const excelData = await readExcelFile(file);
      const mappedData = excelData.map((row, index) => ({
        nomor: index + 1,
        ...mapExcelData(row)
      }));

      // Cek duplikat untuk NIM, NIK, Nomor Seri Ijazah, dan PISN
      checkDuplicateFields(mappedData);
      
      const success = [];
      const failed = [];
      
      mappedData.forEach(item => {
        // Ambil daftar field yang duplikat
        const duplicateFields = item._duplicateFields || [];
        
        const errors = validateData(item, tahun, periode, duplicateFields);
        
        if (errors.length === 0) {
          success.push(item);
        } else {
          failed.push({ ...item, errors });
        }
      });
      
      const uniqueFakultas = getUniqueFakultas([...success, ...failed]);
      
      return { 
        success, 
        failed, 
        totalSuccess: success.length, 
        totalFailed: failed.length, 
        totalData: mappedData.length,
        importInfo: {
          tahun: tahun,
          periode: periode,
          fakultas: uniqueFakultas
        }
      };
    } catch (error) {
      console.error("Error reading Excel file:", error);
      return { 
        success: [], 
        failed: [], 
        totalSuccess: 0, 
        totalFailed: 0, 
        totalData: 0,
        importInfo: {
          tahun: tahun,
          periode: periode,
          fakultas: []
        }
      };
    }
  };

  const startImport = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulasi progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Proses import data
    const result = await processImport(file, tahun, periode);
    
    clearInterval(interval);
    setProgress(100);
    setImportResult(result);
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowResult(true);
    }, 500);
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

  const handleClose = () => {
    setShowResult(false);
    setImportResult({ success: [], failed: [], totalSuccess: 0, totalFailed: 0, totalData: 0, importInfo: { tahun: "", periode: "", fakultas: [] } });
    setTahun("");
    setPeriode("");
    setFile(null);
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  // Tampilan loading
  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-[999] bg-black/45 flex items-center justify-center">
        <div className="w-[520px] bg-white rounded-[8px] shadow-xl px-10 py-9 text-center">
          <div className="mx-auto mb-4 w-[36px] h-[36px] rounded-full border border-[#0B6B63] flex items-center justify-center text-[12px] font-bold text-[#1F2937]">
            {progress}%
          </div>
          <h2 className="text-[22px] font-bold text-[#0B6B63] mb-5">
            Sedang Memproses Data....
          </h2>
          <p className="text-[15px] text-[#1F2937] font-semibold leading-[22px] mb-8">
            Mohon tunggu sebentar,
            <br />
            sistem sedang melakukan penginputan data
          </p>
          <div className="w-full h-[14px] bg-[#E5E7EB] rounded-full overflow-hidden">
            <div className="h-full bg-[#0B6B63] rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-right text-[9px] text-gray-500 font-bold mt-1">{progress}%</div>
        </div>
      </div>
    );
  }

  // Tampilan hasil import
  if (showResult) {
    const { failed, totalSuccess, totalFailed, totalData, importInfo } = importResult;
    const isAllSuccess = totalFailed === 0;
    
    return (
      <div className="fixed inset-0 z-[999] bg-black/45 flex items-center justify-center p-4">
        <div className="w-[800px] max-h-[85vh] bg-white rounded-[10px] shadow-xl overflow-hidden">
          <div className={`px-6 py-4 ${isAllSuccess ? 'bg-green-50 border-b border-green-200' : 'bg-yellow-50 border-b border-yellow-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isAllSuccess ? (
                  <FiCheckCircle className="text-green-600 text-2xl" />
                ) : (
                  <FiAlertCircle className="text-yellow-600 text-2xl" />
                )}
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {isAllSuccess ? "Import Data Berhasil!" : "Import Data Selesai"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {totalSuccess} data berhasil diimport, {totalFailed} data gagal
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <FiX size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[65vh]">
            {/* Informasi Import */}
            <div className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Informasi Import</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Tahun Lulus:</span>
                  <span className="ml-2 font-medium text-gray-800">{importInfo.tahun || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Periode:</span>
                  <span className="ml-2 font-medium text-gray-800">{importInfo.periode || "-"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Fakultas yang terdeteksi:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {importInfo.fakultas.length > 0 ? (
                      importInfo.fakultas.map((fak, idx) => (
                        <span key={idx} className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
                          {fak}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-[10px]">Tidak ada fakultas terdeteksi</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Data Gagal - Yang Utama Ditampilkan */}
            {failed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FiAlertCircle className="text-red-600 text-sm" />
                  <h3 className="font-semibold text-gray-800">Data Gagal Diimport ({failed.length})</h3>
                  <span className="text-xs text-gray-400 ml-auto">*NIM, NIK, Nomor Seri Ijazah, atau PISN yang duplikat akan otomatis gagal import</span>
                </div>
                <div className="border border-red-200 rounded-lg overflow-hidden">
                  <div className="max-h-[400px] overflow-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-red-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left w-10">No</th>
                          <th className="px-3 py-2 text-left w-24">NIM</th>
                          <th className="px-3 py-2 text-left w-24">NIK</th>
                          <th className="px-3 py-2 text-left w-28">Nomor Seri Ijazah</th>
                          <th className="px-3 py-2 text-left w-20">PISN</th>
                          <th className="px-3 py-2 text-left w-32">Nama</th>
                          <th className="px-3 py-2 text-left w-48">Keterangan Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {failed.map((item, idx) => (
                          <tr key={idx} className="border-b border-red-100 hover:bg-red-50/50">
                            <td className="px-3 py-2 align-top">{item.nomor}</td>
                            <td className="px-3 py-2 align-top font-mono text-gray-700">
                              {item.nim || "-"}
                              {item._duplicateFields?.some(f => f.includes("NIM")) && (
                                <span className="ml-1 inline-block px-1 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-medium">duplikat</span>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top font-mono text-gray-700">
                              {item.nik || "-"}
                              {item._duplicateFields?.some(f => f.includes("NIK")) && (
                                <span className="ml-1 inline-block px-1 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-medium">duplikat</span>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top font-mono text-gray-700">
                              {item.nomorSeriIjazah || "-"}
                              {item._duplicateFields?.some(f => f.includes("Nomor Seri Ijazah")) && (
                                <span className="ml-1 inline-block px-1 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-medium">duplikat</span>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top font-mono text-gray-700">
                              {item.pisn || "-"}
                              {item._duplicateFields?.some(f => f.includes("PISN")) && (
                                <span className="ml-1 inline-block px-1 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-medium">duplikat</span>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              <div className="text-gray-800 font-medium">{item.nama || "(Nama kosong)"}</div>
                            </td>
                            <td className="px-3 py-2 align-top">
                              {item.errors?.map((err, i) => (
                                <div key={i} className="text-red-600 text-[10px] mb-0.5">• {err}</div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Jika tidak ada data gagal */}
            {failed.length === 0 && totalData > 0 && (
              <div className="text-center py-8">
                <FiCheckCircle className="text-green-500 text-4xl mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Semua data berhasil diimport!</p>
                <p className="text-gray-400 text-xs mt-1">Total {totalSuccess} data mahasiswa</p>
              </div>
            )}

            {/* Jika tidak ada data sama sekali */}
            {totalData === 0 && (
              <div className="text-center py-8">
                <FiAlertCircle className="text-yellow-500 text-4xl mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Tidak ada data yang dapat diproses</p>
                <p className="text-gray-400 text-xs mt-1">Pastikan file Excel memiliki data yang valid</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="h-[38px] px-6 rounded-[8px] bg-[#0B6B63] text-white text-[13px] font-bold hover:bg-[#09544e] transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan form import
  return (
    <div className="fixed inset-0 z-[999] bg-black/45 flex items-center justify-center">
      <div className="w-[430px] bg-white rounded-[10px] shadow-xl px-8 py-7">
        <h2 className="text-[20px] font-bold text-[#1F2937]">Konfigurasi Unggahan Data</h2>
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
              <option value="2026">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
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
          <p className="text-[9px] text-gray-500 mt-1">.xlsx (maksimal 2 MB)</p>
          {file && (
            <div className="flex items-center gap-2 mt-2">
              <FiFileText className="text-[#0B6B63] text-[12px]" />
              <p className="text-[10px] text-[#0B6B63] font-medium">{file.name}</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="border border-gray-300 rounded-[8px] px-4 py-3 flex gap-3 items-start mb-6 bg-gray-50">
          <FiInfo className="text-[#0B6B63] text-[16px] mt-[2px] flex-shrink-0" />
          <div className="text-[10px] text-gray-600 leading-[14px] font-medium">
            <p>Pastikan data dalam Excel sesuai dengan format yang telah di tentukan untuk periode akademik yang di pilih. Kesalahan pemilihan periode dapat berakibat pada duplikasi data.</p>
            <p className="text-red-500 mt-1">*NIM, NIK, Nomor Seri Ijazah, dan PISN yang sama dalam file Excel akan otomatis gagal import</p>
          </div>
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