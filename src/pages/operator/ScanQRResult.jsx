// src/pages/operator/ScanQRResult.jsx
// Halaman hasil scan QR Ijazah — mobile-first, responsive di web

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

// Logo dari folder assets/img/
import Logo from "../../assets/img/Logo.jpg";
import { verifyDocumentByQr } from "../../services/document.api";



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
const { kodeQr } = useParams();
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  const fetchVerification = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await verifyDocumentByQr(kodeQr);

      if (!result?.success || result?.data?.is_valid !== true) {
        setData(null);
        setError(result.message || "Dokumen tidak ditemukan atau tidak valid.");
        return;
      }

      setData(result.data);
    } catch (err) {
      setData(null);
      setError(err.message || "Gagal memverifikasi dokumen.");
    } finally {
      setLoading(false);
    }
  };

  fetchVerification();
}, [kodeQr]);

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

const mahasiswa = data.mahasiswa || {};
const fotoUrl = mahasiswa.foto
  ? mahasiswa.foto.startsWith("http")
    ? mahasiswa.foto
    : `${API_BASE_URL}${mahasiswa.foto.startsWith("/") ? mahasiswa.foto : `/${mahasiswa.foto}`}`
  : null;
const tanggalTerbit = formatTanggalIndonesia(data.tanggal_terbit);
const namaMahasiswa = mahasiswa.nama_mahasiswa || "-";
const inisial = namaMahasiswa
  .split(" ")
  .map((n) => n[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);

const bgColor = mahasiswa.jenis_kelamin === "Perempuan" ? "#EC4899" : "#0B4B48";

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
            {/* FOTO KTP - tanpa tulisan jenis kelamin */}
            <div
              style={{
                width: "100px",
                height: "120px",
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

{fotoUrl ? (
  <img
    src={fotoUrl}
    alt={namaMahasiswa}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "8px",
    }}
  />) :
   (
  <>
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
      {mahasiswa.jenis_kelamin || "-kiki"}
    </p>
  </>
)}

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
                     {data.nomor_dokumen || "-"}
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
                   {mahasiswa.nama_mahasiswa || "-"}
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
                   {mahasiswa.nim || "-"}
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
                    {(mahasiswa.fakultas || "-").replace("Fakultas ", "")}
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
                    {mahasiswa.program_studi || "-"}
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
          © {new Date(data.tanggal_terbit).getFullYear() || new Date().getFullYear()} Universitas Ibn Khaldun Bogor
        </p>
      </div>
    </div>
  );
};

export default ScanQRResult;