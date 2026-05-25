// src/pages/operator/ManajemenData.jsx

import React, { useState, useMemo, useEffect } from "react";
import { FiSearch, FiUpload, FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import ImportDataModal from "./ImportDataModal";
import {
  getInboundMahasiswaByBatches,
  downloadInboundTemplate,
} from "../../../services/api";

const UPLOADED_DATA_KEY = "inbound_uploaded_data";
const UPLOADED_BATCH_IDS_KEY = "inbound_uploaded_batch_ids";
const UPLOADED_PAGINATION_KEY = "inbound_uploaded_pagination";

const ManajemenData = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [uploadedData, setUploadedData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(UPLOADED_DATA_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [uploadedBatchIds, setUploadedBatchIds] = useState(() => {
    try {
      const saved = sessionStorage.getItem(UPLOADED_BATCH_IDS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pagination, setPagination] = useState(() => {
    try {
      const saved = sessionStorage.getItem(UPLOADED_PAGINATION_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            page: 1,
            limit: 10,
            total: 0,
            total_pages: 0,
          };
    } catch {
      return {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
      };
    }
  });

  const itemsPerPage = 10;

  const handleDownloadTemplate = async () => {
    try {
      await downloadInboundTemplate();
    } catch (error) {
      console.error("Gagal download template:", error);
      alert(error.message || "Gagal mengunduh template Excel.");
    }
  };

  const dataMahasiswa = useMemo(() => {
    return [...uploadedData].sort((a, b) =>
      String(a.nama || "").localeCompare(String(b.nama || ""))
    );
  }, [uploadedData]);

  const filteredData = useMemo(() => {
    return [...dataMahasiswa];
  }, [dataMahasiswa]);

  const totalPages = pagination.total_pages || 0;
  const paginatedData = filteredData;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchUploadedPage = async (pageNumber = 1) => {
    if (!uploadedBatchIds || uploadedBatchIds.length === 0) return;

    try {
      setLoading(true);

      const result = await getInboundMahasiswaByBatches({
        batch_ids: uploadedBatchIds,
        page: pageNumber,
        limit: itemsPerPage,
        search: debouncedSearch,
      });

      const payload = result.data || {};

      const nextData = payload.data || [];
      const nextPagination = payload.pagination || {
        page: pageNumber,
        limit: itemsPerPage,
        total: 0,
        total_pages: 0,
      };

      setUploadedData(nextData);
      setPagination(nextPagination);
      setCurrentPage(pageNumber);

      sessionStorage.setItem(UPLOADED_DATA_KEY, JSON.stringify(nextData));
      sessionStorage.setItem(
        UPLOADED_PAGINATION_KEY,
        JSON.stringify(nextPagination)
      );
    } catch (error) {
      console.error("Gagal mengambil data mahasiswa upload:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uploadedBatchIds.length > 0) {
      fetchUploadedPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleDetailClick = (item) => {
    navigate(`/operator/detail-pelaporan/${item.nim}`, { state: item });
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      fetchUploadedPage(pageNumber);
    }
  };

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

  if (totalPages > 1 && !pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return pages.map((page, index) => (
    <button
      key={index}
      onClick={() => typeof page === "number" && handlePageChange(page)}
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
            <button
              onClick={handleDownloadTemplate}
              className="h-10 px-5 rounded-lg bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition"
            >
              <FiDownload size={16} /> Template Excel
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="h-10 px-5 rounded-lg bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition"
            >
              <FiUpload size={16} /> Import Data
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap items-center gap-4 border border-gray-100">
          <div className="flex items-center bg-[#E5E5E5] rounded-lg px-4 h-11 flex-1 min-w-[250px] max-w-md">
            <FiSearch className="text-gray-500 text-lg mr-3" />
            <input
              type="text"
              placeholder="Cari: Nama, NIM, Prodi"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent outline-none text-sm w-full font-medium text-gray-700 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F3F4F6] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 min-w-[200px]">Nama</th>
                  <th className="py-4 px-6 text-center min-w-[160px]">NIM</th>
                  <th className="py-4 px-6 text-center min-w-[220px]">
                    Fakultas
                  </th>
                  <th className="py-4 px-6 text-center min-w-[180px]">
                    Program Studi
                  </th>
                  <th className="py-4 px-6 text-center w-28">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center w-24">Detail</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      Memuat data mahasiswa...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      Belum ada data upload yang ditampilkan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr
                      key={item.id || item.id_mahasiswa || item.nim}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 text-center font-medium text-gray-800">
                        {(currentPage - 1) * itemsPerPage + index + 1}.
                      </td>

                      <td className="py-4 px-6 font-medium text-gray-900">
                        {item.nama || item.nama_mahasiswa || "-"}
                      </td>

                      <td className="py-4 px-6 text-center font-medium text-gray-900">
                        {item.nim || "-"}
                      </td>

                      <td className="py-4 px-6 text-center text-gray-600 whitespace-normal break-words max-w-[220px]">
                        {item.fakultas || "-"}
                      </td>

                      <td className="py-4 px-6 text-center text-gray-600 whitespace-normal break-words max-w-[180px]">
                        {item.prodi || "-"}
                      </td>

                      <td className="py-4 px-6 text-center font-medium text-gray-900">
                        {item.tahunLulus || item.tahun_lulus || "-"}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div
                          onClick={() => handleDetailClick(item)}
                          className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition"
                        >
                          <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <div className="flex justify-end items-center px-6 py-6 gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center px-2 text-[28px] font-bold transition-colors ${
                  currentPage === 1
                    ? "text-[#CBD5E1] cursor-not-allowed"
                    : "text-[#94a3b8] hover:text-[#64748b]"
                }`}
              >
                &lt;
              </button>

              {renderPaginationButtons()}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center px-2 text-[28px] font-bold transition-colors ${
                  currentPage === totalPages
                    ? "text-[#CBD5E1] cursor-not-allowed"
                    : "text-[#115E59] hover:text-[#0B4B48]"
                }`}
              >
                &gt;
              </button>
            </div>
          )}
        </div>

        {showImportModal && (
          <ImportDataModal
            onClose={() => setShowImportModal(false)}
            onSuccess={({ mahasiswa, pagination, batchIds }) => {
              const newUploadedData = mahasiswa || [];
              const newBatchIds = batchIds || [];
              const newPagination = pagination || {
                page: 1,
                limit: itemsPerPage,
                total: newUploadedData.length || 0,
                total_pages: newUploadedData.length > 0 ? 1 : 0,
              };

              setUploadedData(newUploadedData);
              setUploadedBatchIds(newBatchIds);
              setPagination(newPagination);
              setCurrentPage(1);

              sessionStorage.setItem(
                UPLOADED_DATA_KEY,
                JSON.stringify(newUploadedData)
              );

              sessionStorage.setItem(
                UPLOADED_BATCH_IDS_KEY,
                JSON.stringify(newBatchIds)
              );

              sessionStorage.setItem(
                UPLOADED_PAGINATION_KEY,
                JSON.stringify(newPagination)
              );
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManajemenData;