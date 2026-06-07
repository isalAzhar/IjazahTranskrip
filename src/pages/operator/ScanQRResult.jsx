// src/pages/operator/ScanQRResult.jsx
// Halaman hasil scan QR Ijazah — mobile-first, responsive di web

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiAlertCircle, FiChevronDown } from "react-icons/fi";

// Logo dan Template dari folder assets/img/
import Logo from "../../assets/img/Logo.jpg";
import TemplateIjazah from "../../assets/img/Tamplate Ijazah.jpg";
import TemplateTranskip from "../../assets/img/Tamplate Transkip.jpg";

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

const getGelar = (prodi = "") => {
  const p = prodi.toLowerCase();
  if (p.includes("informatika") || p.includes("mesin") || p.includes("sipil") || p.includes("elektro") || p.includes("industri")) {
    return "Sarjana Teknik (S.T.)";
  }
  if (p.includes("manajemen") || p.includes("akuntansi") || p.includes("bisnis")) {
    return "Sarjana Ekonomi (S.E.)";
  }
  if (p.includes("hukum")) {
    return "Sarjana Hukum (S.H.)";
  }
  if (p.includes("agama") || p.includes("syariah")) {
    return "Sarjana Agama (S.Ag.)";
  }
  if (p.includes("kesehatan") || p.includes("gizi")) {
    return "Sarjana Kesehatan Masyarakat (S.K.M.)";
  }
  if (p.includes("pendidikan")) {
    return "Sarjana Pendidikan (S.Pd.)";
  }
  return "Sarjana (S.1)";
};

// ── Komponen Ijazah Full (menampilkan gambar template) ──────────────────────────────────────
const IjazahFull = () => {
  return (
    <div style={{
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}>
      <img 
        src={TemplateIjazah} 
        alt="Template Ijazah" 
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />
    </div>
  );
};

// ── Komponen Transkrip Full (menampilkan gambar template) ───────────────────────────────────
const TranskripFull = () => {
  return (
    <div style={{
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}>
      <img 
        src={TemplateTranskip} 
        alt="Template Transkrip" 
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />
    </div>
  );
};

// ── Row info ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, bold, green }) => (
  <div>
    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 2px", fontWeight: "500" }}>{label}</p>
    <p style={{
      fontSize: "14px",
      fontWeight: bold ? "700" : "600",
      color: green ? "#059669" : "#1F2937",
      margin: 0,
    }}>
      {value}
    </p>
  </div>
);

// ── Komponen utama ────────────────────────────────────────────────────────────
const ScanQRResult = () => {
  const navigate = useNavigate();
  const { nim } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState("ijazah");

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
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", gap: "12px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid #E5E7EB", borderTopColor: "#0B4B48", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Memverifikasi dokumen…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", padding: "24px", gap: "16px" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FiAlertCircle size={36} color="#EF4444" />
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1F2937", margin: 0 }}>Verifikasi Gagal</h2>
        <p style={{ fontSize: "13px", color: "#6B7280", textAlign: "center", margin: 0 }}>Dokumen tidak ditemukan atau tidak valid.</p>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "10px", background: "#0B4B48", color: "white", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          <FiArrowLeft size={15} /> Kembali
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      {/* TOP NAV BAR */}
      <div style={{ background: "white", borderBottom: "1px solid #E5E7EB", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={Logo} alt="Logo UIKA" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          <div style={{ lineHeight: 1.3 }}>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#0B4B48", margin: 0 }}>Universitas</p>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#059669", margin: 0 }}>Ibn Khaldun Bogor</p>
          </div>
        </div>
        <span style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "999px", background: "#D1FAE5", color: "#065F46", fontSize: "12px", fontWeight: "700" }}>
          <FiCheckCircle size={13} />
          Terbit
        </span>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px 48px" }}>
        {/* DOKUMEN VALID CARD */}
        <div style={{ background: "white", borderRadius: "20px", border: "1px solid #D1FAE5", padding: "28px 24px", textAlign: "center", marginBottom: "16px", boxShadow: "0 2px 12px rgba(11,75,72,0.08)" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#ECFDF5", border: "3px solid #D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", border: "2.5px solid #059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiCheckCircle size={28} color="#059669" />
            </div>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1F2937", margin: "0 0 6px", letterSpacing: "0.5px" }}>DOKUMEN VALID</h2>
          <p style={{ fontSize: "13px", color: "#059669", fontWeight: "600", margin: 0 }}>Verifikasi Berhasil Sistem Terpusat</p>
        </div>

        {/* INFO MAHASISWA */}
        <div style={{ background: "white", borderRadius: "16px", border: "0.5px solid #E5E7EB", overflow: "hidden", marginBottom: "16px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "14px 18px", borderBottom: "0.5px solid #F3F4F6", background: "#FAFAFA" }}>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#374151", margin: 0 }}>Informasi Mahasiswa</p>
          </div>
          <div style={{ padding: "18px", display: "grid", gap: "16px" }}>
            <InfoRow label="Nama Mahasiswa" value={data.nama} bold />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <InfoRow label="NIM" value={data.nim} />
              <InfoRow label="Status" value="Lulus" green />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <InfoRow label="Fakultas" value={data.fakultas.replace("Fakultas ", "")} />
              <InfoRow label="Program Studi" value={data.prodi} />
            </div>
          </div>
        </div>

        {/* PRATINJAU DOKUMEN */}
        <div style={{ marginBottom: "24px" }}>
          {/* Header dengan judul dan dropdown di sebelah kanan */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0B4B48" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <p style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", letterSpacing: "0.8px", margin: 0 }}>
                PRATINJAU DOKUMEN
              </p>
            </div>
            
            {/* Dropdown di sebelah kanan */}
            <div style={{ position: "relative", width: "180px" }}>
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 28px 6px 10px",
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "#1F2937",
                  background: "white",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  appearance: "none",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="ijazah"> Ijazah</option>
                <option value="transkrip">Transkrip</option>
              </select>
              <div style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <FiChevronDown size={12} color="#6B7280" />
              </div>
            </div>
          </div>

          {/* SATU FRAME UTAMA */}
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            
            {/* Konten - Menampilkan gambar template sesuai pilihan */}
            <div style={{ padding: "16px" }}>
              {selectedDoc === "ijazah" ? <IjazahFull /> : <TranskripFull />}
            </div>

            {/* Footer */}
            <div style={{ padding: "10px 16px", background: "#FAFAFA", borderTop: "1px solid #F3F4F6", textAlign: "center" }}>
            </div>
          </div>
        </div>

        {/* TOMBOL KEMBALI */}
        <button onClick={() => navigate(-1)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", borderRadius: "12px", background: "#0B4B48", color: "white", border: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginBottom: "20px" }}>
          <FiArrowLeft size={16} /> Kembali
        </button>

        {/* FOOTER */}
        <p style={{ textAlign: "center", fontSize: "10px", color: "#D1D5DB", margin: 0, lineHeight: 1.6 }}>
          Dokumen ini telah terverifikasi secara digital<br />
          © {data.tahunLulus} Universitas Ibn Khaldun Bogor
        </p>
      </div>
    </div>
  );
};

export default ScanQRResult;