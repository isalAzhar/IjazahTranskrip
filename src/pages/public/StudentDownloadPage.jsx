import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

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

  // ✅ Tambahan: mencegah request download dobel di React StrictMode
  const hasStartedDownload = useRef(false);

  const [status, setStatus] = useState("loading");
  const [info, setInfo] = useState({
    title: "Menyiapkan Download",
    description: "Mohon tunggu, dokumen Anda sedang disiapkan.",
    suggestion: "",
  });

  useEffect(() => {
    if (!token) return;

    // ✅ Tambahan: kalau sudah pernah jalan, jangan jalan lagi
    if (hasStartedDownload.current) return;
    hasStartedDownload.current = true;

    const downloadDocument = async () => {
      try {
        const response = await fetch(
          `/api/document/public/download/${encodeURIComponent(token)}`,
          {
            method: "GET",
          },
        );

        const contentType = response.headers.get("content-type") || "";

        if (!response.ok) {
          let errorMessage = "Gagal download dokumen.";

          if (contentType.includes("application/json")) {
            const result = await response.json();
            errorMessage = result?.message || errorMessage;
          }

          setInfo(getFriendlyMessage(errorMessage));
          setStatus("error");
          return;
        }

        const blob = await response.blob();

        const disposition = response.headers.get("content-disposition") || "";
        const match = disposition.match(/filename="?([^"]+)"?/);

        const fileName = match?.[1] || "dokumen-digital.pdf";

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        // ✅ Ubah: setelah download berhasil, jangan tampilkan informasi
        setStatus("downloaded");

        // ✅ Opsional: coba tutup tab otomatis kalau browser mengizinkan
        setTimeout(() => {
          window.close();
        }, 500);
      } catch (error) {
        setInfo({
          title: "Koneksi Gagal",
          description:
            "Sistem tidak dapat menghubungi server download dokumen.",
          suggestion:
            "Periksa koneksi internet Anda atau coba beberapa saat lagi.",
        });
        setStatus("error");
      }
    };

    downloadDocument();
  }, [token]);

  const isLoading = status === "loading";

  // ✅ Tambahan: kalau download pertama berhasil, tampilkan halaman kosong saja
  if (status === "downloaded") {
    return <div className="min-h-screen bg-gray-100" />;
  }

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
              isLoading
                ? "bg-blue-50 text-blue-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            {isLoading ? "…" : "!"}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {info.title}
          </h2>

          <p className="text-sm text-gray-600 leading-7 mb-4">
            {info.description}
          </p>

          {info.suggestion && (
            <div className="bg-gray-50 border-l-4 border-[#117065] rounded-lg p-4 text-sm text-gray-700 leading-6">
              {info.suggestion}
            </div>
          )}

          {isLoading && (
            <div className="mt-6 text-sm text-gray-400">
              Jangan tutup halaman ini selama proses download berlangsung.
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