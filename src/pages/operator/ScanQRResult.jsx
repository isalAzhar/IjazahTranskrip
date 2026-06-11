// src/pages/operator/ScanQRResult.jsx
// Halaman hasil scan QR Ijazah — mobile-first, responsive di web

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

// Logo dari folder assets/img/
import Logo from "../../assets/img/Logo.jpg";

// ── Data dummy mahasiswa ─────────────────────────────────────────────────────
const MAHASISWA_DB = {
  "231106040902": {
    nama: "Adi Saputra",
    nim: "231106040902",
    fakultas: "Fakultas Teknik dan Sains",
    prodi: "Teknik Informatika",
    tahunLulus: "2026",
    status: "Terbit",
    ipk: "3.85",
    noSeriIjazah: "077/S.4.0/UIKA/2026",
    tanggalKelulusan: "24 Juni 2026",
    tempatLahir: "Bogor",
    tanggalLahir: "18 Oktober 2004",
    jenisKelamin: "Laki-laki",
    email: "adi.saputra@student.uika.ac.id",
    noTelp: "081234567890",
    batch: "Batch 11",
    tahunMasuk: "2022",
    totalSks: "144",
    nik: "3271012010040001",
    noIjazahNasional: "DN-231106040902-2026",
    skAkreditasi: "123/SK/LAM-INFRA/Akred/S/IX/2024",
  },
  "231106040903": {
    nama: "Rani Maharani",
    nim: "231106040903",
    fakultas: "Fakultas Ekonomi dan Bisnis",
    prodi: "Manajemen",
    tahunLulus: "2026",
    status: "Terbit",
    ipk: "3.92",
    noSeriIjazah: "078/S.4.0/UIKA/2026",
    tanggalKelulusan: "24 Juni 2026",
    tempatLahir: "Jakarta",
    tanggalLahir: "15 Maret 2004",
    jenisKelamin: "Perempuan",
    email: "rani.maharani@student.uika.ac.id",
    noTelp: "081234567891",
    batch: "Batch 4",
    tahunMasuk: "2022",
    totalSks: "144",
    nik: "3171011503040002",
    noIjazahNasional: "DN-231106040903-2026",
    skAkreditasi: "456/SK/LAM-FEB/Akred/S/IX/2024",
  },
  "231106040910": {
    nama: "Budi Pratama",
    nim: "231106040910",
    fakultas: "Fakultas Teknik dan Sains",
    prodi: "Teknik Mesin",
    tahunLulus: "2026",
    status: "Terbit",
    ipk: "3.75",
    noSeriIjazah: "079/S.4.0/UIKA/2026",
    tanggalKelulusan: "24 Juni 2026",
    tempatLahir: "Bandung",
    tanggalLahir: "10 Februari 2004",
    jenisKelamin: "Laki-laki",
    email: "budi.pratama@student.uika.ac.id",
    noTelp: "081234567892",
    batch: "Batch 11",
    tahunMasuk: "2022",
    totalSks: "144",
    nik: "3273011002040003",
    noIjazahNasional: "DN-231106040910-2026",
    skAkreditasi: "789/SK/LAM-TEKNIK/Akred/S/IX/2024",
  },
};

