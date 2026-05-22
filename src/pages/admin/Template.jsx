import React, { useState } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import ijazahBg from "../../assets/img/Templateijazah.jpeg";
import transkipBg from "../../assets/img/Templatetranskip.jpeg";

// =====================================================
// CONFIG
// =====================================================

const ROW_H = 16;

const kualData = [
  ["A", "4.0", "Sangat Baik Sekali"],
  ["AB", "3.5", "Sangat Baik"],
  ["B", "3.0", "Baik"],
  ["BC", "2.5", "Lebih dari Cukup"],
  ["C", "2.0", "Cukup"],
  ["CD", "1.5", "Kurang dari Cukup"],
  ["D", "1.0", "Kurang"],
];

// =====================================================
// IJAZAH — FIELD LIST
// =====================================================

const ijazahFields = [
  "Nama",
  "Tempat & Tanggal Lahir",
  "Nomor Pokok Mahasiswa",
  "NIK",
  "Fakultas",
  "Fakultas (English)",
  "Program Studi",
  "Program Studi (English)",
  "Program",
  "Program (English)",
  "Tanggal Kelulusan",
  "PISN",
  "Nomor Seri Ijazah",
  "Akreditasi AIPT",
  "Foto",
  "QR Code",
  "Gelar",
  "Tanggal Terbit",
  "Nama Rektor",
  "TTD Rektor",
  "NIDN Rektor",
  "Nama Dekan",
  "TTD Dekan",
  "NIDN Dekan",
  "Paraf KATU Rektor",
  "Paraf WAREK",
  "Paraf KATU Fakultas",
  "Paraf Wadek",
  "Stempel Rektor",
  "Stempel Dekan",
];

// =====================================================
// TRANSKRIP — FIELD LIST
// =====================================================

const transkipFields = [
  "Nomor",
  "Nama",
  "Tempat & Tanggal Lahir",
  "Jenis Kelamin",
  "Nomor Pokok Mahasiswa",
  "NINA",
  "NIK",
  "Tahun Masuk",
  "Program Pendidikan",
  "Fakultas",
  "Program Studi",
  "Nomor SK Akreditasi",
  "Status",
  "Tanggal Lulus",
  "TTD Dekan",
  "Nama Dekan",
  "NIDN Dekan",
  "Paraf KATU Fakultas",
  "Paraf Kaprodi",
];

// =====================================================
// FIELD RENDER CATEGORIES
// =====================================================

const boxOnlyFields = [
  "Foto",
  "QR Code",
  "Gelar",
  "Tanggal Terbit",
  "Paraf KATU Rektor",
  "Paraf WAREK",
  "Paraf KATU Fakultas",
  "Paraf Wadek",
  "Paraf Kaprodi",
  "Stempel Rektor",
  "Stempel Dekan",
];

const verticalFields = [
  "Tanggal Kelulusan",
  "PISN",
  "Nomor Seri Ijazah",
  "Akreditasi AIPT",
];

const signatureFields = ["TTD Rektor", "TTD Dekan"];

const nameLineFields = ["Nama Rektor", "Nama Dekan"];

const nidnFields = ["NIDN Rektor", "NIDN Dekan"];

// =====================================================
// IJAZAH — FIELD SUBTITLES
// Bahasa Inggris hanya tampil untuk Ijazah
// =====================================================

const fieldSubtitle = {
  Nama: "Name",
  "Tempat & Tanggal Lahir": "Place And Date Of Birth",
  "Nomor Pokok Mahasiswa": "Student ID",
  NIK: "National ID",
  Fakultas: "Faculty",
  "Fakultas (English)": "Faculty",
  "Program Studi": "Study Program",
  "Program Studi (English)": "Study Program",
  Program: "Degree",
  "Program (English)": "Degree",
  "Tanggal Kelulusan": "Date of Graduation",
  PISN: "",
  "Nomor Seri Ijazah": "Certificate Number",
  "Akreditasi AIPT": "",
  "TTD Rektor": "Rector",
  "TTD Dekan": "Dean",
};

