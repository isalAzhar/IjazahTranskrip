import React, { useState, useMemo, useRef, useEffect } from "react";
import { FiSearch, FiExternalLink } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/ui/DashboardLayout";
import { getValidDocumentBatchDetail } from "../../services/document.api";

// ✅ Mapping periode
const formatPeriode = (periode) => {
  const map = {
    semester_ganjil: "Semester Ganjil",
    semester_genap: "Semester Genap",
    semester_pendek: "Semester Pendek",
  };
  return map[periode?.toLowerCase()] || periode || "-";
};

// ✅ Format nama batch
const formatNamaBatch = (kode) => {
  if (!kode) return "-";
  const parts = kode.split("-");
  if (parts.length < 2) return kode;
  const raw = parts[1];
  if (raw.length !== 8) return kode;
  const year = raw.substring(0, 4);
  const month = raw.substring(4, 6);
  const day = raw.substring(6, 8);
  const bulan = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return `Batch ${parseInt(day)} ${bulan[parseInt(month)]} ${year}`;
};

const DetailDokumenValidRektor = () => {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const { state } = useLocation();

  const batchFromState = state || {};

  const [batch, setBatch] = useState(batchFromState);
  const [mahasiswa, setMahasiswa] = useState([]);

  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeBatchId =
    batchId ||
    batchFromState.id_batch_upload ||
    batchFromState.id ||
    batchFromState.batchId;

  const fetchDetailDokumen = async () => {
    if (!activeBatchId) {
      setErrorMessage("ID batch tidak ditemukan.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getValidDocumentBatchDetail(activeBatchId, { search });
      setBatch(result.data?.batch || batchFromState || {});
      setMahasiswa(result.data?.mahasiswa || []);
    } catch (error) {
      console.error("Gagal mengambil detail dokumen valid:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengambil detail dokumen valid."
      );
      setMahasiswa([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailDokumen();
  }, [activeBatchId, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchSuggestions = useMemo(() => {
    if (!search.trim()) return mahasiswa;
    const keyword = search.toLowerCase();
    return mahasiswa.filter((item) => {
      return (
        item.nama?.toLowerCase().includes(keyword) ||
        item.nama_mahasiswa?.toLowerCase().includes(keyword) ||
        item.nim?.includes(search) ||
        item.prodi?.toLowerCase().includes(keyword) ||
        item.program_studi?.toLowerCase().includes(keyword)
      );
    });
  }, [search, mahasiswa]);

  const filteredTable = searchSuggestions;

  const openPdf = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleGoDetailMahasiswa = (student) => {
    navigate(`/rektor/detail-mahasiswa/${student.nim}`, { state: student });
  };

  const DetailIcon = () => (
    <div className="w-3 h-3 border-t-2 border-b-2 border-gray-500" />
  );

  return (
    <DashboardLayout title="Dokumen Valid">
      <div className="w-full pb-10">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Daftar Dokumen Valid
          </h1>
          <p className="text-[#9CA3AF] text-[14px] font-medium mt-1">
            Arsip digital ijazah dan transkrip mahasiswa yang telah melewati proses verifikasi institusi.
          </p>
        </div>

        {/* ✅ INFO BATCH — samakan dengan DetailBatchVerifikator */}
        {(batch?.batch || batch?.nomor_batch_upload) && (
          <div className="mb-6 px-6 py-4 bg-white border border-gray-200 rounded-xl flex flex-wrap items-center gap-x-12 gap-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#117065]"></div>

            <div className="flex flex-col">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">No Batch</span>
              <span className="text-[14px] font-bold text-gray-800">
                {formatNamaBatch(batch.batch || batch.nomor_batch_upload)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Fakultas</span>
              <span className="text-[14px] font-bold text-gray-800">{batch.fakultas || "-"}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Tahun Lulus</span>
              <span className="text-[14px] font-bold text-gray-800">{batch.tahun || "-"}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Periode</span>
              <span className="text-[14px] font-bold text-gray-800">{formatPeriode(batch.periode)}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Data</span>
              {/* ✅ Samakan styling dengan DetailBatchVerifikator */}
              <span className="text-[14px] font-bold text-[#117065] bg-teal-50 px-2 py-0.5 rounded-md inline-block text-center w-fit">
                {batch.total || mahasiswa.length || 0} Mahasiswa
              </span>
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        <div ref={searchRef} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-0">
          <div className="w-full lg:max-w-md">
            <div className="flex items-center bg-white border border-gray-200 focus-within:border-[#117065] focus-within:ring-1 focus-within:ring-[#117065] rounded-lg px-4 h-11 transition-all shadow-sm">
              <FiSearch className="text-gray-400 text-lg mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari: Nama, NIM..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* SUGGESTIONS */}
        {showSuggestions && search.trim() && (
          <div className="bg-white border-x border-b border-gray-100 shadow-md rounded-b-xl mb-6 overflow-y-auto" style={{ maxHeight: "260px" }}>
            {searchSuggestions.length > 0 ? (
              searchSuggestions.map((student) => (
                <div
                  key={student.id_mahasiswa || student.nim}
                  onClick={() => { setShowSuggestions(false); handleGoDetailMahasiswa(student); }}
                  className="px-6 py-4 border-b border-gray-50 hover:bg-teal-50 cursor-pointer flex justify-between items-center transition-colors last:border-b-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="font-bold text-[#1F2937] text-[14px] mb-0.5">
                      {student.nama || student.nama_mahasiswa || "-"}
                    </div>
                    <div className="text-[12px] font-normal text-gray-500">
                      {student.nim || "-"} • {student.prodi || student.program_studi || "-"}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#16A34A] ml-4 whitespace-nowrap">
                    {student.status || "Terbit"}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-gray-400">Mahasiswa tidak ditemukan</div>
            )}
          </div>
        )}

        {!(showSuggestions && search.trim()) && <div className="mb-6" />}

        {errorMessage && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F9FAFB] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No.</th>
                  <th className="py-4 px-6 w-[180px]">Nama</th>
                  <th className="py-4 px-6 text-center w-[160px]">NIM</th>
                  <th className="py-4 px-6 text-center">Program Studi</th>
                  <th className="py-4 px-6 text-center w-[120px]">Tahun Lulus</th>
                  <th className="py-4 px-6 text-center w-[120px]">Status</th>
                  <th className="py-4 px-6 text-center w-[180px]">Dokumen</th>
                  <th className="py-4 px-6 text-center w-20">Detail</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
                      Memuat data dokumen valid...
                    </td>
                  </tr>
                ) : filteredTable.length > 0 ? (
                  filteredTable.map((item, i) => (
                    <tr key={item.id_mahasiswa || item.nim} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-center font-semibold text-gray-800">{i + 1}.</td>
                      <td className="py-4 px-6 font-semibold text-gray-900">{item.nama || item.nama_mahasiswa || "-"}</td>
                      <td className="py-4 px-6 text-center font-normal text-gray-700">{item.nim || "-"}</td>
                      <td className="py-4 px-6 text-center font-normal text-gray-700">{item.prodi || item.program_studi || "-"}</td>
                      <td className="py-4 px-6 text-center font-normal text-gray-700">{item.tahun || item.tahun_lulus || "-"}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-5 py-1.5 rounded-full text-xs font-bold text-white bg-[#16A36B]">
                          {item.status || "Terbit"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.ijazah?.file_pdf_url && (
                            <button type="button" onClick={() => openPdf(item.ijazah.file_pdf_url)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#117065] text-white text-xs font-bold hover:bg-teal-800 transition">
                              <FiExternalLink /> Ijazah
                            </button>
                          )}
                          {item.transkrip?.file_pdf_url && (
                            <button type="button" onClick={() => openPdf(item.transkrip.file_pdf_url)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                              <FiExternalLink /> Transkrip
                            </button>
                          )}
                          {!item.ijazah?.file_pdf_url && !item.transkrip?.file_pdf_url && (
                            <span className="text-xs text-gray-400 font-semibold">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button onClick={() => handleGoDetailMahasiswa(item)}
                          className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-200 transition flex-shrink-0">
                          <DetailIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
                      <div className="flex flex-col items-center justify-center">
                        <FiSearch className="text-4xl mb-3 text-gray-300" />
                        <p>Mahasiswa tidak ditemukan.</p>
                      </div>
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

export default DetailDokumenValidRektor;