import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/ui/DashboardLayout";
import StatCard from "../components/ui/StatCard";
import VerificationStatusChart from "../components/ui/VerificationStatusChart";
import { getStatistics, getVerificationStatus, getIjazahList, verifyIjazah, searchIjazah } from "../../services/api";

const Verifikasi = () => {
  const [stats, setStats] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [ijazahList, setIjazahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, verificationDataResult, ijazahData] = await Promise.all([
        getStatistics(),
        getVerificationStatus(),
        getIjazahList({ status: "Proses" })
      ]);
      
      setStats(statsData);
      setVerificationData(verificationDataResult);
      setIjazahList(ijazahData.data || []);
    } catch (error) {
      console.error("Error fetching verification data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const result = await searchIjazah(searchQuery);
      setSearchResult(result);
    } catch (error) {
      setSearchResult({ error: "Data tidak ditemukan" });
    } finally {
      setLoading(false);
    }
  };

  // Handle verify ijazah
  const handleVerify = async (nim, status) => {
    setVerifying(nim);
    try {
      await verifyIjazah(nim);
      setNotification({
        type: "success",
        message: `Ijazah ${nim} berhasil diverifikasi sebagai ${status}`
      });
      // Refresh data
      fetchData();
    } catch (error) {
      setNotification({
        type: "error",
        message: `Gagal memverifikasi ijazah ${nim}`
      });
    } finally {
      setVerifying(null);
      // Auto hide notification
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResult(null);
  };

  // Get current date
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardLayout>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-lg shadow-lg transition-all transform animate-slide-in ${
          notification.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {notification.type === "success" ? "✓" : "✕"}
            </span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tight">
          Verifikasi Ijazah
        </h1>
        <p className="text-gray-400 text-xs italic mt-1 font-medium">
          Update terakhir: {currentDate} WIB
        </p>
      </header>

      {/* Search Section */}
      <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-8 mb-8">
        <h2 className="text-lg font-bold text-[#2D2D2D] mb-4">
          🔍 Cek Status Verifikasi Ijazah
        </h2>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Masukkan NPM atau Nama Mahasiswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] rounded-[12px] text-sm text-gray-700 outline-none border-2 border-transparent focus:border-teal-500 transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-teal-600 text-white font-bold rounded-[12px] hover:bg-teal-700 transition-all disabled:opacity-50"
          >
            {loading ? "Mencari..." : "Cari"}
          </button>
          {searchResult && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-[12px] hover:bg-gray-200 transition-all"
            >
              Clear
            </button>
          )}
        </form>

        {/* Search Result */}
        {searchResult && (
          <div className="mt-6 p-6 bg-[#F8F9FA] rounded-[12px]">
            {searchResult.error ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">😕</span>
                <p className="text-gray-500 font-medium">{searchResult.error}</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#2D2D2D]">{searchResult.nama}</h3>
                  <p className="text-gray-500 text-sm">NIM: {searchResult.npm}</p>
                  <p className="text-gray-500 text-sm">{searchResult.prodi} - {searchResult.tahunLulus}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-6 py-2 rounded-full text-sm font-bold text-white ${
                    searchResult.status === "Valid" ? "bg-green-500" :
                    searchResult.status === "Proses" ? "bg-yellow-500" : "bg-red-500"
                  }`}>
                    {searchResult.status}
                  </span>
                  {searchResult.tanggalVerifikasi && (
                    <p className="text-xs text-gray-400 mt-2">
                      Diverifikasi: {searchResult.tanggalVerifikasi}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Verifikasi"
          value={(stats?.permintaanVerifikasi || 0) + (stats?.dataReject || 0)}
          sub="Semua status"
          subColor="text-blue-500"
          icon="📋"
        />
        <StatCard
          title="Ijazah Valid"
          value={verificationData?.data?.[0] || 0}
          sub="Terverifikasi"
          subColor="text-green-500"
          icon="✅"
        />
        <StatCard
          title="Sedang Proses"
          value={verificationData?.data?.[1] || 0}
          sub="Menunggu verifikasi"
          subColor="text-yellow-500"
          icon="⏳"
        />
        <StatCard
          title="Data Reject"
          value={verificationData?.data?.[2] || 0}
          sub="Ditolak"
          subColor="text-red-500"
          icon="❌"
        />
      </div>

      {/* Charts and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <VerificationStatusChart data={verificationData} loading={loading} />
        </div>
        
        {/* Recent Verification Table */}
        <div className="lg:col-span-2 bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-[#2D2D2D] mb-4">
            Permintaan Verifikasi Terbaru
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-xs font-bold text-gray-400 uppercase">Nama</th>
                  <th className="text-center py-3 text-xs font-bold text-gray-400 uppercase">NPM</th>
                  <th className="text-center py-3 text-xs font-bold text-gray-400 uppercase">Status</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {ijazahList.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-4 font-medium text-[#2D2D2D]">{row.nama || row.n}</td>
                    <td className="py-4 text-center font-mono text-sm text-gray-600">{row.nim}</td>
                    <td className="py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white ${
                        (row.status || row.s) === "Valid" ? "bg-green-500" :
                        (row.status || row.s) === "Proses" ? "bg-yellow-500" : "bg-red-500"
                      }`}>
                        {row.status || row.s}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleVerify(row.nim, "Valid")}
                        disabled={verifying === row.nim}
                        className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {verifying === row.nim ? "..." : "Verifikasi"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Verifikasi;

