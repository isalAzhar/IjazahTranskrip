import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const getFriendlyMessage = (message = "") => {
  const lower = message.toLowerCase();

  if (
    lower.includes("sudah pernah digunakan") ||
    lower.includes("sudah tidak dapat digunakan")
  ) {
    return {
      title: "Link Download Tidak Dapat Digunakan",
      description:
        "Dokumen digital ini sudah pernah diunduh sebelumnya. Untuk keamanan data, link download hanya dapat digunakan satu kali.",
      suggestion:
        "Jika Anda membutuhkan akses ulang, silakan hubungi operator akademik atau pihak administrasi kampus.",
    };
  }

  if (lower.includes("kedaluwarsa") || lower.includes("expired")) {
    return {
      title: "Link Download Sudah Kedaluwarsa",
      description:
        "Masa berlaku link download dokumen digital ini sudah berakhir.",
      suggestion:
        "Silakan hubungi operator akademik untuk meminta pengiriman link download baru.",
    };
  }

  if (lower.includes("tidak valid") || lower.includes("token")) {
    return {
      title: "Link Download Tidak Valid",
      description:
        "Link download yang Anda buka tidak valid atau tidak dikenali oleh sistem.",
      suggestion:
        "Pastikan Anda membuka link terbaru yang dikirim melalui email resmi.",
    };
  }

  return {
    title: "Download Dokumen Gagal",
    description: "Dokumen digital tidak dapat diunduh saat ini.",
    suggestion: "Silakan coba beberapa saat lagi atau hubungi operator akademik.",
  };
};

const StudentDownloadPage = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const errorMessage =
    searchParams.get("message") ||
    searchParams.get("error") ||
    "";


  const [status, setStatus] = useState("ready");
  const [info, setInfo] = useState({
    title: "Download Dokumen Digital",
    description:
      "Klik tombol di bawah ini untuk mengunduh dokumen akademik digital Anda.",
    suggestion:
      "Link download hanya dapat digunakan satu kali. Pastikan koneksi internet stabil sebelum menekan tombol download.",
  });

  useEffect(() => {
  if (!token) {
    setInfo(getFriendlyMessage("token tidak valid"));
    setStatus("error");
    return;
  }

  if (errorMessage) {
    setInfo(getFriendlyMessage(errorMessage));
    setStatus("error");
  }
}, [token, errorMessage]);

  const downloadUrl = token
    ? `/api/document/public/download/${encodeURIComponent(token)}`
    : "";

  const handleDownload = () => {
    if (!token) {
      setInfo(getFriendlyMessage("token tidak valid"));
      setStatus("error");
      return;
    }

    setStatus("opening");

    /*
      Jangan pakai fetch + blob untuk download dari email.
      Di HP/in-app browser, cara itu sering gagal.
      Ini langsung membuka endpoint public backend.
    */
    window.location.href = downloadUrl;
  };

  const isError = status === "error";
  const isOpening = status === "opening";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#117065] px-7 py-6">
          <h1 className="text-white text-xl font-bold">UIKA Ijazah Digital</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Layanan Dokumen Akademik Digital
          </p>
        </div>

        <div className="px-7 py-8">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-5 ${
              isError
                ? "bg-orange-50 text-orange-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {isError ? "!" : "↓"}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {info.title}
          </h2>

          <p className="text-sm text-gray-600 leading-7 mb-4">
            {info.description}
          </p>

          {info.suggestion && (
            <div className="bg-gray-50 border-l-4 border-[#117065] rounded-lg p-4 text-sm text-gray-700 leading-6 mb-6">
              {info.suggestion}
            </div>
          )}

          {!isError && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={isOpening}
              className={`w-full py-3 rounded-xl text-white font-semibold transition ${
                isOpening
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#117065] hover:bg-[#0d5a51]"
              }`}
            >
              {isOpening ? "Membuka dokumen..." : "Download Dokumen"}
            </button>
          )}

          {isOpening && (
            <div className="mt-6 text-sm text-gray-400 leading-6">
              Jika muncul konfirmasi download di HP, pilih lanjutkan/download.
              Jangan menekan tombol download berulang kali.
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-7 py-4">
          <p className="text-xs text-gray-500 leading-5">
            Halaman ini ditampilkan otomatis oleh sistem UIKA Ijazah Digital.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDownloadPage;