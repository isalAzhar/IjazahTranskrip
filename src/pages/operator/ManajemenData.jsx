// src/pages/operator/ManajemenData.jsx

import React, { useState, useMemo, useEffect } from "react";
import {
  FiSearch,
  FiUpload,
  FiDownload,
  FiChevronDown,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import ImportDataModal from "./ImportDataModal";

const ManajemenData = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);

  const itemsPerPage = 10;

  const fakultasList = [
    { nama: "Semua Fakultas", kode: "ALL" },
    { nama: "Fakultas Teknik dan Sains", kode: "FTS" },
    { nama: "Fakultas Ekonomi dan Bisnis", kode: "FEB" },
    { nama: "Fakultas Hukum", kode: "FH" },
    { nama: "Fakultas Agama Islam", kode: "FAI" },
    { nama: "Fakultas Ilmu Kesehatan", kode: "FIKES" },
    { nama: "Fakultas Keguruan dan Ilmu Pendidikan", kode: "FKIP" },
  ];

  const tahunList = ["Semua Tahun", "2024", "2025", "2026"];

  // DATA MAHASISWA LENGKAP - NAMA URUT A-Z GLOBAL
  const dataMahasiswa = useMemo(() => {
    const allData = [
      // A
      { id: 1, nama: "Adi Saputra", nim: "231106040901", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Informatika", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bogor", tanggalLahir: "15 Januari 2004", jenisKelamin: "Laki-laki", email: "adi.saputra@student.uika.ac.id", noTelp: "081234567801", tahunMasuk: "2022", ipk: "3.75", totalSks: "146" },
      { id: 2, nama: "Ahmad Zaki", nim: "231106040921", fakultas: "Fakultas Hukum", prodi: "Ilmu Hukum", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Jakarta", tanggalLahir: "10 Maret 2004", jenisKelamin: "Laki-laki", email: "ahmad.zaki@student.uika.ac.id", noTelp: "081234567821", tahunMasuk: "2021", ipk: "3.65", totalSks: "144" },
      { id: 3, nama: "Aisyah Putri", nim: "231106040927", fakultas: "Fakultas Ilmu Kesehatan", prodi: "Kesehatan Masyarakat", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Depok", tanggalLahir: "10 Maret 2005", jenisKelamin: "Perempuan", email: "aisyah.putri@student.uika.ac.id", noTelp: "081234567827", tahunMasuk: "2020", ipk: "3.70", totalSks: "144" },
      { id: 4, nama: "Andi Wijaya", nim: "231106040926", fakultas: "Fakultas Agama Islam", prodi: "Pendidikan Agama Islam", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Bogor", tanggalLahir: "25 Januari 2004", jenisKelamin: "Laki-laki", email: "andi.wijaya@student.uika.ac.id", noTelp: "081234567826", tahunMasuk: "2021", ipk: "3.60", totalSks: "144" },
      { id: 5, nama: "Aulia Rahman", nim: "231106040932", fakultas: "Fakultas Ilmu Kesehatan", prodi: "Ilmu Gizi", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Bogor", tanggalLahir: "25 Juli 2004", jenisKelamin: "Perempuan", email: "aulia.rahman@student.uika.ac.id", noTelp: "081234567832", tahunMasuk: "2020", ipk: "3.60", totalSks: "144" },
      
      // B
      { id: 6, nama: "Baedilah", nim: "231106040926", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Akuntansi", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bekasi", tanggalLahir: "5 Mei 2004", jenisKelamin: "Laki-laki", email: "baedilah@student.uika.ac.id", noTelp: "081234567826", tahunMasuk: "2022", ipk: "3.30", totalSks: "144" },
      { id: 7, nama: "Bambang Sutrisno", nim: "231106040928", fakultas: "Fakultas Ilmu Kesehatan", prodi: "Ilmu Gizi", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Bandung", tanggalLahir: "22 April 2005", jenisKelamin: "Laki-laki", email: "bambang.sutrisno@student.uika.ac.id", noTelp: "081234567828", tahunMasuk: "2020", ipk: "3.60", totalSks: "144" },
      { id: 8, nama: "Budi Pratama", nim: "231106040902", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Informatika", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Depok", tanggalLahir: "10 Februari 2004", jenisKelamin: "Laki-laki", email: "budi.pratama@student.uika.ac.id", noTelp: "081234567802", tahunMasuk: "2022", ipk: "3.65", totalSks: "146" },
      
      // C
      { id: 9, nama: "Cindy Larasati", nim: "231106040929", fakultas: "Fakultas Ilmu Kesehatan", prodi: "Kesehatan Masyarakat", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Bekasi", tanggalLahir: "5 Mei 2005", jenisKelamin: "Perempuan", email: "cindy.larasati@student.uika.ac.id", noTelp: "081234567829", tahunMasuk: "2020", ipk: "3.75", totalSks: "144" },
      { id: 10, nama: "Citra Dewi", nim: "231106040905", fakultas: "Fakultas Hukum", prodi: "Ilmu Hukum", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Tangerang", tanggalLahir: "18 November 2004", jenisKelamin: "Perempuan", email: "citra.dewi@student.uika.ac.id", noTelp: "081234567805", tahunMasuk: "2021", ipk: "3.75", totalSks: "144" },
      { id: 11, nama: "Citra Dewi", nim: "231106040903", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Informatika", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Jakarta", tanggalLahir: "20 Maret 2004", jenisKelamin: "Perempuan", email: "citra.dewi@student.uika.ac.id", noTelp: "081234567803", tahunMasuk: "2022", ipk: "3.85", totalSks: "146" },
      
      // D
      { id: 12, nama: "Dedi Kurniawan", nim: "231106040930", fakultas: "Fakultas Keguruan dan Ilmu Pendidikan", prodi: "Pendidikan Bahasa Inggris", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Tangerang", tanggalLahir: "18 Juni 2005", jenisKelamin: "Laki-laki", email: "dedi.kurniawan@student.uika.ac.id", noTelp: "081234567830", tahunMasuk: "2020", ipk: "3.55", totalSks: "144" },
      { id: 13, nama: "Dewi Kartika", nim: "231106040930", fakultas: "Fakultas Agama Islam", prodi: "Pendidikan Agama Islam", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Bekasi", tanggalLahir: "30 Mei 2004", jenisKelamin: "Perempuan", email: "dewi.kartika@student.uika.ac.id", noTelp: "081234567830", tahunMasuk: "2021", ipk: "3.80", totalSks: "144" },
      { id: 14, nama: "Dila Fadilla", nim: "231106040922", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Manajemen", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bogor", tanggalLahir: "3 Maret 2004", jenisKelamin: "Perempuan", email: "dila.fadilla@student.uika.ac.id", noTelp: "081234567822", tahunMasuk: "2022", ipk: "3.60", totalSks: "144" },
      { id: 15, nama: "Dimas Nugraha", nim: "231106040924", fakultas: "Fakultas Hukum", prodi: "Ilmu Hukum", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Bekasi", tanggalLahir: "5 September 2004", jenisKelamin: "Laki-laki", email: "dimas.nugraha@student.uika.ac.id", noTelp: "081234567824", tahunMasuk: "2021", ipk: "3.45", totalSks: "144" },
      { id: 16, nama: "Dwi Cahyo", nim: "231106040904", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Mesin", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bandung", tanggalLahir: "5 April 2004", jenisKelamin: "Laki-laki", email: "dwi.cahyo@student.uika.ac.id", noTelp: "081234567804", tahunMasuk: "2022", ipk: "3.55", totalSks: "144" },
      
      // E
      { id: 17, nama: "Eagle Al-Haikal", nim: "231106040907", fakultas: "Fakultas Teknik dan Sains", prodi: "Sistem Informasi", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Depok", tanggalLahir: "30 September 2004", jenisKelamin: "Laki-laki", email: "eagle.haikal@student.uika.ac.id", noTelp: "081234567807", tahunMasuk: "2022", ipk: "3.10", totalSks: "144" },
      { id: 18, nama: "Eka Putri", nim: "231106040905", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Informatika", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bekasi", tanggalLahir: "12 Mei 2004", jenisKelamin: "Perempuan", email: "eka.putri@student.uika.ac.id", noTelp: "081234567805", tahunMasuk: "2022", ipk: "3.70", totalSks: "146" },
      { id: 19, nama: "Eko Prasetyo", nim: "231106040940", fakultas: "Fakultas Keguruan dan Ilmu Pendidikan", prodi: "Pendidikan Bahasa Inggris", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Depok", tanggalLahir: "15 Maret 2004", jenisKelamin: "Laki-laki", email: "eko.prasetyo@student.uika.ac.id", noTelp: "081234567840", tahunMasuk: "2020", ipk: "3.50", totalSks: "144" },
      { id: 20, nama: "Erisa Anggraini", nim: "231106040931", fakultas: "Fakultas Keguruan dan Ilmu Pendidikan", prodi: "Teknologi Pendidikan", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Bogor", tanggalLahir: "30 Juli 2005", jenisKelamin: "Perempuan", email: "erisa.anggraini@student.uika.ac.id", noTelp: "081234567831", tahunMasuk: "2020", ipk: "3.65", totalSks: "144" },
      
      // F
      { id: 21, nama: "Fajar Ramadhan", nim: "231106040922", fakultas: "Fakultas Hukum", prodi: "Ilmu Hukum", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Depok", tanggalLahir: "15 Mei 2004", jenisKelamin: "Laki-laki", email: "fajar.ramadhan@student.uika.ac.id", noTelp: "081234567822", tahunMasuk: "2021", ipk: "3.70", totalSks: "144" },
      { id: 22, nama: "Farhan Hidayat", nim: "231106040906", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Sipil", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Tangerang", tanggalLahir: "18 Juni 2004", jenisKelamin: "Laki-laki", email: "farhan.hidayat@student.uika.ac.id", noTelp: "081234567806", tahunMasuk: "2022", ipk: "3.45", totalSks: "144" },
      { id: 23, nama: "Farhan Kurniawan", nim: "231106040933", fakultas: "Fakultas Ilmu Kesehatan", prodi: "Kesehatan Masyarakat", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Jakarta", tanggalLahir: "8 Agustus 2004", jenisKelamin: "Laki-laki", email: "farhan.kurniawan@student.uika.ac.id", noTelp: "081234567833", tahunMasuk: "2020", ipk: "3.55", totalSks: "144" },
      { id: 24, nama: "Febriyanto", nim: "231106040932", fakultas: "Fakultas Keguruan dan Ilmu Pendidikan", prodi: "Pendidikan Bahasa Inggris", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Jakarta", tanggalLahir: "12 Agustus 2005", jenisKelamin: "Laki-laki", email: "febriyanto@student.uika.ac.id", noTelp: "081234567832", tahunMasuk: "2020", ipk: "3.70", totalSks: "144" },
      
      // G
      { id: 25, nama: "Gita Lestari", nim: "231106040907", fakultas: "Fakultas Teknik dan Sains", prodi: "Sistem Informasi", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bogor", tanggalLahir: "25 Juli 2004", jenisKelamin: "Perempuan", email: "gita.lestari@student.uika.ac.id", noTelp: "081234567807", tahunMasuk: "2022", ipk: "3.60", totalSks: "144" },
      
      // H
      { id: 26, nama: "Hendra Gunawan", nim: "231106040908", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Informatika", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Depok", tanggalLahir: "3 Agustus 2004", jenisKelamin: "Laki-laki", email: "hendra.gunawan@student.uika.ac.id", noTelp: "081234567808", tahunMasuk: "2022", ipk: "3.80", totalSks: "146" },
      { id: 27, nama: "Husni Haqiqi", nim: "231106040938", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Manajemen", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Tangerang", tanggalLahir: "14 April 2004", jenisKelamin: "Laki-laki", email: "husni.haqiqi@student.uika.ac.id", noTelp: "081234567838", tahunMasuk: "2022", ipk: "3.55", totalSks: "144" },
      
      // I
      { id: 28, nama: "Indah Permatasari", nim: "231106040909", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Mesin", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Jakarta", tanggalLahir: "14 September 2004", jenisKelamin: "Perempuan", email: "indah.permatasari@student.uika.ac.id", noTelp: "081234567809", tahunMasuk: "2022", ipk: "3.50", totalSks: "144" },
      { id: 29, nama: "Indra Saputra", nim: "231106040936", fakultas: "Fakultas Keguruan dan Ilmu Pendidikan", prodi: "Pendidikan Bahasa Inggris", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Bekasi", tanggalLahir: "5 November 2004", jenisKelamin: "Laki-laki", email: "indra.saputra@student.uika.ac.id", noTelp: "081234567836", tahunMasuk: "2020", ipk: "3.45", totalSks: "144" },
      
      // J
      { id: 30, nama: "Joko Susilo", nim: "231106040910", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Sipil", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bandung", tanggalLahir: "22 Oktober 2004", jenisKelamin: "Laki-laki", email: "joko.susilo@student.uika.ac.id", noTelp: "081234567810", tahunMasuk: "2022", ipk: "3.40", totalSks: "144" },
      
      // K
      { id: 31, nama: "Kartika Sari", nim: "231106040911", fakultas: "Fakultas Teknik dan Sains", prodi: "Sistem Informasi", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Bekasi", tanggalLahir: "8 November 2004", jenisKelamin: "Perempuan", email: "kartika.sari@student.uika.ac.id", noTelp: "081234567811", tahunMasuk: "2021", ipk: "3.55", totalSks: "144" },
      { id: 32, nama: "Kayla Keyla", nim: "231106040904", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Mesin", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bandung", tanggalLahir: "25 Maret 2004", jenisKelamin: "Perempuan", email: "kayla.key@student.uika.ac.id", noTelp: "081234567804", tahunMasuk: "2022", ipk: "3.55", totalSks: "144" },
      
      // L
      { id: 33, nama: "Lukman Hakim", nim: "231106040912", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Informatika", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Tangerang", tanggalLahir: "30 Desember 2004", jenisKelamin: "Laki-laki", email: "lukman.hakim@student.uika.ac.id", noTelp: "081234567812", tahunMasuk: "2021", ipk: "3.65", totalSks: "146" },
      
      // M
      { id: 34, nama: "Maya Sari", nim: "231106040913", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Manajemen", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bogor", tanggalLahir: "3 Januari 2004", jenisKelamin: "Perempuan", email: "maya.sari@student.uika.ac.id", noTelp: "081234567813", tahunMasuk: "2022", ipk: "3.70", totalSks: "144" },
      { id: 35, nama: "Maya Sari", nim: "231106040937", fakultas: "Fakultas Keguruan dan Ilmu Pendidikan", prodi: "Teknologi Pendidikan", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Tangerang", tanggalLahir: "18 Desember 2004", jenisKelamin: "Perempuan", email: "maya.sari@student.uika.ac.id", noTelp: "081234567837", tahunMasuk: "2020", ipk: "3.60", totalSks: "144" },
      { id: 36, nama: "Mutqin", nim: "231106040927", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Bisnis Digital", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Depok", tanggalLahir: "30 November 2004", jenisKelamin: "Laki-laki", email: "mutqin@student.uika.ac.id", noTelp: "081234567827", tahunMasuk: "2022", ipk: "3.60", totalSks: "144" },
      
      // N
      { id: 37, nama: "Nabila Putri", nim: "231106040928", fakultas: "Fakultas Agama Islam", prodi: "Pendidikan Agama Islam", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Depok", tanggalLahir: "8 Maret 2004", jenisKelamin: "Perempuan", email: "nabila.putri@student.uika.ac.id", noTelp: "081234567828", tahunMasuk: "2021", ipk: "3.85", totalSks: "144" },
      { id: 38, nama: "Nanda Putra", nim: "231106040914", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Akuntansi", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Jakarta", tanggalLahir: "15 Februari 2004", jenisKelamin: "Laki-laki", email: "nanda.putra@student.uika.ac.id", noTelp: "081234567814", tahunMasuk: "2022", ipk: "3.60", totalSks: "144" },
      { id: 39, nama: "Nayla Nim", nim: "231106040923", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Akuntansi", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Jakarta", tanggalLahir: "15 Juli 2004", jenisKelamin: "Perempuan", email: "nayla.nim@student.uika.ac.id", noTelp: "081234567823", tahunMasuk: "2022", ipk: "3.55", totalSks: "144" },
      
      // O
      { id: 40, nama: "Oktavia Dewi", nim: "231106040915", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Bisnis Digital", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Depok", tanggalLahir: "28 Maret 2004", jenisKelamin: "Perempuan", email: "oktavia.dewi@student.uika.ac.id", noTelp: "081234567815", tahunMasuk: "2022", ipk: "3.55", totalSks: "144" },
      
      // P
      { id: 41, nama: "Pramono Surya", nim: "231106040916", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Manajemen", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bandung", tanggalLahir: "10 April 2004", jenisKelamin: "Laki-laki", email: "pramono.surya@student.uika.ac.id", noTelp: "081234567816", tahunMasuk: "2022", ipk: "3.80", totalSks: "144" },
      { id: 42, nama: "Putri Lestari", nim: "231106040923", fakultas: "Fakultas Hukum", prodi: "Ilmu Hukum", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Bandung", tanggalLahir: "22 Juli 2004", jenisKelamin: "Perempuan", email: "putri.lestari@student.uika.ac.id", noTelp: "081234567823", tahunMasuk: "2021", ipk: "3.80", totalSks: "144" },
      
      // Q
      { id: 43, nama: "Qonita Khairunnisa", nim: "231106040917", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Akuntansi", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bekasi", tanggalLahir: "22 Mei 2004", jenisKelamin: "Perempuan", email: "qonita.khairunnisa@student.uika.ac.id", noTelp: "081234567817", tahunMasuk: "2022", ipk: "3.75", totalSks: "144" },
      
      // R
      { id: 44, nama: "Raka Aditya", nim: "231106040918", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Bisnis Digital", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Tangerang", tanggalLahir: "5 Juni 2004", jenisKelamin: "Laki-laki", email: "raka.aditya@student.uika.ac.id", noTelp: "081234567818", tahunMasuk: "2021", ipk: "3.50", totalSks: "144" },
      { id: 45, nama: "Rani Maharani", nim: "231106040903", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Informatika", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Jakarta", tanggalLahir: "20 Agustus 2004", jenisKelamin: "Perempuan", email: "rani.maharani@student.uika.ac.id", noTelp: "081234567803", tahunMasuk: "2022", ipk: "3.85", totalSks: "146" },
      { id: 46, nama: "Rayyan Hesa", nim: "231106040932", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Manajemen", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Depok", tanggalLahir: "12 Agustus 2004", jenisKelamin: "Laki-laki", email: "rayyan.hesa@student.uika.ac.id", noTelp: "081234567832", tahunMasuk: "2022", ipk: "3.50", totalSks: "144" },
      { id: 47, nama: "Rina Maharani", nim: "231106040935", fakultas: "Fakultas Ilmu Kesehatan", prodi: "Kesehatan Masyarakat", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Bandung", tanggalLahir: "20 Oktober 2004", jenisKelamin: "Perempuan", email: "rina.maharani@student.uika.ac.id", noTelp: "081234567835", tahunMasuk: "2020", ipk: "3.70", totalSks: "144" },
      { id: 48, nama: "Rina Wulandari", nim: "231106040939", fakultas: "Fakultas Keguruan dan Ilmu Pendidikan", prodi: "Teknologi Pendidikan", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Jakarta", tanggalLahir: "8 Februari 2004", jenisKelamin: "Perempuan", email: "rina.wulandari@student.uika.ac.id", noTelp: "081234567839", tahunMasuk: "2020", ipk: "3.65", totalSks: "144" },
      { id: 49, nama: "Risma Puspita", nim: "231106040920", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Informatika", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Tangerang", tanggalLahir: "12 Desember 2004", jenisKelamin: "Perempuan", email: "risma.puspita@student.uika.ac.id", noTelp: "081234567820", tahunMasuk: "2022", ipk: "3.70", totalSks: "146" },
      { id: 50, nama: "Rizky Gusti A", nim: "231106040919", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Informatika", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bekasi", tanggalLahir: "5 Juli 2004", jenisKelamin: "Laki-laki", email: "rizky.gusti@student.uika.ac.id", noTelp: "081234567819", tahunMasuk: "2022", ipk: "3.45", totalSks: "146" },
      { id: 51, nama: "Rizky Maulana", nim: "231106040927", fakultas: "Fakultas Agama Islam", prodi: "Ekonomi Syariah", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Jakarta", tanggalLahir: "12 Februari 2004", jenisKelamin: "Laki-laki", email: "rizky.maulana@student.uika.ac.id", noTelp: "081234567827", tahunMasuk: "2021", ipk: "3.55", totalSks: "144" },
      
      // S
      { id: 52, nama: "Samsul Jun", nim: "231106040930", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Bisnis Digital", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bekasi", tanggalLahir: "25 Juni 2004", jenisKelamin: "Laki-laki", email: "samsul.jun@student.uika.ac.id", noTelp: "081234567830", tahunMasuk: "2022", ipk: "3.40", totalSks: "144" },
      { id: 53, nama: "Sari Wijayanti", nim: "231106040934", fakultas: "Fakultas Ilmu Kesehatan", prodi: "Ilmu Gizi", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Depok", tanggalLahir: "12 September 2004", jenisKelamin: "Perempuan", email: "sari.wijayanti@student.uika.ac.id", noTelp: "081234567834", tahunMasuk: "2020", ipk: "3.65", totalSks: "144" },
      { id: 54, nama: "Sinta Melati", nim: "231106040919", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Manajemen", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Bogor", tanggalLahir: "18 Juli 2004", jenisKelamin: "Perempuan", email: "sinta.melati@student.uika.ac.id", noTelp: "081234567819", tahunMasuk: "2021", ipk: "3.65", totalSks: "144" },
      { id: 55, nama: "Siti Aisyah", nim: "231106040906", fakultas: "Fakultas Teknik dan Sains", prodi: "Teknik Elektro", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bogor", tanggalLahir: "22 April 2004", jenisKelamin: "Perempuan", email: "siti.aisyah@student.uika.ac.id", noTelp: "081234567806", tahunMasuk: "2022", ipk: "3.15", totalSks: "144" },
      
      // T
      { id: 56, nama: "Tasya Cantika", nim: "231106040943", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Manajemen", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bandung", tanggalLahir: "22 Februari 2004", jenisKelamin: "Perempuan", email: "tasya.cantika@student.uika.ac.id", noTelp: "081234567843", tahunMasuk: "2022", ipk: "3.50", totalSks: "144" },
      { id: 57, nama: "Teguh Santoso", nim: "231106040920", fakultas: "Fakultas Hukum", prodi: "Ilmu Hukum", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Jakarta", tanggalLahir: "25 Agustus 2004", jenisKelamin: "Laki-laki", email: "teguh.santoso@student.uika.ac.id", noTelp: "081234567820", tahunMasuk: "2021", ipk: "3.70", totalSks: "144" },
      
      // U
      { id: 58, nama: "Umi Kalsum", nim: "231106040921", fakultas: "Fakultas Hukum", prodi: "Ilmu Hukum", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Depok", tanggalLahir: "3 September 2004", jenisKelamin: "Perempuan", email: "umi.kalsum@student.uika.ac.id", noTelp: "081234567821", tahunMasuk: "2021", ipk: "3.80", totalSks: "144" },
      
      // V
      { id: 59, nama: "Vicky Firmansyah", nim: "231106040922", fakultas: "Fakultas Hukum", prodi: "Ilmu Hukum", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Bandung", tanggalLahir: "12 Oktober 2004", jenisKelamin: "Laki-laki", email: "vicky.firmansyah@student.uika.ac.id", noTelp: "081234567822", tahunMasuk: "2021", ipk: "3.60", totalSks: "144" },
      
      // W
      { id: 60, nama: "Winda Sari", nim: "231106040923", fakultas: "Fakultas Hukum", prodi: "Ilmu Hukum", tahunLulus: "2024", batch: "Batch 1", tempatLahir: "Bekasi", tanggalLahir: "20 November 2004", jenisKelamin: "Perempuan", email: "winda.sari@student.uika.ac.id", noTelp: "081234567823", tahunMasuk: "2020", ipk: "3.75", totalSks: "144" },
      
      // X
      { id: 61, nama: "Xavier Nathaniel", nim: "231106040924", fakultas: "Fakultas Agama Islam", prodi: "Pendidikan Agama Islam", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Tangerang", tanggalLahir: "8 Desember 2004", jenisKelamin: "Laki-laki", email: "xavier.nathaniel@student.uika.ac.id", noTelp: "081234567824", tahunMasuk: "2021", ipk: "3.55", totalSks: "144" },
      
      // Y
      { id: 62, nama: "Yoga Pratama", nim: "231106040929", fakultas: "Fakultas Agama Islam", prodi: "Ekonomi Syariah", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Bandung", tanggalLahir: "20 April 2004", jenisKelamin: "Laki-laki", email: "yoga.pratama@student.uika.ac.id", noTelp: "081234567829", tahunMasuk: "2021", ipk: "3.65", totalSks: "144" },
      { id: 63, nama: "Yusuf Maulana", nim: "231106040925", fakultas: "Fakultas Agama Islam", prodi: "Ekonomi Syariah", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Bogor", tanggalLahir: "15 Januari 2005", jenisKelamin: "Laki-laki", email: "yusuf.maulana@student.uika.ac.id", noTelp: "081234567825", tahunMasuk: "2021", ipk: "3.65", totalSks: "144" },
      
      // Z
      { id: 64, nama: "Zahra Aulia", nim: "231106040926", fakultas: "Fakultas Agama Islam", prodi: "Pendidikan Agama Islam", tahunLulus: "2025", batch: "Batch 2", tempatLahir: "Jakarta", tanggalLahir: "28 Februari 2005", jenisKelamin: "Perempuan", email: "zahra.aulia@student.uika.ac.id", noTelp: "081234567826", tahunMasuk: "2021", ipk: "3.85", totalSks: "144" },
      { id: 65, nama: "Zahra Nabil", nim: "231106040918", fakultas: "Fakultas Teknik dan Sains", prodi: "Ilmu Lingkungan", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bandung", tanggalLahir: "8 November 2004", jenisKelamin: "Perempuan", email: "zahra.nabil@student.uika.ac.id", noTelp: "081234567818", tahunMasuk: "2022", ipk: "3.25", totalSks: "144" },
      { id: 66, nama: "Zahra Nur", nim: "231106040939", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Akuntansi", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Bogor", tanggalLahir: "9 September 2004", jenisKelamin: "Perempuan", email: "zahra.nur@student.uika.ac.id", noTelp: "081234567839", tahunMasuk: "2022", ipk: "3.70", totalSks: "144" },
      { id: 67, nama: "Zulvikri", nim: "231106040930", fakultas: "Fakultas Ekonomi dan Bisnis", prodi: "Bisnis Digital", tahunLulus: "2026", batch: "Batch 3", tempatLahir: "Tangerang", tanggalLahir: "18 Oktober 2004", jenisKelamin: "Laki-laki", email: "zulvikri@student.uika.ac.id", noTelp: "081234567830", tahunMasuk: "2022", ipk: "3.45", totalSks: "144" },
    ];
    
    // Urutkan berdasarkan nama A-Z
    return allData.sort((a, b) => a.nama.localeCompare(b.nama));
  }, []);

  const filteredData = useMemo(() => {
    let result = [...dataMahasiswa];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.nama.toLowerCase().includes(q) ||
          item.nim.toLowerCase().includes(q) ||
          item.prodi.toLowerCase().includes(q)
      );
    }

    if (selectedFakultas && selectedFakultas !== "Semua Fakultas") {
      result = result.filter((item) => item.fakultas === selectedFakultas);
    }

    if (selectedTahun && selectedTahun !== "Semua Tahun") {
      result = result.filter((item) => item.tahunLulus === selectedTahun);
    }

    return result;
  }, [dataMahasiswa, search, selectedFakultas, selectedTahun]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFakultas, selectedTahun]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDetailClick = (item) => {
    navigate(`/operator/detail-mahasiswa/${item.nim}`, { state: item });
  };

  // PAGINATION SAMA PERSIS DENGAN PELAPORAN
  const renderPaginationButtons = () => {
    const pages = [];
    pages.push(1);
    if (currentPage > 2 && totalPages > 3) pages.push("...");
    if (currentPage === 1 && totalPages > 1) {
      pages.push(2);
    } else if (currentPage === totalPages && totalPages > 2) {
      pages.push(totalPages - 1);
    } else if (currentPage > 1 && currentPage < totalPages) {
      pages.push(currentPage);
    }
    if (currentPage < totalPages - 1 && totalPages > 3) pages.push("...");
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    return pages.map((page, index) => (
      <button
        key={index}
        onClick={() => typeof page === "number" && setCurrentPage(page)}
        disabled={page === "..."}
        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold shadow-sm transition-colors ${
          page === currentPage
            ? "bg-[#00897B] text-white"
            : page === "..."
            ? "bg-transparent text-gray-400 cursor-default shadow-none"
            : "bg-[#E5E7EB] text-gray-500 hover:bg-gray-300"
        }`}
      >
        {page}
      </button>
    ));
  };

  return (
    <DashboardLayout title="Manajemen Data">
      <div className="w-full relative">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-[26px] font-bold text-gray-900">
              Manajemen Data
            </h1>
            <p className="text-[#9CA3AF] text-sm mt-1">
              Kelola validasi dan kirim data mahasiswa ke Tata Usaha Fakultas
            </p>
          </div>

          <div className="flex gap-3">
            <button className="h-10 px-5 rounded-lg bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiDownload size={16} />
              Template Excel
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="h-10 px-5 rounded-lg bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FiUpload size={16} />
              Import Data
            </button>
          </div>
        </div>

        {/* FILTER SECTION */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-5 flex flex-wrap items-center gap-4 border border-gray-100">
          <div className="flex items-center bg-[#E5E5E5] rounded-lg px-4 h-11 flex-1 max-w-md">
            <FiSearch className="text-gray-500 text-lg mr-3" />
            <input
              type="text"
              placeholder="Cari: Nama, NIM, Prodi"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full font-medium text-gray-700 placeholder-gray-500"
            />
          </div>

          <div className="relative flex-1">
            <select
              value={selectedFakultas}
              onChange={(e) => setSelectedFakultas(e.target.value)}
              className="appearance-none bg-[#E5E5E5] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg pr-10 w-full outline-none cursor-pointer"
            >
              {fakultasList.map((f, i) => (
                <option key={i} value={f.nama}>
                  {f.nama}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none" />
          </div>

          <div className="relative w-[180px]">
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="appearance-none bg-[#E5E5E5] text-sm font-bold text-gray-700 px-4 h-11 rounded-lg pr-10 w-full outline-none cursor-pointer"
            >
              {tahunList.map((t, i) => (
                <option key={i} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg pointer-events-none" />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F3F4F6] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6">Nama</th>
                  <th className="py-4 px-6 text-center">NIM</th>
                  <th className="py-4 px-6 text-center">Fakultas</th>
                  <th className="py-4 px-6 text-center">Program Studi</th>
                  <th className="py-4 px-6 text-center">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center w-24">Detail</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-center font-bold text-gray-800">
                      {(currentPage - 1) * itemsPerPage + index + 1}.
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {item.nama}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      {item.nim}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      {item.fakultas}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      {item.prodi}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      {item.tahunLulus}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div
                        onClick={() => handleDetailClick(item)}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition"
                      >
                        <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedData.length === 0 && (
            <div className="py-8 text-center text-gray-500">Data tidak ditemukan.</div>
          )}

          {/* BOTTOM SECTION - PAGINATION */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {paginatedData.length} dari {filteredData.length} Data
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50"
                >
                  {"<"}
                </button>
                {renderPaginationButtons()}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black font-bold disabled:opacity-50"
                >
                  {">"}
                </button>
              </div>
            )}
          </div>
        </div>

        {showImportModal && (
          <ImportDataModal onClose={() => setShowImportModal(false)} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManajemenData;