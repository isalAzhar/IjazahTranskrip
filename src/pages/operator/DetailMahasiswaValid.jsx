// src/pages/admin/DetailMahasiswaValid.jsx

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiUser,
  FiBook,
  FiFileText,
  FiExternalLink,
  FiFile,
  FiDownload,
  FiX,
} from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { getAkademikProfile } from "@/services/api";
import { useAuth } from "../../pages/context/AuthContext";
import { getAuthToken } from "../../services/auth.api";

const getGoogleDriveFileId = (url) => {
  if (!url) return null;

  const patterns = [
    /\/file\/d\/([^/]+)/,
    /[?&]id=([^&]+)/,
    /\/open\?id=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

const getGoogleDriveImageUrl = (url, size = 500) => {
  const fileId = getGoogleDriveFileId(url);

  if (!fileId) return url;

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
};

const badgeClass = (status) => {
  const map = {
    Proses: "bg-[#3B82F6] text-white",
    Terbit: "bg-[#16A36B] text-white",
    Revoke: "bg-[#F59E0B] text-white",
    Reject: "bg-[#EF4444] text-white",
  };

  return map[status] || "bg-gray-400 text-white";
};

const getBaseUrl = () => {
  return (
    import.meta.env.VITE_API_PUBLIC_URL || "http://103.158.196.32:8010"
  ).replace(/\/$/, "");
};

const getApiUrl = (path) => {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (baseUrl.endsWith("/api")) {
    return `${baseUrl}${cleanPath.replace(/^\/api/, "")}`;
  }

  return `${baseUrl}${cleanPath}`;
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  const cleanPath = String(imagePath).trim();

  if (!cleanPath) return null;

  if (cleanPath.includes("drive.google.com")) {
    return getGoogleDriveImageUrl(cleanPath, 500);
  }

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  const baseUrl = getBaseUrl();

  if (cleanPath.startsWith("/")) return `${baseUrl}${cleanPath}`;

  return `${baseUrl}/${cleanPath}`;
};

const getFileUrl = (filePath) => {
  if (!filePath) return null;

  const cleanPath = String(filePath).trim();

  if (!cleanPath) return null;

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  const baseUrl = getBaseUrl();

  if (cleanPath.startsWith("/")) return `${baseUrl}${cleanPath}`;

  return `${baseUrl}/${cleanPath}`;
};

const formatTanggal = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const normalizeRole = (role) => {
  return String(role || "")
    .toLowerCase()
    .trim();
};

const isDownloaderRole = (role) => {
  return ["admin", "admin_sistem", "operator", "operator_data"].includes(
    normalizeRole(role),
  );
};

const getDocumentPreviewUrl = (kodeQr) => {
  return getApiUrl(`/api/document/preview/${encodeURIComponent(kodeQr)}`);
};

const getDocumentDownloadUrl = (kodeQr) => {
  return getApiUrl(`/api/document/download/${encodeURIComponent(kodeQr)}`);
};
const getFileNameFromContentDisposition = (disposition, fallbackName) => {
  if (!disposition) return fallbackName;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/["']/g, "").trim());
    } catch {
      return utf8Match[1].replace(/["']/g, "").trim();
    }
  }

  const fileNameMatch = disposition.match(/filename="?([^";]+)"?/i);

  if (fileNameMatch?.[1]) {
    try {
      return decodeURIComponent(fileNameMatch[1].replace(/["']/g, "").trim());
    } catch {
      return fileNameMatch[1].replace(/["']/g, "").trim();
    }
  }

  return fallbackName;
};
const getSafeFileName = (title) => {
  return `${String(title || "dokumen")
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;
};
const getDocumentFileName = ({ title, nim }) => {
  const normalizedTitle = String(title || "dokumen").toLowerCase();

  let jenis = "dokumen";

  if (normalizedTitle.includes("ijazah")) {
    jenis = "ijazah";
  } else if (normalizedTitle.includes("transkrip")) {
    jenis = "transkrip";
  }

  const cleanNim = String(nim || "mahasiswa")
    .trim()
    .replace(/\s+/g, "-");

  return `${jenis}-${cleanNim}.pdf`;
};
const DetailMahasiswaValid = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mahasiswaCode, id } = useParams();
  const { user } = useAuth();

  const mahasiswaFromState = location.state?.mahasiswa || {};
  const currentMahasiswaCode = decodeURIComponent(mahasiswaCode || id || "");

  const userRole = normalizeRole(user?.role);
  const canDownloadDocument = isDownloaderRole(userRole);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const [pdfViewer, setPdfViewer] = useState({
    open: false,
    url: "",
    title: "",
    kodeQr: "",
    fallbackUrl: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setImageError(false);

      const result = await getAkademikProfile(currentMahasiswaCode);
      setProfile(result.data);
    } catch (err) {
      console.error("Gagal mengambil detail mahasiswa:", err);
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Gagal mengambil detail mahasiswa.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMahasiswaCode) {
      fetchProfile();
    }
  }, [currentMahasiswaCode]);

  useEffect(() => {
    return () => {
      if (pdfViewer.url?.startsWith("blob:")) {
        URL.revokeObjectURL(pdfViewer.url);
      }
    };
  }, [pdfViewer.url]);

  const mahasiswa = profile?.mahasiswa;
  const akademik = profile?.akademik;
  const batch = profile?.batch;
  const approval = profile?.approval;
  const transkrip = profile?.transkrip || [];

  const fotoMahasiswa = getImageUrl(mahasiswa?.foto);

  const batchLabel =
    batch?.nomor_batch_upload ||
    batch?.batch_code ||
    mahasiswa?.batch_code ||
    mahasiswaFromState?.batch_code ||
    mahasiswaFromState?.batchCode ||
    "-";

  const detailStatus =
    approval?.status || mahasiswaFromState?.status || "Proses";

  const detailKeterangan =
    approval?.keterangan || "Di Proses Validasi oleh TU Fakultas";

  const detailDeskripsi =
    approval?.deskripsi ||
    "Data sedang dalam proses verifikasi. Mohon menunggu hingga proses validasi selesai.";

  const ijazahDokumen =
    mahasiswaFromState?.ijazah ||
    profile?.ijazah ||
    profile?.dokumen?.ijazah ||
    mahasiswa?.ijazah ||
    {};

  const transkripDokumen =
    mahasiswaFromState?.transkrip ||
    profile?.transkrip_dokumen ||
    profile?.dokumen?.transkrip ||
    mahasiswa?.transkrip ||
    {};

  const ijazahKodeQr =
    ijazahDokumen?.kode_qr ||
    ijazahDokumen?.kodeQr ||
    ijazahDokumen?.qr_code ||
    ijazahDokumen?.document_code ||
    ijazahDokumen?.uuid ||
    "";

  const transkripKodeQr =
    transkripDokumen?.kode_qr ||
    transkripDokumen?.kodeQr ||
    transkripDokumen?.qr_code ||
    transkripDokumen?.document_code ||
    transkripDokumen?.uuid ||
    "";

  const ijazahUrl = getFileUrl(
    ijazahDokumen?.file_pdf_url ||
      ijazahDokumen?.file_url ||
      ijazahDokumen?.url ||
      ijazahDokumen?.file_pdf_final ||
      ijazahDokumen?.file_pdf,
  );

  const transkripUrl = getFileUrl(
    transkripDokumen?.file_pdf_url ||
      transkripDokumen?.file_url ||
      transkripDokumen?.url ||
      transkripDokumen?.file_pdf_final ||
      transkripDokumen?.file_pdf,
  );

  const openPdf = async ({ kodeQr, fallbackUrl, title }) => {
    if (!kodeQr && !fallbackUrl) {
      alert(`Dokumen ${title} belum tersedia.`);
      return;
    }

    try {
      setLoadingPdf(true);

      if (pdfViewer.url?.startsWith("blob:")) {
        URL.revokeObjectURL(pdfViewer.url);
      }

      const token = getAuthToken();

      if (kodeQr && token) {
        const response = await fetch(getDocumentPreviewUrl(kodeQr), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.message || "Gagal membuka preview dokumen.");
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        setPdfViewer({
          open: true,
          url: blobUrl,
          title,
          kodeQr,
          fallbackUrl: fallbackUrl || "",
        });

        return;
      }

      setPdfViewer({
        open: true,
        url: fallbackUrl,
        title,
        kodeQr: kodeQr || "",
        fallbackUrl: fallbackUrl || "",
      });
    } catch (err) {
      console.error("Gagal membuka dokumen:", err);
      alert(err?.message || "Gagal membuka dokumen.");
    } finally {
      setLoadingPdf(false);
    }
  };

  const downloadPdf = async ({ kodeQr, fallbackUrl, title }) => {
    if (!canDownloadDocument) {
      alert("Role Anda tidak diizinkan mengunduh dokumen.");
      return;
    }

    if (!kodeQr && !fallbackUrl) {
      alert(`Dokumen ${title} belum tersedia.`);
      return;
    }

    try {
      setLoadingPdf(true);

      const token = getAuthToken();

      if (kodeQr && token) {
        const response = await fetch(getDocumentDownloadUrl(kodeQr), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.message || "Gagal download dokumen.");
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const disposition = response.headers.get("content-disposition") || "";

        const fallbackFileName = getDocumentFileName({
          title,
          nim: mahasiswa?.nim || mahasiswaFromState?.nim,
        });

        const fileName = getFileNameFromContentDisposition(
          disposition,
          fallbackFileName,
        );

        console.log("Content-Disposition:", disposition);
        console.log("Fallback file name:", fallbackFileName);
        console.log("File name download:", fileName);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(blobUrl);
        return;
      }

      const link = document.createElement("a");
      link.href = fallbackUrl;
      link.download = getSafeFileName(title);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Gagal download dokumen:", err);
      alert(err?.message || "Gagal download dokumen.");
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleOpenIjazah = () => {
    closePdfModal();

    openPdf({
      kodeQr: ijazahKodeQr,
      fallbackUrl: ijazahUrl,
      title: "Ijazah",
    });
  };

  const handleOpenTranskrip = () => {
    closePdfModal();

    openPdf({
      kodeQr: transkripKodeQr,
      fallbackUrl: transkripUrl,
      title: "Transkrip Nilai",
    });
  };

  const handleLinkDokumenValid = () => {
    const hasIjazah = Boolean(ijazahKodeQr || ijazahUrl);
    const hasTranskrip = Boolean(transkripKodeQr || transkripUrl);

    if (hasIjazah && hasTranskrip) {
      setShowPdfModal(true);
      return;
    }

    if (hasIjazah) {
      handleOpenIjazah();
      return;
    }

    if (hasTranskrip) {
      handleOpenTranskrip();
      return;
    }

    alert("Dokumen belum tersedia.");
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
  };

  const closePdfViewer = () => {
    if (pdfViewer.url?.startsWith("blob:")) {
      URL.revokeObjectURL(pdfViewer.url);
    }

    setPdfViewer({
      open: false,
      url: "",
      title: "",
      kodeQr: "",
      fallbackUrl: "",
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Detail Mahasiswa">
        <div className="w-full text-center py-10">
          <p className="text-gray-500">Memuat detail mahasiswa...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Detail Mahasiswa">
        <div className="w-full text-center py-10">
          <p className="text-red-500 mb-3">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout title="Detail Mahasiswa">
        <div className="w-full text-center py-10">
          <p className="text-gray-500 mb-3">Data tidak ditemukan</p>

          <button
            onClick={() => navigate(-1)}
            className="text-[#115E59] font-bold hover:underline"
          >
            ← Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Detail Mahasiswa">
      <div className="w-full">
        {showPdfModal && (
          <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl">
              <div className="text-center mb-4">
                <FiFile className="text-[#0B6B63] text-4xl mx-auto mb-2" />
                <h3 className="text-lg font-bold text-gray-800">
                  Pilih Dokumen
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih dokumen yang ingin Anda lihat.
                </p>
              </div>

              <div className="space-y-3">
                {(ijazahKodeQr || ijazahUrl) && (
                  <button
                    onClick={handleOpenIjazah}
                    disabled={loadingPdf}
                    className="w-full flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition"
                  >
                    <div className="flex items-center gap-2">
                      <FiFile className="text-green-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        Ijazah
                      </span>
                    </div>
                    <FiExternalLink className="text-gray-400 text-sm" />
                  </button>
                )}

                {(transkripKodeQr || transkripUrl) && (
                  <button
                    onClick={handleOpenTranskrip}
                    disabled={loadingPdf}
                    className="w-full flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition"
                  >
                    <div className="flex items-center gap-2">
                      <FiFile className="text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        Transkrip Nilai
                      </span>
                    </div>
                    <FiExternalLink className="text-gray-400 text-sm" />
                  </button>
                )}
              </div>

              <button
                onClick={closePdfModal}
                className="w-full mt-4 h-11 rounded-lg bg-[#117065] text-white font-semibold text-sm shadow-md hover:bg-[#0D5A51] hover:shadow-lg active:scale-[0.98] transition-all duration-200"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {pdfViewer.open && (
          <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] shadow-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    Pratinjau {pdfViewer.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {canDownloadDocument
                      ? "Anda dapat melihat dan mengunduh dokumen ini."
                      : "Anda hanya dapat melihat dokumen ini."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {canDownloadDocument && (
                    <button
                      onClick={() =>
                        downloadPdf({
                          kodeQr: pdfViewer.kodeQr,
                          fallbackUrl: pdfViewer.fallbackUrl,
                          title: pdfViewer.title,
                        })
                      }
                      disabled={loadingPdf}
                      className="px-4 py-2 rounded-lg bg-[#117065] hover:bg-[#0D5A51] disabled:opacity-60 text-white text-sm font-semibold flex items-center gap-2"
                    >
                      <FiDownload size={15} />
                      Download
                    </button>
                  )}

                  <button
                    onClick={closePdfViewer}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-2"
                  >
                    <FiX size={15} />
                    Tutup
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-gray-100">
                <iframe
                  src={`${pdfViewer.url}#toolbar=0&navpanes=0&scrollbar=1`}
                  title={`Preview ${pdfViewer.title}`}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-6">
            <div className="w-[88px] h-[88px] rounded-full bg-[#E5F3EB] overflow-hidden flex items-center justify-center border-4 border-[#E5F3EB]">
              {fotoMahasiswa && !imageError ? (
                <img
                  src={fotoMahasiswa}
                  alt={mahasiswa?.nama_mahasiswa || "Foto Mahasiswa"}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center 20%" }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#D9F0E5] flex items-center justify-center text-[#115E59] text-2xl font-bold">
                  {(mahasiswa?.nama_mahasiswa || "?").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-bold text-[20px] text-gray-900">
                {mahasiswa?.nama_mahasiswa ||
                  mahasiswaFromState?.nama ||
                  mahasiswaFromState?.nama_mahasiswa ||
                  "-"}
              </h2>

              <p className="text-[14px] text-gray-600">
                NIM: {mahasiswa?.nim || mahasiswaFromState?.nim || "-"}
              </p>

              <div>
                <span className="inline-block bg-[#115E59] text-white text-[12px] px-4 py-1.5 rounded-full font-bold shadow-sm">
                  {batchLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-1 max-w-[320px]">
            <span
              className={`${badgeClass(
                detailStatus,
              )} text-white text-[13px] px-6 py-1.5 rounded-full font-bold shadow-sm inline-block`}
            >
              {detailStatus}
            </span>

            <p className="text-[11px] text-gray-500 font-medium">
              {detailKeterangan}
            </p>

            <p className="text-[10px] text-gray-400 italic leading-relaxed text-right">
              {detailDeskripsi}
            </p>

            {detailStatus === "Terbit" && (
              <button
                onClick={handleLinkDokumenValid}
                disabled={loadingPdf}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0B4B48] hover:underline mt-2 disabled:opacity-60"
              >
                <FiExternalLink size={12} />
                {loadingPdf ? "Membuka dokumen..." : "Lihat Dokumen Valid"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-[#F3F4F6] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
              <FiUser size={16} className="text-gray-800" />
              <h3 className="text-[14px] font-bold text-gray-800">
                Informasi Pribadi
              </h3>
            </div>

            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8 text-[14px]">
              <InfoItem label="Nama" value={mahasiswa?.nama_mahasiswa} />
              <InfoItem label="NIM" value={mahasiswa?.nim} />
              <InfoItem label="NIK" value={mahasiswa?.nik} />
              <InfoItem
                label="Tempat, Tanggal Lahir"
                value={`${mahasiswa?.tempat_lahir || "-"}, ${formatTanggal(
                  mahasiswa?.tanggal_lahir,
                )}`}
              />
              <InfoItem
                label="Jenis Kelamin"
                value={mahasiswa?.jenis_kelamin}
              />
              <InfoItem label="Email" value={mahasiswa?.email} />
              <InfoItem label="No Telepon" value={mahasiswa?.telepon} />
              <InfoItem
                label="Nomor Seri Ijazah"
                value={mahasiswa?.nomor_seri_ijazah}
              />
              <InfoItem label="PISN" value={mahasiswa?.pisn} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-[#F3F4F6] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
              <FiBook size={16} className="text-gray-800" />
              <h3 className="text-[14px] font-bold text-gray-800">
                Informasi Akademik
              </h3>
            </div>

            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8 text-[14px]">
              <InfoItem label="Fakultas" value={akademik?.fakultas} />
              <InfoItem label="Program Studi" value={akademik?.program_studi} />
              <InfoItem label="Tahun Masuk" value={akademik?.tahun_masuk} />
              <InfoItem
                label="Tanggal Kelulusan"
                value={formatTanggal(akademik?.tanggal_kelulusan)}
              />
              <InfoItem label="Tahun Lulus" value={akademik?.tahun_lulus} />
              <InfoItem
                label="IPK"
                value={
                  akademik?.ipk !== undefined && akademik?.ipk !== null
                    ? `${akademik.ipk} / 4.00`
                    : "-"
                }
              />
              <InfoItem
                label="Total SKS"
                value={
                  akademik?.total_sks !== undefined &&
                  akademik?.total_sks !== null
                    ? `${akademik.total_sks} SKS`
                    : "-"
                }
              />
              <InfoItem label="Total Bobot" value={akademik?.total_bobot} />
              <InfoItem label="Predikat" value={akademik?.predikat} />
              <InfoItem
                label="Status Kelulusan"
                value={akademik?.status_kelulusan}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-[#F3F4F6] px-6 py-4 flex items-center gap-2 border-b border-gray-200">
            <FiFileText size={16} className="text-gray-800" />
            <h3 className="text-[15px] font-bold text-gray-800">
              Transkrip Nilai
            </h3>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-[14px] text-gray-800">
              <thead className="sticky top-0 bg-[#F9FAFB] border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold text-center">Kode</th>
                  <th className="px-6 py-4 font-bold text-left">
                    Nama Mata Kuliah
                  </th>
                  <th className="px-6 py-4 font-bold text-center">SKS</th>
                  <th className="px-6 py-4 font-bold text-center">
                    Nilai Mutu
                  </th>
                  <th className="px-6 py-4 font-bold text-center">Bobot</th>
                  <th className="px-6 py-4 font-bold text-center">Nilai</th>
                </tr>
              </thead>

              <tbody>
                {transkrip.length > 0 ? (
                  transkrip.map((n, index) => (
                    <tr
                      key={`${n.kode || "matkul"}-${index}`}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-center">
                        {n.kode || "-"}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {n.nama || "-"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-center">
                        {n.k ?? "-"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-center">
                        {n.am ?? "-"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-center">
                        {n.t ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-[#115E59] text-white px-4 py-1 rounded-full font-bold text-[12px]">
                          {n.hm || "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Data transkrip tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-gray-500 mb-1.5">{label}</p>
    <p className="font-bold text-gray-800">{value ?? "-"}</p>
  </div>
);

export default DetailMahasiswaValid;