// ── Format tanggal Indonesia ──────────────────────────────────────────────────
const formatTanggalIndonesia = (tanggal) => {
  const date = new Date(tanggal);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ── Komponen utama ────────────────────────────────────────────────────────────
const ScanQRResult = () => {
  const { nim } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const found = MAHASISWA_DB[nim] || MAHASISWA_DB["231106040902"];
      setData(found);
      setLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, [nim]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "3px solid #E5E7EB",
            borderTopColor: "#0B4B48",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Memverifikasi dokumen…</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          padding: "24px",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiAlertCircle size={36} color="#EF4444" />
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1F2937", margin: 0 }}>
          Verifikasi Gagal
        </h2>
        <p style={{ fontSize: "13px", color: "#6B7280", textAlign: "center", margin: 0 }}>
          Dokumen tidak ditemukan atau tidak valid.
        </p>
      </div>
    );
  }

  const tanggalTerbit = formatTanggalIndonesia(data.tanggalKelulusan);
  const inisial = data.nama.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const bgColor = data.jenisKelamin === "Perempuan" ? "#EC4899" : "#0B4B48";

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      {/* TOP NAV BAR */}
      <div
        style={{
          background: "white",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={Logo}
            alt="Logo UIKA"
            style={{ width: "36px", height: "36px", objectFit: "contain" }}
          />
          <div style={{ lineHeight: 1.3 }}>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#0B4B48", margin: 0 }}>
              Universitas
            </p>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#059669", margin: 0 }}>
              Ibn Khaldun Bogor
            </p>
          </div>
        </div>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 12px",
            borderRadius: "999px",
            background: "#D1FAE5",
            color: "#065F46",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          <FiCheckCircle size={13} />
          Terbit
        </span>
      </div>

      {/* CONTENT */}
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "20px 16px 48px",
        }}
      >
        {/* CARD 1: DOKUMEN VALID */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "28px 20px",
            textAlign: "center",
            marginBottom: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "#ECFDF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <FiCheckCircle size={32} color="#059669" />
          </div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "800",
              color: "#1F2937",
              margin: "0 0 4px",
            }}
          >
            DOKUMEN VALID
          </h2>
          <p style={{ fontSize: "12px", color: "#059669", fontWeight: "500", margin: 0 }}>
            Verifikasi Berhasil Sistem Terpusat
          </p>
        </div>

        {/* CARD 2: FOTO + INFORMASI MAHASISWA */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            {/* FOTO KTP */}
            <div
              style={{
                width: "100px",
                height: "130px",
                background: bgColor,
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "38px",
                  fontWeight: "700",
                  color: "white",
                  marginBottom: "4px",
                }}
              >
                {inisial}
              </span>
              <div
                style={{
                  width: "35px",
                  height: "2px",
                  background: "rgba(255,255,255,0.3)",
                  margin: "6px 0",
                }}
              />
              <p
                style={{
                  fontSize: "8px",
                  color: "rgba(255,255,255,0.8)",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {data.jenisKelamin}
              </p>
            </div>

            {/* INFORMASI DOKUMEN & MAHASISWA */}
            <div style={{ flex: 1 }}>
              {/* Tanggal Terbit & Nomor Seri */}
              <div
                style={{
                  marginBottom: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #E5E7EB",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "9px", color: "#9CA3AF", margin: "0 0 2px" }}>
                      Tanggal Terbit Ijazah
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#0B4B48",
                        margin: 0,
                      }}
                    >
                      {tanggalTerbit}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "9px", color: "#9CA3AF", margin: "0 0 2px" }}>
                      Nomor Seri Ijazah
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        color: "#1F2937",
                        margin: 0,
                      }}
                    >
                      {data.noSeriIjazah}
                    </p>
                  </div>
                </div>

                {/* STATUS - dipindah di bawah Nomor Seri */}
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#059669",
                      background: "#D1FAE5",
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: "20px",
                      margin: 0,
                    }}
                  >
                    ✓ Status: Lulus
                  </p>
                </div>
              </div>

              {/* Informasi Mahasiswa */}
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#1F2937",
                    margin: "0 0 12px",
                  }}
                >
                  Informasi Mahasiswa
                </p>

                {/* Nama */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <p style={{ fontSize: "11px", color: "#6B7280", margin: 0 }}>Nama Mahasiswa</p>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#1F2937",
                      margin: 0,
                      textAlign: "right",
                      maxWidth: "55%",
                    }}
                  >
                    {data.nama}
                  </p>
                </div>

                {/* NIM */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <p style={{ fontSize: "11px", color: "#6B7280", margin: 0 }}>NIM</p>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#1F2937",
                      margin: 0,
                    }}
                  >
                    {data.nim}
                  </p>
                </div>

                {/* Fakultas */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <p style={{ fontSize: "11px", color: "#6B7280", margin: 0 }}>Fakultas</p>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#1F2937",
                      margin: 0,
                      textAlign: "right",
                      maxWidth: "55%",
                    }}
                  >
                    {data.fakultas.replace("Fakultas ", "")}
                  </p>
                </div>

                {/* Program Studi */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <p style={{ fontSize: "11px", color: "#6B7280", margin: 0 }}>Program Studi</p>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#1F2937",
                      margin: 0,
                      textAlign: "right",
                      maxWidth: "55%",
                    }}
                  >
                    {data.prodi}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <p
          style={{
            textAlign: "center",
            fontSize: "10px",
            color: "#D1D5DB",
            margin: "20px 0 0",
            lineHeight: 1.6,
          }}
        >
          Dokumen ini telah terverifikasi secara digital
          <br />
          © {data.tahunLulus} Universitas Ibn Khaldun Bogor
        </p>
      </div>
    </div>
  );
};

export default ScanQRResult;