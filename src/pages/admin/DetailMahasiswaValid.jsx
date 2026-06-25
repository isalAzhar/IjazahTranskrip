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
} from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { getAkademikProfile } from "@/services/api";

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

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (imagePath.includes("drive.google.com")) {
    return getGoogleDriveImageUrl(imagePath, 500);
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_API_PUBLIC_URL || "http://103.158.196.32:8010";
  // import.meta.env.VITE_API_PUBLIC_URL || "http://localhost:3000";

  if (imagePath.startsWith("/")) return `${baseUrl}${imagePath}`;

  return `${baseUrl}/${imagePath}`;
};

const getFileUrl = (filePath) => {
  if (!filePath) return null;

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  const baseUrl = import.meta.env.VITE_API_PUBLIC_URL || "http://localhost:3000";

  if (filePath.startsWith("/")) return `${baseUrl}${filePath}`;

  return `${baseUrl}/${filePath}`;
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

const DetailPelaporan= () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mahasiswaCode, id } = useParams();

  const mahasiswaFromState = location.state?.mahasiswa || {};

  const currentMahasiswaCode = decodeURIComponent(mahasiswaCode || id || "");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

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
          "Gagal mengambil detail mahasiswa."
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

  const ijazahUrl = getFileUrl(
    mahasiswaFromState?.ijazah?.file_pdf_url ||
      mahasiswaFromState?.ijazah?.file_url ||
      mahasiswaFromState?.ijazah?.url ||
      profile?.ijazah?.file_pdf_url ||
      profile?.ijazah?.file_url ||
      profile?.ijazah?.url ||
      profile?.dokumen?.ijazah?.file_pdf_url ||
      profile?.dokumen?.ijazah?.file_url ||
      profile?.dokumen?.ijazah?.url ||
      mahasiswa?.ijazah?.file_pdf_url ||
      mahasiswa?.ijazah?.file_url ||
      mahasiswa?.ijazah?.url
  );

  const transkripUrl = getFileUrl(
    mahasiswaFromState?.transkrip?.file_pdf_url ||
      mahasiswaFromState?.transkrip?.file_url ||
      mahasiswaFromState?.transkrip?.url ||
      profile?.transkrip_dokumen?.file_pdf_url ||
      profile?.transkrip_dokumen?.file_url ||
      profile?.transkrip_dokumen?.url ||
      profile?.dokumen?.transkrip?.file_pdf_url ||
      profile?.dokumen?.transkrip?.file_url ||
      profile?.dokumen?.transkrip?.url ||
      mahasiswa?.transkrip?.file_pdf_url ||
      mahasiswa?.transkrip?.file_url ||
      mahasiswa?.transkrip?.url
  );

  const openPdf = (url, title) => {
    if (!url) {
      alert(`Dokumen ${title} belum tersedia.`);
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleLinkDokumenValid = () => {
    if (ijazahUrl && transkripUrl) {
      setShowPdfModal(true);
      return;
    }

    if (ijazahUrl) {
      openPdf(ijazahUrl, "Ijazah");
      return;
    }

    if (transkripUrl) {
      openPdf(transkripUrl, "Transkrip Nilai");
      return;
    }

    alert("Dokumen belum tersedia.");
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
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
                  Pilih dokumen yang ingin Anda lihat
                </p>
              </div>

              <div className="space-y-3">
                {ijazahUrl && (
                  <button
                    onClick={() => {
                      closePdfModal();
                      openPdf(ijazahUrl, "Ijazah");
                    }}
                    className="w-full flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <FiFile className="text-green-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        Ijazah
                      </span>
                    </div>
                    <FiDownload className="text-gray-400 text-sm" />
                  </button>
                )}

                {transkripUrl && (
                  <button
                    onClick={() => {
                      closePdfModal();
                      openPdf(transkripUrl, "Transkrip Nilai");
                    }}
                    className="w-full flex items-center justify-between gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <FiFile className="text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        Transkrip Nilai
                      </span>
                    </div>
                    <FiDownload className="text-gray-400 text-sm" />
                  </button>
                )}
              </div>

              <button
  onClick={closePdfModal}
  className="
    w-full
    mt-4
    h-11
    rounded-lg
    bg-[#117065]
    text-white
    font-semibold
    text-sm
    shadow-md
    hover:bg-[#0D5A51]
    hover:shadow-lg
    active:scale-[0.98]
    transition-all
    duration-200
  "
>
  Batal
</button>
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
                detailStatus
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
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0B4B48] hover:underline mt-2"
              >
                <FiExternalLink size={12} />
                Lihat Dokumen Valid
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
                  mahasiswa?.tanggal_lahir
                )}`}
              />
              <InfoItem label="Jenis Kelamin" value={mahasiswa?.jenis_kelamin} />
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
                      key={index}
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

export default DetailPelaporan;