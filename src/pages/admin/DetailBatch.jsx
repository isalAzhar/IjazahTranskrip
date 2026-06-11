import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { useAuth } from "../../pages/context/AuthContext";
import { getDetailBatch } from "../../services/dashboard.api";

const getBatchFromState = (state) => {
  if (!state) return null;

  if (state.batch && typeof state.batch === "object") {
    return state.batch;
  }

  if (typeof state === "object") {
    return state;
  }

  return null;
};

const normalizeStatus = (status) => {
  const value = status?.toString().toLowerCase();

  if (value === "approved" || value === "terbit" || value === "valid") {
    return "terbit";
  }

  if (value === "pending" || value === "proses") {
    return "proses";
  }

  if (value === "rejected" || value === "reject" || value === "ditolak") {
    return "reject";
  }

  if (value === "revoked" || value === "revoke" || value === "dicabut") {
    return "revoke";
  }

  return value || "proses";
};

const getBadgeColor = (status) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "terbit":
      return "bg-[#27AE60] text-white";
    case "proses":
      return "bg-[#3B82F6] text-white";
    case "reject":
      return "bg-[#EF4444] text-white";
    case "revoke":
      return "bg-[#F59E0B] text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

const getBadgeLabel = (status) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "terbit":
      return "Terbit";
    case "proses":
      return "Proses";
    case "reject":
      return "Reject";
    case "revoke":
      return "Revoke";
    default:
      return status || "Proses";
  }
};

const DetailBatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || "";

  const batchFromState = useMemo(() => {
    return getBatchFromState(location.state);
  }, [location.state]);

  const [batchData, setBatchData] = useState(batchFromState || null);
  const [mahasiswa, setMahasiswa] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const fetchDetailBatch = async () => {
      try {
        setIsInitialLoading(true);
        setApiError("");

        const result = await getDetailBatch(id);

        const rows = Array.isArray(result?.mahasiswa)
          ? result.mahasiswa
          : [];

        const newBatchData = {
          id: result?.id_batch_upload || batchFromState?.id || id,

          id_batch_upload:
            result?.id_batch_upload || batchFromState?.id_batch_upload || id,

          batch:
            result?.nomor_batch_upload ||
            batchFromState?.batch ||
            batchFromState?.nomor_batch_upload ||
            `Batch ${id}`,

          nomor_batch_upload:
            result?.nomor_batch_upload ||
            batchFromState?.nomor_batch_upload ||
            batchFromState?.batch ||
            `Batch ${id}`,

          fakultas: result?.fakultas || batchFromState?.fakultas || "-",

          tahun:
            result?.tahun_lulus?.toString() ||
            batchFromState?.tahun?.toString() ||
            batchFromState?.tahun_lulus?.toString() ||
            "-",

          tahun_lulus:
            result?.tahun_lulus ||
            batchFromState?.tahun_lulus ||
            batchFromState?.tahun ||
            "-",

          periode: result?.periode || batchFromState?.periode || "-",

          total: rows.length,
        };

        setBatchData(newBatchData);

        const formattedMahasiswa = rows.map((item, index) => ({
          ...item,

          id: item.id || item.id_mahasiswa || index + 1,
          id_mahasiswa: item.id_mahasiswa,

          nama: item.nama || item.nama_mahasiswa || "-",
          nama_mahasiswa: item.nama_mahasiswa || item.nama || "-",

          nim: item.nim || item.npm || "-",

          prodi: item.prodi || item.program_studi || item.nama_prodi || "-",
          program_studi:
            item.program_studi || item.prodi || item.nama_prodi || "-",

          fakultas: item.fakultas || newBatchData.fakultas || "-",

          tahun: item.tahun || item.tahun_lulus || newBatchData.tahun || "-",
          tahun_lulus:
            item.tahun_lulus || item.tahun || newBatchData.tahun || "-",

          status: item.status || item.status_validasi || "proses",

          batch: newBatchData.batch,
        }));

        setMahasiswa(formattedMahasiswa);
      } catch (error) {
        console.error("Gagal mengambil detail batch:", error);
        setApiError(error.message || "Gagal mengambil detail batch dari server.");
        setMahasiswa([]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchDetailBatch();
  }, [id, batchFromState]);

  const sortedMahasiswa = useMemo(() => {
    return [...mahasiswa].sort((a, b) => {
      return (a.nama || "").localeCompare(b.nama || "");
    });
  }, [mahasiswa]);

  const handleDetailMahasiswa = (item) => {
    const mahasiswaCode =
  item.mahasiswa_code ||
  item.mahasiswaCode ||
  item.raw?.mahasiswa_code;

if (!mahasiswaCode) {
  console.error("Mahasiswa code tidak ditemukan:", item);
  alert("Kode mahasiswa tidak ditemukan.");
  return;
}

const safeMahasiswaCode = encodeURIComponent(mahasiswaCode);

    const formattedMahasiswa = {
      ...item,
      nama_mahasiswa: item.nama_mahasiswa || item.nama,
      program_studi: item.program_studi || item.prodi,
      tahun_lulus: item.tahun_lulus || item.tahun,
      batch: batchData?.batch,
      fakultas: item.fakultas || batchData?.fakultas,
    };

    const navState = {
      state: {
        mahasiswa: formattedMahasiswa,
        batch: batchData,
      },
    };

    if (userRole === "admin") {
      navigate(`/admin/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    } else if (userRole.includes("operator")) {
      navigate(`/operator/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    } else if (userRole.includes("rektor")) {
      navigate(`/rektor/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    } else {
      navigate(`/verifikator/detail-mahasiswa/${safeMahasiswaCode}`, navState);
    }
  };

  if (isInitialLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#117065]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full pb-10">
        <div className="mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
              Detail Batch - {batchData?.batch || "-"}
            </h1>

            <p className="text-[#9CA3AF] text-[14px] font-medium">
              Daftar Batch
            </p>

            {apiError && (
              <p className="text-sm text-red-500 mt-2 font-semibold">
                {apiError}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F7F7] text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-center">No</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-center">NIM</th>
                <th className="px-4 py-3 text-center">Program Studi</th>
                <th className="px-4 py-3 text-center">Tahun Lulus</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Detail</th>
              </tr>
            </thead>

            <tbody>
              {sortedMahasiswa.length > 0 ? (
                sortedMahasiswa.map((item, i) => (
                  <tr
                    key={item.id_mahasiswa || item.id || i}
                    className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-center">{i + 1}</td>

                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {item.nama || "-"}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800 text-center">
                      {item.nim || "-"}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800 text-center">
                      {item.prodi || "-"}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800 text-center">
                      {item.tahun || "-"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block min-w-[86px] px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(
                          item.status
                        )}`}
                      >
                        {getBadgeLabel(item.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDetailMahasiswa(item)}
                        className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-100 transition"
                        title="Lihat Detail Mahasiswa"
                      >
                        <div className="w-3 h-3 border-t-2 border-b-2 border-gray-400"></div>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Data mahasiswa tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DetailBatch;