// =====================================================
// SHARED — HELPERS
// =====================================================

const makePlaceholder = (label) =>
  `{{${label
    .toLowerCase()
    .replaceAll(" & ", "_")
    .replaceAll(" ", "_")
    .replaceAll("(", "")
    .replaceAll(")", "")}}}`;

const getFieldSize = (field) => {
  if (field === "Foto") return { width: 95, height: 125 };
  if (field === "QR Code") return { width: 72, height: 72 };
  if (field.includes("TTD")) return { width: 100, height: 45 };
  if (field.includes("Stempel")) return { width: 85, height: 85 };
  if (field.includes("Paraf")) return { width: 28, height: 28 };
  if (field === "Gelar") return { width: 455, height: 22 };
  if (field === "Tanggal Terbit") return { width: 155, height: 22 };

  if (field === "Nama Rektor" || field === "Nama Dekan") {
    return { width: 176, height: 18 };
  }

  if (field === "NIDN Rektor" || field === "NIDN Dekan") {
    return { width: 130, height: 16 };
  }

  return { width: 150, height: 18 };
};

// =====================================================
// SHARED — RENDER DRAGGABLE ELEMENTS
// documentType = "ijazah" / "transkip"
// =====================================================

const renderElements = (
  elements,
  isSaved,
  isLocked,
  handleMouseDownElement,
  documentType
) =>
  elements.map((el) => {
    const isBoxOnly = boxOnlyFields.includes(el.label);
    const isSignature = signatureFields.includes(el.label);
    const isNameLine = nameLineFields.includes(el.label);
    const isNidn = nidnFields.includes(el.label);
    const isVertical = verticalFields.includes(el.label);

    const subtitle = documentType === "ijazah" ? fieldSubtitle[el.label] : "";

    const labelTextSize =
      documentType === "transkip" ? "text-[11px]" : "text-[11px]";

    const colonTextSize =
      documentType === "transkip" ? "text-[11px]" : "text-[11px]";

    return (
      <div
        key={el.id}
        onMouseDown={(e) => handleMouseDownElement(e, el)}
        className={`absolute z-20 ${
          !isSaved && !isLocked ? "cursor-move" : "cursor-default"
        }`}
        style={{ left: el.x, top: el.y }}
        title={el.placeholder}
      >
        {isBoxOnly && (
          <div
            className="border border-gray-500 bg-white/70 rounded-sm"
            style={{ width: el.width, height: el.height }}
          />
        )}

        {isSignature && (
          <div className="flex flex-col items-center">
            <span
              className={`${labelTextSize} font-bold text-gray-800 leading-none text-center`}
            >
              {el.label === "TTD Rektor" ? "Rektor" : "Dekan"}
            </span>

            {subtitle && (
              <span className="text-[9px] italic text-gray-600 leading-none mt-[2px] text-center">
                {subtitle}
              </span>
            )}

            <div
              className="border border-gray-500 bg-white/70 mt-[6px] rounded-sm"
              style={{ width: el.width, height: el.height }}
            />
          </div>
        )}

        {isNameLine && (
          <div className="flex flex-col items-center">
            <div
              className="border border-gray-500 bg-white/70 rounded-sm"
              style={{ width: el.width, height: el.height }}
            />
            <div
              className="border-t border-black mt-[2px]"
              style={{ width: el.width + 8 }}
            />
          </div>
        )}

        {isNidn && (
          <div className="flex items-center gap-0">
            <span
              className={`${
                documentType === "transkip" ? "text-[7px]" : "text-[10px]"
              } text-gray-800 leading-none`}
            >
              NIDN.
            </span>

            <div
              className="border border-gray-500 bg-white/70 rounded-sm"
              style={{ width: el.width, height: el.height }}
            />
          </div>
        )}

        {!isBoxOnly && !isSignature && !isNameLine && !isNidn && isVertical && (
          <div className="flex flex-col items-center">
            <span
              className={`${labelTextSize} font-bold text-gray-800 leading-none text-center`}
            >
              {el.label}
            </span>

            {subtitle && (
              <span className="text-[9px] italic text-gray-600 leading-none mt-[2px] text-center">
                {subtitle}
              </span>
            )}

            <div
              className="border border-gray-500 bg-white/70 mt-[6px] rounded-sm"
              style={{ width: el.width, height: el.height }}
            />
          </div>
        )}

        {!isBoxOnly && !isSignature && !isNameLine && !isNidn && !isVertical && (
          <div
            className={`grid ${
              documentType === "transkip"
                ? "grid-cols-[130px_8px_auto]"
                : "grid-cols-[200px_12px_auto]"
            } items-center`}
          >
            <div className="flex flex-col">
              <span
                className={`${labelTextSize} font-bold text-gray-800 leading-none whitespace-nowrap`}
              >
                {el.label}
              </span>

              {subtitle && (
                <span className="text-[9px] italic text-gray-600 leading-none mt-[2px] whitespace-nowrap">
                  {subtitle}
                </span>
              )}
            </div>

            <span
              className={`${colonTextSize} font-bold text-gray-700 text-center`}
            >
              :
            </span>

            <div
              className="border border-gray-500 bg-white/70 rounded-sm"
              style={{ width: el.width, height: el.height }}
            />
          </div>
        )}
      </div>
    );
  });

