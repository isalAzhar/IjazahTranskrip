// src/pages/operator/ImportDataModal.jsx
import React, { useState } from "react";
import { uploadInboundExcel } from "@/services/api";
import * as XLSX from "xlsx";
import {
  FiChevronDown,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiFileText,
  FiDownload,
} from "react-icons/fi";

const initialImportResult = {
  success: [],
  failed: [],
  totalSuccess: 0,
  totalFailed: 0,
  totalData: 0,
  totalBatch: 0,
  message: "",
  ditolak: false,
  importInfo: {
    tahun: "",
    periode: "",
    fakultas: [],
  },
  mahasiswaData: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  },
  batchIds: [],
};

const ImportDataModal = ({ onClose, onSuccess }) => {
  const [tahun, setTahun] = useState("");
  const [periode, setPeriode] = useState("");
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [importResult, setImportResult] = useState(initialImportResult);

  const currentYear = new Date().getFullYear();

const tahunLulusOptions = Array.from(
  { length: 3 },
  (_, index) => currentYear - 2 + index,
);

  // Download data gagal dari response upload sebagai Excel
  const downloadFailedData = () => {
    if (
      !Array.isArray(importResult.failed) ||
      importResult.failed.length === 0
    ) {
      alert("Tidak ada data gagal untuk didownload.");
      return;
    }

    const failedDataForExcel = importResult.failed.map((item, index) => ({
      No: index + 1,
      "Baris Excel": item.nomor ?? "-",
      NIM: item.nim ?? "-",
      "Nama Mahasiswa": item.nama ?? "-",
      "Field Error": formatFieldName(item.field),
      "Keterangan Error": Array.isArray(item.errors)
        ? item.errors.join("; ")
        : item.message || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(failedDataForExcel);

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 18 },
      { wch: 32 },
      { wch: 22 },
      { wch: 90 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Gagal");

    const petunjukData = [
      ["PETUNJUK PERBAIKAN DATA"],
      [""],
      ["1. Lihat kolom 'Baris Excel' untuk mengetahui baris yang bermasalah."],
      [
        "2. Lihat kolom 'Field Error' untuk mengetahui kolom yang perlu diperbaiki.",
      ],
      [
        "3. Lihat kolom 'Keterangan Error' untuk mengetahui alasan data gagal diimport.",
      ],
      ["4. Setelah diperbaiki, upload ulang file Excel."],
      [""],
      [`Pesan server: ${importResult.message || "-"}`],
      [`Total data gagal: ${importResult.failed.length}`],
      [`Total data Excel: ${importResult.totalData}`],
      [`Waktu export: ${new Date().toLocaleString("id-ID")}`],
    ];

    const petunjukSheet = XLSX.utils.aoa_to_sheet(petunjukData);
    petunjukSheet["!cols"] = [{ wch: 100 }];
    XLSX.utils.book_append_sheet(workbook, petunjukSheet, "Petunjuk");

    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", "_")
      .replaceAll(":", "-");

    XLSX.writeFile(workbook, `response_gagal_upload_${timestamp}.xlsx`);
  };

  const getPayloadData = (response) => {
    return (
      response?.response?.data?.data ||
      response?.response?.data ||
      response?.data?.data ||
      response?.data ||
      response ||
      {}
    );
  };

  const getResponseMessage = (
    response,
    fallback = "Hasil pemrosesan file Excel telah selesai.",
  ) => {
    return (
      response?.response?.data?.message ||
      response?.data?.message ||
      response?.message ||
      getPayloadData(response)?.message ||
      fallback
    );
  };

  const formatFieldName = (field) => {
    const map = {
      nim: "NIM",
      nik: "NIK",
      pisn: "PISN",
      email: "Email",
      nama_mahasiswa: "Nama Mahasiswa",
      nama_prodi: "Program Studi",
      tanggal_lahir: "Tanggal Lahir",
      tanggal_kelulusan: "Tanggal Kelulusan",
      nomor_seri_ijazah: "Nomor Seri Ijazah",
      tahun_masuk: "Tahun Masuk",
      tahun_lulus: "Tahun Lulus",
      status_kelulusan: "Status Kelulusan",
      jenis_kelamin: "Jenis Kelamin",
      tempat_lahir: "Tempat Lahir",
      judul_skripsi: "Judul Skripsi",
      fakultas: "Fakultas",
      unknown_columns: "Kolom Tidak Dikenal",
      kolom_tidak_ada: "Kolom Tidak Ada",
      kolom_tidak_dikenal: "Kolom Tidak Dikenal",
    };

    return map[field] || String(field || "-").replaceAll("_", " ");
  };
  const toArray = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    return [value];
  };

  const uniqueArray = (items) => {
    return Array.from(
      new Set(
        items
          .filter((item) => item !== undefined && item !== null && item !== "")
          .map((item) => String(item).trim()),
      ),
    );
  };

  const buildColumnValidationErrors = (data = {}) => {
    const errorsObject =
      data.errors &&
      typeof data.errors === "object" &&
      !Array.isArray(data.errors)
        ? data.errors
        : {};

    const missingColumns = uniqueArray([
      ...toArray(data.kolom_tidak_ada),
      ...toArray(data.missing_columns),
      ...toArray(data.missingColumns),
      ...toArray(errorsObject.kolom_tidak_ada),
      ...toArray(errorsObject.missing_columns),
      ...toArray(errorsObject.missingColumns),
    ]);

    const unknownColumns = uniqueArray([
      ...toArray(data.unknown_columns),
      ...toArray(data.kolom_tidak_dikenal),
      ...toArray(data.unknownColumns),
      ...toArray(errorsObject.unknown_columns),
      ...toArray(errorsObject.kolom_tidak_dikenal),
      ...toArray(errorsObject.unknownColumns),
    ]);

    const missingErrors = missingColumns.map((column) => ({
      nomor: "Header",
      nim: "-",
      nama: "-",
      field: "kolom_tidak_ada",
      errors: [`Kolom wajib '${column}' tidak ditemukan di file Excel.`],
      message: `Kolom wajib '${column}' tidak ditemukan di file Excel.`,
    }));

    const unknownErrors = unknownColumns.map((column) => ({
      nomor: "Header",
      nim: "-",
      nama: "-",
      field: "kolom_tidak_dikenal",
      errors: [
        `Kolom '${column}' tidak dikenal. Hapus kolom ini dari file Excel.`,
      ],
      message: `Kolom '${column}' tidak dikenal. Hapus kolom ini dari file Excel.`,
    }));

    return [...missingErrors, ...unknownErrors];
  };

  const sortFailedItems = (items) => {
    return [...items].sort((a, b) => {
      const aNumber = Number(a.nomor);
      const bNumber = Number(b.nomor);

      if (!Number.isFinite(aNumber) && !Number.isFinite(bNumber)) return 0;
      if (!Number.isFinite(aNumber)) return -1;
      if (!Number.isFinite(bNumber)) return 1;

      return aNumber - bNumber;
    });
  };
  const normalizeErrorItem = (err, index) => {
    if (typeof err === "string") {
      return {
        nomor: index + 1,
        nim: "-",
        nama: "-",
        field: "-",
        errors: [err],
        message: err,
      };
    }

    const errorMessage =
      err?.message ||
      err?.alasan ||
      err?.error ||
      err?.detail ||
      "Terjadi kesalahan pada data.";

    const errorList = Array.isArray(err?.errors) ? err.errors : [errorMessage];

    return {
      nomor: err?.row || err?.nomor || index + 1,
      nim: err?.nim || "-",
      nama: err?.nama_mahasiswa || err?.nama || "-",
      field: err?.field || err?.kolom || "-",
      errors: errorList,
      message: errorMessage,
    };
  };

  const normalizeUploadResult = (response) => {
    const data = getPayloadData(response);
    const message = getResponseMessage(response);

    const mahasiswaResult = data.mahasiswa || {};
    const mahasiswaData = Array.isArray(mahasiswaResult.data)
      ? mahasiswaResult.data
      : [];
    const columnValidationErrors = buildColumnValidationErrors(data);

    const rawErrors =
      columnValidationErrors.length > 0
        ? columnValidationErrors
        : data.errors ||
          data.unknown_columns ||
          data.kolom_tidak_ada ||
          data.kolom_tidak_dikenal ||
          [];

    const errors = Array.isArray(rawErrors)
      ? rawErrors
      : rawErrors
        ? [rawErrors]
        : [];

    const batches = Array.isArray(data.batches) ? data.batches : [];

    const fakultasFromMahasiswa = mahasiswaData
      .map((item) => item.fakultas)
      .filter((item) => item && item !== "-");

    const fakultasTerdeteksi = Array.from(
      new Set([
        ...(data.fakultas_utama ? [data.fakultas_utama] : []),
        ...fakultasFromMahasiswa,
      ]),
    );

    const failed = sortFailedItems(
      errors.map((err, index) => normalizeErrorItem(err, index)),
    );

    const isRejected = Boolean(data.ditolak);

    const totalSuccess = Number(data.total_valid || mahasiswaData.length || 0);

    const totalData = Number(
      data.total_data_excel ||
        data.total_baris ||
        totalSuccess + failed.length ||
        0,
    );

    const totalFailed = Number(
      data.total_gagal ||
        (isRejected && totalSuccess === 0 && totalData > 0
          ? totalData
          : failed.length) ||
        0,
    );
    const totalBatch = Number(data.total_batch || batches.length || 0);

    return {
      success: mahasiswaData,
      failed,
      totalSuccess,
      totalFailed,
      totalData,
      totalBatch,
      message,
      ditolak: Boolean(data.ditolak),
      importInfo: {
        tahun,
        periode,
        fakultas: fakultasTerdeteksi,
      },
      mahasiswaData,
      pagination: mahasiswaResult.pagination || {
        page: 1,
        limit: 10,
        total: mahasiswaData.length,
        total_pages: mahasiswaData.length > 0 ? 1 : 0,
      },
      batchIds: batches
        .map((batch) => batch.id_batch_upload)
        .filter((id) => id !== undefined && id !== null),
    };
  };

  const startImport = async () => {
    setIsProcessing(true);
    setShowResult(false);
    setProgress(0);
    setImportResult(initialImportResult);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 10;
      });
    }, 200);

    try {
      const response = await uploadInboundExcel({
        file,
        periode,
        tahun_lulus: tahun,
        page: 1,
        limit: 10,
      });

      const result = normalizeUploadResult(response);

      setImportResult(result);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      const data = getPayloadData(error);

      const columnValidationErrors = buildColumnValidationErrors(data);

      const rawErrors =
        columnValidationErrors.length > 0
          ? columnValidationErrors
          : data.errors ||
            data.unknown_columns ||
            data.kolom_tidak_ada ||
            data.kolom_tidak_dikenal ||
            data.message ||
            [];

      const errors = Array.isArray(rawErrors)
        ? rawErrors
        : rawErrors
          ? [rawErrors]
          : [];

      const failed = sortFailedItems(
        errors.map((err, index) => normalizeErrorItem(err, index)),
      );

      const isRejected = Boolean(data.ditolak) || data.success === false;

      const totalData = Number(
        data.total_data_excel || data.total_baris || failed.length || 0,
      );

      const totalFailed = Number(
        data.total_gagal ||
          (isRejected && totalData > 0 ? totalData : failed.length) ||
          0,
      );

      setImportResult({
        ...initialImportResult,
        failed,
        totalSuccess: Number(data.total_valid || 0),
        totalFailed,
        totalData,
        totalBatch: Number(data.total_batch || 0),
        message: getResponseMessage(error, "Gagal memproses file upload."),
        ditolak: isRejected,
        importInfo: {
          tahun,
          periode,
          fakultas: data.fakultas_utama ? [data.fakultas_utama] : [],
        },
      });
    } finally {
      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setIsProcessing(false);
        setShowResult(true);
      }, 500);
    }
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
    const selectedFile = e.target.files?.[0];

    setFile(null);
    setShowResult(false);
    setImportResult(initialImportResult);

    if (!selectedFile) return;

    const fileSize = selectedFile.size / 1024 / 1024;
    const allowedExtensions = ["xls", "xlsx"];
    const extension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension || "")) {
      alert("Format file harus .xls atau .xlsx.");
      e.target.value = "";
      return;
    }

    if (fileSize > 2) {
      alert("Ukuran file maksimal 2 MB!");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleClose = () => {
    const uploadedMahasiswa = importResult.mahasiswaData || [];
    const pagination = importResult.pagination || {
      page: 1,
      limit: 10,
      total: uploadedMahasiswa.length,
      total_pages: uploadedMahasiswa.length > 0 ? 1 : 0,
    };
    const batchIds = importResult.batchIds || [];

    setShowResult(false);
    setImportResult(initialImportResult);
    setTahun("");
    setPeriode("");
    setFile(null);

    if (onSuccess && batchIds.length > 0) {
      onSuccess({
        mahasiswa: uploadedMahasiswa,
        pagination,
        batchIds,
      });
    }

    onClose();
  };

  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-[999] bg-black/45 flex items-center justify-center">
        <div className="w-[520px] bg-white rounded-xl shadow-xl px-10 py-9 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full border border-[#0B6B63] flex items-center justify-center text-[12px] font-bold text-[#0B6B63] bg-[#F0FDF9]">
            {progress}%
          </div>

          <h2 className="text-[22px] font-bold text-[#0B6B63] mb-5">
            Sedang Memproses Data
          </h2>

          <p className="text-[15px] text-[#1F2937] font-semibold leading-[22px] mb-8">
            Mohon tunggu sebentar,
            <br />
            sistem sedang melakukan penginputan data.
          </p>

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

  if (showResult) {
    const {
      failed,
      totalSuccess,
      totalFailed,
      totalData,
      totalBatch,
      importInfo,
      message,
      ditolak,
    } = importResult;

    const hasFailed = Array.isArray(failed) && failed.length > 0;
    const isFullFailure =
      Boolean(ditolak) ||
      (Number(totalSuccess) === 0 && Number(totalFailed) > 0);
    const isPartialFailure =
      Number(totalSuccess) > 0 && Number(totalFailed) > 0;

    const resultTheme = isFullFailure
      ? {
          header: "bg-red-50 border-red-200",
          badge: "text-red-700 bg-red-100",
          message: "text-red-700 bg-red-50 border-red-200",
          title: "Import Data Ditolak",
        }
      : isPartialFailure
        ? {
            header: "bg-red-50 border-red-200",
            badge: "text-green-700 bg-green-100",
            message: "text-green-700 bg-green-50 border-green-200",
            title: "Import Data Selesai dengan Catatan",
          }
        : {
            header: "bg-green-50 border-green-200",
            badge: "text-green-700 bg-green-100",
            message: "text-green-700 bg-green-50 border-green-200",
            title: "Import Data Berhasil",
          };

    return (
      <div className="fixed inset-0 z-[999] bg-black/45 flex items-center justify-center p-4">
        <div className="w-[860px] max-h-[88vh] bg-white rounded-xl shadow-xl overflow-hidden">
          <div className={`px-6 py-4 border-b ${resultTheme.header}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {resultTheme.title}
                </h2>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-white/60 rounded-full transition-colors"
              >
                <FiX size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[68vh]">
            {message && (
              <div
                className={`mb-4 px-4 py-3 rounded-xl border text-xs font-semibold ${resultTheme.message}`}
              >
                {message}
              </div>
            )}
            {isFullFailure && Number(totalData) > 0 && (
              <div className="mb-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-700">
                Seluruh data pada file Excel ditolak. Total data gagal diterima:{" "}
                <span className="font-black">{totalData}</span> data.
              </div>
            )}
            <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">
                  Informasi Import
                </h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full ${resultTheme.badge}`}
                >
                  Ringkasan Upload
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-white border border-blue-100 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 font-semibold">
                    Total Excel
                  </p>
                  <p className="text-lg font-bold text-gray-800">{totalData}</p>
                </div>

                <div className="bg-white border border-green-100 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 font-semibold">
                    Valid
                  </p>
                  <p className="text-lg font-bold text-green-700">
                    {totalSuccess}
                  </p>
                </div>

                <div className="bg-white border border-red-100 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 font-semibold">
                    Gagal
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    {totalFailed}
                  </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 font-semibold">
                    Batch
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {totalBatch}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
                <div>
                  <span className="text-gray-500">Tahun Lulus:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {importInfo.tahun || "-"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">Periode:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {importInfo.periode || "-"}
                  </span>
                </div>

                <div className="col-span-2 mt-1">
                  <span className="text-gray-500">Fakultas:</span>

                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {importInfo.fakultas.length > 0 ? (
                      importInfo.fakultas.map((fak, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium"
                        >
                          {fak}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-[10px]">
                        Tidak ada fakultas terdeteksi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Download Data Gagal - FITUR BARU */}
            {failed.length > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={downloadFailedData}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-all shadow-sm"
                >
                  <FiDownload size={14} />
                  Download Data Gagal ({failed.length})
                </button>
              </div>
            )}

            {failed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FiAlertCircle className="text-red-600 text-sm" />
                  <h3 className="font-semibold text-gray-800">
                    Data Gagal Diimport ({failed.length})
                  </h3>
                  <span className="text-[10px] text-gray-400 ml-auto">
                    Perbaiki data berdasarkan baris Excel dan field yang salah.
                  </span>
                </div>

                <div className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="max-h-[400px] overflow-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-red-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2 text-left w-20">
                            Baris Excel
                          </th>
                          <th className="px-3 py-2 text-left w-28">NIM</th>
                          <th className="px-3 py-2 text-left w-40">Nama</th>
                          <th className="px-3 py-2 text-left w-36">
                            Field Salah
                          </th>
                          <th className="px-3 py-2 text-left">Keterangan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {failed.map((item, idx) => (
                          <tr
                            key={`${item.nomor}-${item.nim}-${idx}`}
                            className="border-b border-red-100 hover:bg-red-50/50"
                          >
                            <td className="px-3 py-2 align-top font-semibold text-gray-700">
                              {item.nomor}
                            </td>
                            <td className="px-3 py-2 align-top font-mono text-gray-700">
                              {item.nim || "-"}
                            </td>
                            <td className="px-3 py-2 align-top">
                              <div className="text-gray-800 font-medium">
                                {item.nama || "-"}
                              </div>
                            </td>
                            <td className="px-3 py-2 align-top">
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-semibold">
                                {formatFieldName(item.field)}
                              </span>
                            </td>
                            <td className="px-3 py-2 align-top">
                              {item.errors?.map((err, i) => (
                                <div
                                  key={i}
                                  className="text-red-600 text-[10px] mb-0.5 leading-4"
                                >
                                  • {err}
                                </div>
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

            {failed.length === 0 && totalData > 0 && (
              <div className="text-center py-6 bg-green-50 border border-green-100 rounded-xl">
                <FiCheckCircle className="text-green-500 text-4xl mx-auto mb-2" />
                <p className="text-gray-700 text-sm font-semibold">
                  Semua data berhasil diimport.
                </p>
              </div>
            )}

            {totalData === 0 && (
              <div className="text-center py-8 bg-yellow-50 border border-yellow-100 rounded-xl">
                <FiAlertCircle className="text-yellow-500 text-4xl mx-auto mb-2" />
                <p className="text-gray-700 text-sm font-semibold">
                  Tidak ada data yang dapat diproses.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Pastikan file Excel memiliki data yang valid.
                </p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
            <button
              onClick={handleClose}
              className="h-[38px] px-6 rounded-lg bg-[#0B6B63] text-white text-[13px] font-bold hover:bg-[#09544e] transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black/45 flex items-center justify-center">
      <div className="w-[460px] bg-white rounded-xl shadow-xl px-8 py-7">
        <h2 className="text-[20px] font-bold text-[#1F2937]">
          Konfigurasi Unggahan Data
        </h2>

        <p className="text-[12px] text-gray-500 mt-1 mb-5 font-medium">
          Tentukan periode akademik sebelum memproses berkas Excel.
        </p>

        <div className="mb-4">
          <label className="block text-[12px] font-bold text-[#1F2937] mb-2">
            Pilih Tahun Lulus <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full h-[42px] rounded-lg border border-gray-300 px-4 pr-10 text-[12px] outline-none appearance-none font-medium text-gray-900 bg-white focus:border-[#0B6B63] focus:ring-1 focus:ring-[#0B6B63] transition-all"
            >
              <option value="" className="text-gray-400">
                Pilih Tahun Lulus
              </option>
              
           {tahunLulusOptions.map((year) => (
  <option key={year} value={year} className="text-gray-900">
    {year}
  </option>
))}
            </select>

            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[12px] font-bold text-[#1F2937] mb-2">
            Pilih Periode <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="w-full h-[42px] rounded-lg border border-gray-300 px-4 pr-10 text-[12px] outline-none appearance-none font-medium text-gray-900 bg-white focus:border-[#0B6B63] focus:ring-1 focus:ring-[#0B6B63] transition-all"
            >
              <option value="" className="text-gray-400">
                Pilih Periode
              </option>
              <option value="semester ganjil" className="text-gray-900">
                Semester Ganjil
              </option>
              <option value="semester genap" className="text-gray-900">
                Semester Genap
              </option>
            </select>

            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[12px] font-bold text-[#1F2937] mb-2">
            File Excel <span className="text-red-500">*</span>
          </label>

          <label className="block border-2 border-dashed border-gray-300 rounded-xl px-4 py-5 text-center cursor-pointer hover:border-[#0B6B63] hover:bg-[#F0FDF9] transition">
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />

            <FiFileText className="mx-auto text-[#0B6B63] text-2xl mb-2" />

            <p className="text-xs font-semibold text-gray-700 break-all">
              {file ? file.name : "Klik untuk memilih file Excel"}
            </p>

            <p className="text-[10px] text-gray-400 mt-1">
              Format .xlsx / .xls, maksimal 2 MB
            </p>
          </label>
        </div>

        <div className="border border-gray-300 rounded-lg px-4 py-3 flex gap-3 items-start mb-6 bg-gray-50">
          <FiInfo className="text-[#0B6B63] text-[16px] mt-[2px] flex-shrink-0" />

          <div className="text-[10px] text-gray-600 leading-[14px] font-medium">
            <p>
              Pastikan data dalam Excel sesuai dengan format yang telah
              ditentukan untuk periode akademik yang dipilih.
            </p>

            <p className="text-red-500 mt-1">
              *NIM, NIK, Nomor Seri Ijazah, dan PISN yang sama dalam file Excel
              akan otomatis gagal import.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-[38px] px-8 rounded-lg bg-[#E5E7EB] text-gray-600 text-[13px] font-bold hover:bg-gray-300 transition-all"
          >
            Batal
          </button>

          <button
            onClick={handleImport}
            className="h-[38px] px-7 rounded-lg bg-[#0B6B63] text-white text-[13px] font-bold hover:bg-[#09544e] transition-all shadow-sm"
          >
            Lanjutkan Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDataModal;
