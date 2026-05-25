// src/pages/operator/DetailMahasiswaOperator.jsx

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiUser,
  FiBook,
  FiFileText,
  FiArrowLeft,
  FiAlertCircle,
} from "react-icons/fi";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { getAkademikProfile } from "../../../services/api";

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

const DetailMahasiswaOperator = () => {
  const navigate = useNavigate();
  const { nim } = useParams();
  const { state } = useLocation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const laporanState = state || null;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAkademikProfile(nim);

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
    if (nim) {
      fetchProfile();
    }
  }, [nim]);

  const mahasiswa = profile?.mahasiswa;
  const akademik = profile?.akademik;
  const batch = profile?.batch;
  const status = profile?.status;
  const transkrip = profile?.transkrip || [];

  const laporanStatus =
    laporanState?.status ||
    (status?.status_validasi === "approved" ? "Proses" : status?.status_validasi);

  const laporanKeterangan =
    laporanState?.keterangan ||
    status?.catatan ||
    "Data mahasiswa dalam proses validasi";

  const getStatusUI = (statusValue) => {
    const s = (statusValue || "").toLowerCase();

    if (s.includes("terbit")) {
      return {
        bg: "bg-[#22C55E]",
        text: "Terbit",
        sub1: "Di Validasi oleh Rektor",
        sub2: "Data terverifikasi sah dalam pangkalan data universitas",
      };
    }

    if (s.includes("proses") || s.includes("approved")) {
      return {
        bg: "bg-[#2879B9]",
        text: "Proses",
        sub1: laporanKeterangan || "Data masih dalam proses validasi",
        sub2: "Data masih dalam pengecekan dan proses validasi",
      };
    }

    if (s.includes("reject") || s.includes("rejected")) {
      return {
        bg: "bg-[#DC2626]",
        text: "Reject",
        sub1: laporanKeterangan || "Data ditolak oleh validator",
        sub2: status?.catatan || "Terdapat ketidaksesuaian data",
      };
    }

    if (s.includes("revoke") || s.includes("revoked")) {
      return {
        bg: "bg-[#EAB308]",
        text: "Revoke",
        sub1: laporanKeterangan || "Data direvoke oleh validator",
        sub2: status?.catatan || "Mahasiswa dikeluarkan dari proses validasi",
      };
    }

    return {
      bg: "bg-gray-400",
      text: statusValue || "-",
      sub1: laporanKeterangan || "-",
      sub2: status?.catatan || "-",
    };
  };

  const statusUI = getStatusUI(laporanStatus);

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
    <DashboardLayout
      title={`Detail Mahasiswa - ${mahasiswa?.nama_mahasiswa || "-"}`}
    >
      <div className="w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#0B6B63] mb-4 transition-colors"
        >
          <FiArrowLeft size={18} />
          <span className="text-sm font-medium">Kembali</span>
        </button>

        <div className="bg-white rounded-xl px-8 py-6 flex justify-between items-center mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-6">
            <div className="w-[88px] h-[88px] rounded-full bg-[#E5F3EB] overflow-hidden flex items-center justify-center border-4 border-[#E5F3EB]">
              {mahasiswa?.foto ? (
                <img
                  src={mahasiswa.foto}
                  alt={mahasiswa.nama_mahasiswa || "Foto Mahasiswa"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg viewBox="0 0 36 36" fill="none" width="88" height="88">
                  <rect width="36" height="36" fill="#84cc16" />
                  <rect
                    x="0"
                    y="0"
                    width="36"
                    height="36"
                    transform="translate(6 6) rotate(194 18 18)"
                    fill="#fde047"
                    rx="36"
                  />
                  <g transform="translate(0 2) rotate(-4 18 18)">
                    <path d="M13,21 a1,1 0 0,0 10,0" fill="#000000" />
                    <rect
                      x="11"
                      y="14"
                      width="1.5"
                      height="2"
                      rx="1"
                      fill="#000000"
                    />
                    <rect
                      x="23"
                      y="14"
                      width="1.5"
                      height="2"
                      rx="1"
                      fill="#000000"
                    />
                  </g>
                </svg>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-bold text-[20px] text-gray-900">
                {mahasiswa?.nama_mahasiswa || "-"}
              </h2>

              <p className="text-[14px] text-gray-600">
                NIM: {mahasiswa?.nim || "-"}
              </p>

              {batch?.nomor_batch_upload && (
                <div>
                  <span className="inline-block bg-[#115E59] text-white text-[12px] px-4 py-1.5 rounded-full font-bold shadow-sm">
                    {batch.nomor_batch_upload}
                  </span>
                </div>
              )}
            </div>
          </div>

          {laporanStatus && (
            <div className="text-right flex flex-col items-end gap-1">
              <span
                className={`${statusUI.bg} text-white text-[13px] px-8 py-1.5 rounded-full font-bold shadow-sm`}
              >
                {statusUI.text}
              </span>

              <p className="text-[12px] text-gray-800 font-bold mt-1">
                {statusUI.sub1}
              </p>

              <p className="text-[11px] text-gray-400">{statusUI.sub2}</p>
            </div>
          )}
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
                label="Nomor Seri Ijazah"
                value={mahasiswa?.nomor_seri_ijazah}
              />
              <InfoItem label="PISN" value={mahasiswa?.pisn} />
              <InfoItem
                label="Tempat, Tanggal Lahir"
                value={`${mahasiswa?.tempat_lahir || "-"}, ${formatTanggal(
                  mahasiswa?.tanggal_lahir
                )}`}
              />
              <InfoItem
                label="Jenis Kelamin"
                value={mahasiswa?.jenis_kelamin}
              />
              <InfoItem label="Email" value={mahasiswa?.email} />
              <InfoItem label="No Telepon" value={mahasiswa?.telepon} />
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
              <InfoItem
                label="Program Studi"
                value={akademik?.program_studi}
              />
              <InfoItem label="Tahun Masuk" value={akademik?.tahun_masuk} />
              <InfoItem label="Tahun Lulus" value={akademik?.tahun_lulus} />
              <InfoItem
                label="Tanggal Kelulusan"
                value={formatTanggal(akademik?.tanggal_kelulusan)}
              />
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

        {status?.catatan && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-yellow-600 text-lg mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-yellow-800 mb-1">
                  Catatan Verifikasi
                </h4>
                <p className="text-sm text-yellow-700">{status.catatan}</p>
              </div>
            </div>
          </div>
        )}

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
                  <th className="px-6 py-4 font-bold text-center">No</th>
                  <th className="px-6 py-4 font-bold text-center">Kode</th>
                  <th className="px-6 py-4 font-bold text-left">
                    Nama Mata Kuliah
                  </th>
                  <th className="px-6 py-4 font-bold text-center">K</th>
                  <th className="px-6 py-4 font-bold text-center">AM</th>
                  <th className="px-6 py-4 font-bold text-center">T</th>
                  <th className="px-6 py-4 font-bold text-center">HM</th>
                </tr>
              </thead>

              <tbody>
                {transkrip.length > 0 ? (
                  transkrip.map((n, i) => (
                    <tr
                      key={`${n.kode || "matkul"}-${i}`}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-center">
                        {n.no || i + 1}
                      </td>

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
                      colSpan="7"
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

const InfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-gray-500 mb-1.5">{label}</p>
      <p className="font-bold text-gray-800">{value ?? "-"}</p>
    </div>
  );
};

export default DetailMahasiswaOperator;