// =====================================================
// TRANSKRIP — DYNAMIC TABLE OVERLAY
// Tabel tidak menampilkan row statis.
// Row hanya muncul jika mataKuliahData terisi dari API.
// =====================================================

const TranskipTableOverlay = ({ elements, mataKuliahData = [] }) => {
  const isActive = (label) => elements.some((el) => el.label === label);

  const summaryBox = (label) =>
    isActive(label)
      ? "absolute top-[2px] bottom-[2px] left-[2px] right-[2px] border border-[#8B8B8B] bg-[#00000008] rounded-[2px]"
      : "";

  const splitIndex = Math.ceil(mataKuliahData.length / 2);
  const leftRows = mataKuliahData.slice(0, splitIndex);
  const rightRows = mataKuliahData.slice(splitIndex);

  const renderNilaiRows = (rows, startNumber = 1) =>
    rows.map((mk, i) => (
      <tr key={i} style={{ height: `${ROW_H}px` }}>
        <td className="border border-[#707070] text-center">
          {startNumber + i}
        </td>
        <td className="border border-[#707070] text-center">
          {mk.kode || mk.kode_mk || ""}
        </td>
        <td className="border border-[#707070] px-1">
          {mk.mata_kuliah || mk.nama_mk || mk.nama_mata_kuliah || ""}
        </td>
        <td className="border border-[#707070] text-center">{mk.hm || ""}</td>
        <td className="border border-[#707070] text-center">{mk.am || ""}</td>
        <td className="border border-[#707070] text-center">{mk.k || ""}</td>
        <td className="border border-[#707070] text-center">{mk.t || ""}</td>
      </tr>
    ));

  return (
    <div
      className="absolute inset-x-0 z-10 pointer-events-none"
      style={{ top: "43%", paddingLeft: "3.5%", paddingRight: "3.5%" }}
    >
      <div className="flex justify-between items-start">
        {/* TABEL NILAI — KIRI */}
        <div style={{ width: "46%" }}>
          <table className="w-full border-collapse text-[8px] bg-[#F2F2F2]">
            <thead>
              <tr>
                <th className="border border-[#707070] h-[20px] w-[24px] font-semibold">
                  NO
                </th>
                <th className="border border-[#707070] w-[52px] font-semibold">
                  KODE
                </th>
                <th className="border border-[#707070] font-semibold">
                  MATA KULIAH
                </th>
                <th
                  colSpan={4}
                  className="border border-[#707070] font-semibold"
                >
                  NILAI
                </th>
              </tr>

              <tr>
                <th className="border border-[#707070] h-[14px]" />
                <th className="border border-[#707070]" />
                <th className="border border-[#707070]" />
                <th className="border border-[#707070] w-[18px]">HM</th>
                <th className="border border-[#707070] w-[18px]">AM</th>
                <th className="border border-[#707070] w-[16px]">K</th>
                <th className="border border-[#707070] w-[16px]">T</th>
              </tr>
            </thead>

            <tbody>{renderNilaiRows(leftRows, 1)}</tbody>
          </table>
        </div>

        {/* TABEL NILAI — KANAN */}
        <div style={{ width: "46%" }}>
          <table className="w-full border-collapse text-[8px] bg-[#F2F2F2]">
            <thead>
              <tr>
                <th className="border border-[#707070] h-[20px] w-[24px] font-semibold">
                  NO
                </th>
                <th className="border border-[#707070] w-[52px] font-semibold">
                  KODE
                </th>
                <th className="border border-[#707070] font-semibold">
                  MATA KULIAH
                </th>
                <th
                  colSpan={4}
                  className="border border-[#707070] font-semibold"
                >
                  NILAI
                </th>
              </tr>

              <tr>
                <th className="border border-[#707070] h-[14px]" />
                <th className="border border-[#707070]" />
                <th className="border border-[#707070]" />
                <th className="border border-[#707070] w-[18px]">HM</th>
                <th className="border border-[#707070] w-[18px]">AM</th>
                <th className="border border-[#707070] w-[16px]">K</th>
                <th className="border border-[#707070] w-[16px]">T</th>
              </tr>
            </thead>

            <tbody>{renderNilaiRows(rightRows, splitIndex + 1)}</tbody>
          </table>

          {/* SUMMARY */}
          <table className="w-full border-collapse text-[7px] bg-[#F2F2F2]">
            <tbody>
              <tr>
                <td className="border border-[#707070] px-2 py-[3px] font-semibold w-[58%]">
                  Jumlah
                </td>
                <td className="border border-[#707070] relative">
                  <div className={summaryBox("Jumlah")} />
                </td>
                <td className="border border-[#707070] w-[40px]" />
              </tr>

              <tr>
                <td className="border border-[#707070] px-2 py-[3px] font-semibold">
                  Indeks Prestasi Kumulatif
                </td>
                <td className="border border-[#707070] relative">
                  <div className={summaryBox("Indeks Prestasi Kumulatif")} />
                </td>
                <td className="border border-[#707070]" />
              </tr>

              <tr>
                <td className="border border-[#707070] px-2 py-[3px] font-semibold">
                  Predikat Kelulusan
                </td>
                <td className="border border-[#707070] relative">
                  <div className={summaryBox("Predikat Kelulusan")} />
                </td>
                <td className="border border-[#707070]" />
              </tr>

              <tr>
                <td className="border border-[#707070] px-2 py-[20px] font-semibold">
                  Judul Skripsi :
                </td>
                <td colSpan={2} className="border border-[#707070] relative">
                  <div className={summaryBox("Judul Skripsi")} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-[10px]">
        <div
          className="text-[7px] leading-[11px] mb-[4px]"
          style={{ width: "44%" }}
        >
          <div className="font-semibold mb-[2px]">Keterangan</div>
          <div>* Mata Kuliah Konversi</div>
          <div>** Mata Kuliah Konsentrasi</div>
          <div>*** Mata Kuliah MBKM</div>
        </div>

        <div className="flex justify-between items-start">
          <div style={{ width: "44%" }}>
            <div className="text-[7px] font-semibold mb-[2px]">
              Kualifikasi Nilai
            </div>

            <table className="w-full border-collapse text-[7px] bg-[#F2F2F2]">
              <thead>
                <tr>
                  <th colSpan={2} className="border border-[#707070] py-[2px]">
                    Nilai
                  </th>
                  <th rowSpan={2} className="border border-[#707070] py-[2px]">
                    Kualifikasi
                  </th>
                </tr>

                <tr>
                  <th className="border border-[#707070] py-[2px]">Huruf</th>
                  <th className="border border-[#707070] py-[2px]">Angka</th>
                </tr>
              </thead>

              <tbody>
                {kualData.map((item, i) => (
                  <tr key={i}>
                    <td className="border border-[#707070] text-center py-[1px]">
                      {item[0]}
                    </td>
                    <td className="border border-[#707070] text-center py-[1px]">
                      {item[1]}
                    </td>
                    <td className="border border-[#707070] px-2 py-[1px]">
                      {item[2]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const Template = () => {
  const [activeTab, setActiveTab] = useState("ijazah");

  const [ijazahElements, setIjazahElements] = useState([]);
  const [ijazahSaved, setIjazahSaved] = useState(false);
  const [ijazahLocked, setIjazahLocked] = useState(false);
  const [ijazahPreview, setIjazahPreview] = useState(false);

  const [transkipElements, setTranskipElements] = useState([]);
  const [transkipSaved, setTranskipSaved] = useState(false);
  const [transkipLocked, setTranskipLocked] = useState(false);
  const [transkipPreview, setTranskipPreview] = useState(false);

  const [draggingElement, setDraggingElement] = useState(null);
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Data ini nanti diisi dari API backend.
  // Jangan pakai dummy data di sini.
  const [mataKuliahData, setMataKuliahData] = useState([]);

  const currentFields = activeTab === "ijazah" ? ijazahFields : transkipFields;
  const currentElements =
    activeTab === "ijazah" ? ijazahElements : transkipElements;

  const isSaved = activeTab === "ijazah" ? ijazahSaved : transkipSaved;
  const isLocked = activeTab === "ijazah" ? ijazahLocked : transkipLocked;
  const hasFields = currentElements.length > 0;

  const isFieldActive = (field) =>
    currentElements.some((el) => el.label === field);

  const handleDragStart = (e, field) => {
    if (isSaved || isLocked || isFieldActive(field)) return;
    e.dataTransfer.setData("field", field);
  };

  const handleDropToTemplate = (e) => {
    e.preventDefault();

    if (isSaved || isLocked) return;

    const field = e.dataTransfer.getData("field");
    if (!field || isFieldActive(field)) return;

    const templateArea = e.currentTarget.getBoundingClientRect();

    let size = getFieldSize(field);

    if (activeTab === "transkip") {
      const specialTranskipFields = [
        "TTD Dekan",
        "Nama Dekan",
        "NIDN Dekan",
        "Paraf KATU Fakultas",
        "Paraf Kaprodi",
      ];

      if (!specialTranskipFields.includes(field)) {
        size = { width: 150, height: 13 };
      }
    }

    const newElement = {
      id: Date.now(),
      label: field,
      placeholder: makePlaceholder(field),
      x: e.clientX - templateArea.left,
      y: e.clientY - templateArea.top,
      width: size.width,
      height: size.height,
    };

    if (activeTab === "ijazah") {
      setIjazahElements((prev) => [...prev, newElement]);
    } else {
      setTranskipElements((prev) => [...prev, newElement]);
    }
  };

  const handleMouseDownElement = (e, el) => {
    if (isSaved || isLocked) return;
    e.preventDefault();

    const templateArea = e.currentTarget.closest(".template-drop-area");
    if (!templateArea) return;

    const area = templateArea.getBoundingClientRect();

    setDraggingElement({
      id: el.id,
      offsetX: e.clientX - area.left - el.x,
      offsetY: e.clientY - area.top - el.y,
    });
  };

  const handleMouseMoveTemplate = (e) => {
    if (!draggingElement || isSaved || isLocked) return;

    const area = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX - area.left - draggingElement.offsetX;
    const newY = e.clientY - area.top - draggingElement.offsetY;

    const updater = (prev) =>
      prev.map((el) =>
        el.id === draggingElement.id ? { ...el, x: newX, y: newY } : el
      );

    if (activeTab === "ijazah") {
      setIjazahElements(updater);
    } else {
      setTranskipElements(updater);
    }
  };

  const handleMouseUpTemplate = () => setDraggingElement(null);

  const handleToggleField = (field) => {
    if (isSaved || isLocked) return;

    const remover = (prev) => prev.filter((el) => el.label !== field);

    if (activeTab === "ijazah") {
      setIjazahElements(remover);
    } else {
      setTranskipElements(remover);
    }
  };

  const handleSave = () => {
    if (!hasFields) return;

    const payload = {
      jenis_template: activeTab,
      elements: currentElements.map((el) => ({
        label: el.label,
        placeholder: el.placeholder,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
      })),
    };

    console.log("DATA TEMPLATE SIAP DIKIRIM KE DATABASE:", payload);

    // Nanti kalau endpoint backend sudah ada:
    // await api.post("/template", payload);

    if (activeTab === "ijazah") {
      setIjazahSaved(true);
    } else {
      setTranskipSaved(true);
    }

    setShowSavedModal(true);
  };

  const handleEditLock = () => {
    if (!hasFields) return;

    if (isLocked) {
      if (activeTab === "ijazah") {
        setIjazahLocked(false);
        setIjazahSaved(false);
      } else {
        setTranskipLocked(false);
        setTranskipSaved(false);
      }
      return;
    }

    if (!isSaved) return;

    if (activeTab === "ijazah") {
      setIjazahLocked(true);
    } else {
      setTranskipLocked(true);
    }
  };

  const handlePreview = () => {
    if (!hasFields || !isSaved || !isLocked) return;

    if (activeTab === "ijazah") {
      setIjazahPreview(true);
    } else {
      setTranskipPreview(true);
    }
  };

  if (ijazahPreview) {
    return (
      <div className="min-h-screen bg-[#d9d9d9] p-6 overflow-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIjazahPreview(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Keluar
          </button>
        </div>

        <div className="relative w-fit mx-auto bg-white p-6 rounded-xl shadow-lg">
          <img src={ijazahBg} alt="Preview Ijazah" className="w-[780px]" />
          {renderElements(ijazahElements, true, true, () => {}, "ijazah")}
        </div>
      </div>
    );
  }

  if (transkipPreview) {
    return (
      <div className="min-h-screen bg-[#d9d9d9] p-6 overflow-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setTranskipPreview(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Keluar
          </button>
        </div>

        <div className="relative w-fit mx-auto bg-white p-6 rounded-xl shadow-lg">
          <img src={transkipBg} alt="Preview Transkrip" className="w-[780px]" />
          {renderElements(transkipElements, true, true, () => {}, "transkip")}
          <TranskipTableOverlay
            elements={transkipElements}
            mataKuliahData={mataKuliahData}
          />
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-white min-h-screen -mt-6 -mb-6 -mx-4 md:-mx-8 px-4 md:px-8 pt-6 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Manajemen Template Ijazah dan Transkrip
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              Drag data field ke template untuk membuat kotak placeholder.
            </p>

            <div className="flex items-center gap-2 mt-4 text-sm">
              <button
                onClick={() => setActiveTab("ijazah")}
                className={`font-bold transition ${
                  activeTab === "ijazah" ? "text-[#27AE60]" : "text-gray-400"
                }`}
              >
                Ijazah Digital
              </button>

              <span className="text-gray-300">{">"}</span>

              <button
                onClick={() => setActiveTab("transkip")}
                className={`font-bold transition ${
                  activeTab === "transkip" ? "text-[#27AE60]" : "text-gray-400"
                }`}
              >
                Transkrip Digital
              </button>
            </div>
          </div>

          <button
            onClick={handlePreview}
            disabled={!hasFields || !isSaved || !isLocked}
            className={`border border-gray-300 shadow-sm rounded-xl px-5 py-3 font-semibold text-sm transition ${
              !hasFields || !isSaved || !isLocked
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 text-black"
            }`}
          >
            🖨 Pratinjau Cetak
          </button>
        </div>

        <div className="border-t border-gray-300 pt-4">
          <div className="flex gap-4">
            <div className="w-[260px] bg-[#e5e5e5] p-2 rounded-lg h-[760px] overflow-y-auto flex-shrink-0">
              <div className="px-2 py-2 mb-1">
                <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide">
                  Data Field
                </h2>
              </div>

              <div className="space-y-[2px]">
                {currentFields.map((item, index) => {
                  const active = isFieldActive(item);

                  return (
                    <div
                      key={index}
                      draggable={!isSaved && !isLocked && !active}
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => handleToggleField(item)}
                      title={
                        active
                          ? "Klik untuk menghapus field"
                          : "Drag ke template"
                      }
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold transition rounded-sm select-none ${
                        isSaved || isLocked
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : active
                          ? "bg-[#c0c0c0] text-gray-800 cursor-pointer"
                          : "bg-[#d9d9d9] hover:bg-[#cfcfcf] text-gray-700 cursor-grab"
                      }`}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 bg-[#d9d9d9] p-6 rounded-lg">
              <div
                onDrop={handleDropToTemplate}
                onDragOver={(e) => e.preventDefault()}
                onMouseMove={handleMouseMoveTemplate}
                onMouseUp={handleMouseUpTemplate}
                onMouseLeave={handleMouseUpTemplate}
                className="template-drop-area relative w-fit mx-auto bg-[#f4f4f4] p-6 rounded-xl shadow-lg"
              >
                {activeTab === "ijazah" && (
                  <>
                    <img
                      src={ijazahBg}
                      alt="Template Ijazah"
                      className="w-[780px]"
                    />
                    {renderElements(
                      ijazahElements,
                      ijazahSaved,
                      ijazahLocked,
                      handleMouseDownElement,
                      "ijazah"
                    )}
                  </>
                )}

                {activeTab === "transkip" && (
                  <>
                    <img
                      src={transkipBg}
                      alt="Template Transkrip"
                      className="w-[780px]"
                    />
                    {renderElements(
                      transkipElements,
                      transkipSaved,
                      transkipLocked,
                      handleMouseDownElement,
                      "transkip"
                    )}
                    <TranskipTableOverlay
                      elements={transkipElements}
                      mataKuliahData={mataKuliahData}
                    />
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={!hasFields}
                  className={`font-bold px-8 py-3 rounded-xl shadow transition ${
                    !hasFields
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#0B6B63] hover:bg-[#09544e] text-white"
                  }`}
                >
                  Simpan
                </button>

                <button
                  onClick={handleEditLock}
                  disabled={!hasFields || (!isSaved && !isLocked)}
                  className={`font-bold px-8 py-3 rounded-xl shadow transition ${
                    !hasFields || (!isSaved && !isLocked)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : isLocked
                      ? "bg-white hover:bg-gray-50 text-[#0B6B63] border border-[#0B6B63]"
                      : "bg-yellow-500 hover:bg-yellow-600 text-white"
                  }`}
                >
                  {isLocked ? "Edit" : "Lock"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {showSavedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-[360px] p-6 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-3xl font-bold">✓</span>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Data Berhasil Disimpan
              </h2>

              <p className="text-sm text-gray-500 mb-5">
                Template berhasil disimpan ke database.
              </p>

              <button
                onClick={() => setShowSavedModal(false)}
                className="bg-[#0B6B63] hover:bg-[#09544e] text-white font-bold px-6 py-2 rounded-xl"
              >
                Oke
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Template;