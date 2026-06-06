import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import ijazahBg from "../../assets/img/Ijazahfiks.png";
import transkripBg from "../../assets/img/transkripfiks.jpeg";
import { FiUpload, FiX, FiTrash2 } from "react-icons/fi";
import {
  getTemplateByJenis,
  uploadTemplateBackground,
  selectTemplateBackground,
  deleteTemplateBackground,
  saveTemplateLayout,
} from "../../services/api";

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

const transkripFields = [
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
const FIELD_BY_TEMPLATE = {
  ijazah: ijazahFields,
  transkrip: transkripFields,
};

const normalizeTemplateType = (type) => {
  if (type === "transkrip") return "transkrip";
  if (type === "transkip") return "transkrip";
  return "ijazah";
};

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
const previewAsFieldLabel = {
  ijazah: [
    "Foto",
    "QR Code",
    "TTD Rektor",
    "TTD Dekan",
    "Paraf KATU Rektor",
    "Paraf WAREK",
    "Paraf KATU Fakultas",
    "Paraf Wadek",
    "Stempel Rektor",
    "Stempel Dekan",
  ],

  transkrip: ["Paraf KATU Fakultas", "Paraf Kaprodi", "TTD Dekan"],
};

const emptyPreviewFields = {
  ijazah: [
    "Foto",
    "QR Code",
    "Paraf KATU Rektor",
    "Paraf WAREK",
    "Paraf KATU Fakultas",
    "Paraf Wadek",
    "Stempel Rektor",
    "Stempel Dekan",
    "TTD Rektor",
    "TTD Dekan",
  ],

  transkrip: ["Paraf KATU Fakultas", "Paraf Kaprodi", "TTD Dekan"],
};

const signatureFields = ["TTD Rektor", "TTD Dekan"];
const nameLineFields = ["Nama Rektor", "Nama Dekan"];
const nidnFields = ["NIDN Rektor", "NIDN Dekan"];

const englishSmallFields = [
  "Fakultas (English)",
  "Program Studi (English)",
  "Program (English)",
];

const ijazahLeftAlignFields = [
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
];
const fieldTextSize = {
  ijazah: {
    default: "text-[14px]",
    small: "text-[10px]",

    Nama: "text-[14px]",
    "Tempat & Tanggal Lahir": "text-[14px]",
    "Nomor Pokok Mahasiswa": "text-[14px]",
    NIK: "text-[14px]",
    "Akreditasi AIPT": "text-[10px]",
    Fakultas: "text-[12px]",
    "Program Studi": "text-[12px]",
    Program: "text-[12px]",
    "Fakultas (English)": "text-[10px]",
    "Program Studi (English)": "text-[10px]",
    "Program (English)": "text-[10px]",
    "Nama Rektor": "text-[12px]",
    "Nama Dekan": "text-[12px]",
    "NIDN Rektor": "text-[10px]",
    "NIDN Dekan": "text-[10px]",
  },

  transkrip: {
    default: "text-[7px]",
    small: "text-[6px]",

    Nomor: "text-[7px]",
    Nama: "text-[7px]",
    "Tempat & Tanggal Lahir": "text-[7px]",
    "Jenis Kelamin": "text-[7px]",
    "Nomor Pokok Mahasiswa": "text-[7px]",
    NINA: "text-[7px]",
    NIK: "text-[7px]",
    "Tahun Masuk": "text-[7px]",
    "Program Pendidikan": "text-[7px]",
    Fakultas: "text-[7px]",
    "Program Studi": "text-[7px]",
    "Nomor SK Akreditasi": "text-[7px]",
    Status: "text-[7px]",
    "Tanggal Lulus": "text-[7px]",

    "Nama Dekan": "text-[8px]",
    "NIDN Dekan": "text-[7px]",
  },
};

const getTextSizeClass = (documentType, label, small = false) => {
  const config = fieldTextSize[documentType] || fieldTextSize.ijazah;

  if (config[label]) {
    return config[label];
  }

  if (small) {
    return config.small;
  }

  return config.default;
};

const makePlaceholder = (label) =>
  `{{${label
    .toLowerCase()
    .replaceAll(" & ", "_")
    .replaceAll(" ", "_")
    .replaceAll("(", "")
    .replaceAll(")", "")}}}`;

const getActiveTemplateName = (type) => {
  return type === "ijazah" ? "Template Ijazah" : "Template Transkrip";
};

const getIjazahFieldSize = (field) => {
  // IJAZAH
  if (field === "Nama") return { width: 145, height: 21 };
  if (field === "Tempat & Tanggal Lahir") return { width: 145, height: 21 };
  if (field === "Nomor Pokok Mahasiswa") return { width: 145, height: 21 };
  if (field === "NIK") return { width: 145, height: 21 };

  if (field === "Tanggal Kelulusan") return { width: 95, height: 14 };
  if (field === "PISN") return { width: 95, height: 14 };
  if (field === "Nomor Seri Ijazah") return { width: 95, height: 14 };
  if (field === "Akreditasi AIPT") return { width: 75, height: 21 };

  if (
    field === "Fakultas (English)" ||
    field === "Program Studi (English)" ||
    field === "Program (English)"
  ) {
    return { width: 145, height: 13 };
  }

  if (
    field === "Fakultas" ||
    field === "Program Studi" ||
    field === "Program"
  ) {
    return { width: 145, height: 16 };
  }

  if (field === "Foto") return { width: 95, height: 125 };
  if (field === "QR Code") return { width: 72, height: 72 };
  if (field.includes("Stempel")) return { width: 85, height: 85 };

  if (field === "TTD Rektor") return { width: 78, height: 55 };
  if (field === "TTD Dekan") return { width: 78, height: 55 };
  if (field.includes("Paraf")) return { width: 28, height: 28 };

  if (field === "Gelar") return { width: 330, height: 18 };
  if (field === "Tanggal Terbit") return { width: 145, height: 18 };

  if (field === "Nama Rektor" || field === "Nama Dekan") {
    return { width: 18, height: 16 };
  }

  if (field === "NIDN Rektor" || field === "NIDN Dekan") {
    return { width: 95, height: 16 };
  }

  return { width: 145, height: 17 };
};

const getTranskripFieldSize = (field) => {
  // TRANSKRIP
  const transkripBiodataFields = [
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
  ];

  if (transkripBiodataFields.includes(field)) {
    return { width: 145, height: 6 };
  }

  if (field === "TTD Dekan") return { width: 78, height: 55 };
  if (field === "Nama Dekan") return { width: 18, height: 16 };
  if (field === "NIDN Dekan") return { width: 95, height: 16 };

  if (field === "Paraf KATU Fakultas") return { width: 28, height: 28 };
  if (field === "Paraf Kaprodi") return { width: 28, height: 28 };

  return { width: 145, height: 8 };
};

const getFieldSize = (field, documentType = "ijazah") => {
  if (documentType === "transkrip") {
    return getTranskripFieldSize(field);
  }

  return getIjazahFieldSize(field);
};

const mapBackendTemplateToState = (template, fallbackImage) => {
  const layout = template?.konfigurasi_layout || {};

  const rawAssets = Array.isArray(layout.assets) ? layout.assets : [];
  const elements = Array.isArray(layout.elements) ? layout.elements : [];

  const assets = rawAssets.map((asset) => ({
    ...asset,
    src: getTemplateImageSrc(asset.src, fallbackImage),
  }));

  const activeAsset = assets.find((asset) => asset.isActive);

  return {
    image: getTemplateImageSrc(
      template?.file_template || activeAsset?.src,
      fallbackImage,
    ),
    assets,
    elements,
    isSaved: Boolean(layout.isSaved),
    isLocked: Boolean(layout.isLocked),
    hasPreviewed: Boolean(layout.hasPreviewed),
  };
};

const WaitingDataText = ({
  small = false,
  value = "",
  align = "center",
  label = "",
  documentType = "ijazah",
}) => {
  const alignClass =
    align === "left" ? "justify-start text-left" : "justify-center text-center";

  const textSize = getTextSizeClass(documentType, label, small);

  return (
    <div
      className={`w-full h-full flex items-center ${alignClass} text-gray-800 font-semibold leading-none px-1 whitespace-nowrap ${textSize}`}
    >
      {value || "Menunggu Data"}
    </div>
  );
};

const renderElements = (
  elements,
  isSaved,
  isLocked,
  handleMouseDownElement,
  documentType,
  isPreview = false,
  previewData = {},
) =>
  elements.map((el) => {
    const isBoxOnly = boxOnlyFields.includes(el.label);
    const isSignature = signatureFields.includes(el.label);
    const isNameLine = nameLineFields.includes(el.label);
    const isNidn = nidnFields.includes(el.label);
    const isEnglishSmall = englishSmallFields.includes(el.label);

    const fieldValue =
      previewData?.[el.label] || previewData?.[el.placeholder] || "";

    const shouldShowFieldLabel =
      isPreview && previewAsFieldLabel[documentType]?.includes(el.label);

    const displayValue = isPreview
      ? shouldShowFieldLabel
        ? el.label
        : fieldValue || "Menunggu Data"
      : "";
    const textAlign =
      documentType === "transkrip"
        ? "left"
        : ijazahLeftAlignFields.includes(el.label)
          ? "left"
          : "center";

    const size = getFieldSize(el.label, documentType);
    const renderWidth = size.width;
    const renderHeight = size.height;

    const isSmallBox =
      renderWidth <= 45 ||
      renderHeight <= 16 ||
      el.label.includes("Paraf") ||
      isEnglishSmall;

    const fieldBoxClass = `rounded-sm ${
      isPreview
        ? "border border-transparent bg-transparent"
        : "border border-gray-500 bg-transparent"
    }`;

    return (
      <div
        key={el.id}
        onMouseDown={(e) => handleMouseDownElement(e, el)}
        className={`absolute z-20 group ${
          !isSaved && !isLocked ? "cursor-move" : "cursor-default"
        }`}
        style={{
          left: el.x,
          top: el.y,
        }}
      >
        {!isPreview && (
          <div className="pointer-events-none absolute -top-7 left-0 z-50 hidden group-hover:block whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
            {el.label}
          </div>
        )}
        {/* NAMA REKTOR / NAMA DEKAN */}
        {isNameLine && (
          <div
            className="flex flex-col items-center"
            style={{
              width: isPreview ? "auto" : renderWidth,
              height: isPreview ? "auto" : renderHeight + 4,
            }}
          >
            {isPreview ? (
              <div className="inline-flex flex-col items-left text-left">
                <span className="inline-block text-gray-800 font-semibold text-[12px] leading-none whitespace-nowrap px-1 text-center">
                  {displayValue}
                </span>

                <div className="w-full border-t border-black mt-[2px]" />
              </div>
            ) : (
              <>
                <div
                  className={fieldBoxClass}
                  style={{
                    width: renderWidth,
                    height: renderHeight,
                  }}
                />

                <div
                  className="border-t border-black mt-[2px]"
                  style={{
                    width: renderWidth,
                  }}
                />
              </>
            )}
          </div>
        )}

        {isSignature && (
          <div
            className={
              isPreview && emptyPreviewFields[documentType]?.includes(el.label)
                ? "rounded-sm border border-gray-500 bg-transparent"
                : fieldBoxClass
            }
            style={{
              width: renderWidth,
              height: renderHeight,
            }}
          >
            {isPreview &&
              !emptyPreviewFields[documentType]?.includes(el.label) && (
                <WaitingDataText
                  value={displayValue}
                  align={textAlign}
                  label={el.label}
                  documentType={documentType}
                />
              )}
          </div>
        )}

        {isNidn && (
          <div
            className="flex items-center gap-[3px]"
            style={{
              height: renderHeight,
            }}
          >
            <span className="font-semibold text-gray-800 whitespace-nowrap text-[10px] leading-none">
              NIDN.
            </span>

            {isPreview ? (
              <span className="inline-block text-gray-800 font-semibold text-[10px] leading-none whitespace-nowrap">
                {displayValue}
              </span>
            ) : (
              <div
                className={fieldBoxClass}
                style={{
                  width: renderWidth,
                  height: renderHeight,
                }}
              />
            )}
          </div>
        )}

        {isBoxOnly && (
          <div
            className={
              isPreview && emptyPreviewFields[documentType]?.includes(el.label)
                ? "rounded-sm border border-gray-500 bg-transparent"
                : fieldBoxClass
            }
            style={{
              width: renderWidth,
              height: renderHeight,
            }}
          >
            {isPreview &&
              !emptyPreviewFields[documentType]?.includes(el.label) && (
                <WaitingDataText
                  small={isSmallBox}
                  value={displayValue}
                  align={textAlign}
                  label={el.label}
                  documentType={documentType}
                />
              )}
          </div>
        )}

        {!isNameLine && !isSignature && !isNidn && !isBoxOnly && (
          <div
            className={fieldBoxClass}
            style={{
              width: renderWidth,
              height: renderHeight,
            }}
          >
            {isPreview && (
              <WaitingDataText
                small={isSmallBox}
                value={displayValue}
                align={textAlign}
                label={el.label}
                documentType={documentType}
              />
            )}
          </div>
        )}
      </div>
    );
  });

const TranskripTableOverlay = ({ elements, mataKuliahData = [] }) => {
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
      style={{ top: "27%", paddingLeft: "3.5%", paddingRight: "3.5%" }}
    >
      <div className="flex justify-between items-start">
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
                  colSpan={2}
                  className="border border-[#707070] font-semibold"
                >
                  NILAI
                </th>
                <th
                  colSpan={2}
                  className="border border-[#707070] font-semibold"
                >
                  BOBOT
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
                  colSpan={2}
                  className="border border-[#707070] font-semibold"
                >
                  NILAI
                </th>
                <th
                  colSpan={2}
                  className="border border-[#707070] font-semibold"
                >
                  BOBOT
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
const getTemplateImageSrc = (src, fallback) => {
  if (!src) return fallback;

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  if (src.startsWith("/")) {
    return src;
  }

  return `/${src}`;
};
const Template = () => {
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState("");

  const [activeTab, setActiveTab] = useState("ijazah");

  const [templateImages, setTemplateImages] = useState({
    ijazah: ijazahBg,
    transkrip: transkripBg,
  });
  const [templateAssets, setTemplateAssets] = useState({
    ijazah: [],
    transkrip: [],
  });

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [showConfirmUploadModal, setShowConfirmUploadModal] = useState(false);

  const [selectedTemplateType, setSelectedTemplateType] = useState("ijazah");

  const [selectedTemplateFile, setSelectedTemplateFile] = useState(null);
  const [selectedTemplatePreview, setSelectedTemplatePreview] = useState("");
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [pendingSelectedAssetId, setPendingSelectedAssetId] = useState(null);

  const [imagePreviewModal, setImagePreviewModal] = useState({
    open: false,
    src: "",
    name: "",
  });

  const [deleteAssetModal, setDeleteAssetModal] = useState({
    open: false,
    asset: null,
  });

  const [ijazahElements, setIjazahElements] = useState([]);
  const [ijazahSaved, setIjazahSaved] = useState(false);
  const [ijazahLocked, setIjazahLocked] = useState(false);
  const [ijazahHasPreviewed, setIjazahHasPreviewed] = useState(false);

  const [transkripElements, setTranskripElements] = useState([]);
  const [transkripSaved, setTranskripSaved] = useState(false);
  const [transkripLocked, setTranskripLocked] = useState(false);
  const [transkripHasPreviewed, setTranskripHasPreviewed] = useState(false);

  const [mataKuliahData, setMataKuliahData] = useState([]);
  const [draggingElement, setDraggingElement] = useState(null);

  const [ijazahPreview, setIjazahPreview] = useState(false);
  const [transkripPreview, setTranskripPreview] = useState(false);

  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const currentTemplateType = normalizeTemplateType(activeTab);

  const currentFields = FIELD_BY_TEMPLATE[currentTemplateType];

  const currentElements =
    currentTemplateType === "transkrip" ? transkripElements : ijazahElements;

  const isSaved =
    currentTemplateType === "transkrip" ? transkripSaved : ijazahSaved;

  const isLocked =
    currentTemplateType === "transkrip" ? transkripLocked : ijazahLocked;

  const hasFields = currentElements.length > 0;

  const hasPreviewed =
    currentTemplateType === "transkrip"
      ? transkripHasPreviewed
      : ijazahHasPreviewed;

  const isFieldActive = (field) =>
    currentElements.some((el) => el.label === field);
  const applyTemplateFromBackend = (jenis, templateData) => {
    const fallbackImage = jenis === "ijazah" ? ijazahBg : transkripBg;
    const mapped = mapBackendTemplateToState(templateData, fallbackImage);

    setTemplateImages((prev) => ({
      ...prev,
      [jenis]: mapped.image,
    }));

    setTemplateAssets((prev) => ({
      ...prev,
      [jenis]: mapped.assets.length > 0 ? mapped.assets : prev[jenis] || [],
    }));

    if (jenis === "ijazah") {
      setIjazahElements(mapped.elements);
      setIjazahSaved(mapped.isSaved);
      setIjazahLocked(mapped.isLocked);
      setIjazahHasPreviewed(mapped.hasPreviewed);
    } else {
      setTranskripElements(mapped.elements);
      setTranskripSaved(mapped.isSaved);
      setTranskripLocked(mapped.isLocked);
      setTranskripHasPreviewed(mapped.hasPreviewed);
    }
  };

  const loadTemplatesFromBackend = async () => {
    try {
      setLoadingTemplate(true);
      setTemplateError("");

      const [ijazahResult, transkripResult] = await Promise.all([
        getTemplateByJenis("ijazah"),
        getTemplateByJenis("transkrip"),
      ]);

      applyTemplateFromBackend("ijazah", ijazahResult.data);
      applyTemplateFromBackend("transkrip", transkripResult.data);
    } catch (error) {
      console.error("Gagal mengambil template:", error);
      setTemplateError(error.message || "Gagal mengambil template.");
    } finally {
      setLoadingTemplate(false);
    }
  };
  useEffect(() => {
    loadTemplatesFromBackend();
  }, []);

  const resetPreviewState = () => {
    if (activeTab === "ijazah") {
      setIjazahSaved(false);
      setIjazahHasPreviewed(false);
    } else {
      setTranskripSaved(false);
      setTranskripHasPreviewed(false);
    }
  };

  const handleOpenUploadModal = () => {
    setSelectedTemplateType(activeTab);
    setSelectedTemplateFile(null);
    setSelectedTemplatePreview("");
    setSelectedTemplateName("");

    const activeAsset = templateAssets[activeTab]?.find(
      (asset) => asset.isActive,
    );

    setPendingSelectedAssetId(activeAsset?.id || null);
    setUploadModalOpen(true);
  };

  const handleTemplateImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      return;
    }

    try {
      const result = await uploadTemplateBackground(
        selectedTemplateType,
        file,
        selectedTemplateName.trim() || file.name,
      );

      const mapped = mapBackendTemplateToState(
        result.data,
        selectedTemplateType === "ijazah" ? ijazahBg : transkripBg,
      );

      setTemplateImages((prev) => ({
        ...prev,
        [selectedTemplateType]: mapped.image,
      }));

      setTemplateAssets((prev) => ({
        ...prev,
        [selectedTemplateType]: mapped.assets,
      }));

      const newAsset = mapped.assets[mapped.assets.length - 1];

      setPendingSelectedAssetId(newAsset?.id || null);
      setSelectedTemplateFile(null);
      setSelectedTemplatePreview("");
      setSelectedTemplateName("");

      e.target.value = "";
    } catch (error) {
      console.error("Gagal upload background:", error);
      alert(error.message || "Gagal upload background template.");
    }
  };

  const handleUseTemplateAsset = (asset) => {
    setPendingSelectedAssetId(asset.id);
  };

  const handleDeleteTemplateAsset = (asset) => {
    if (asset.isActive) {
      alert("Gambar yang sedang aktif tidak bisa dihapus.");
      return;
    }

    setDeleteAssetModal({
      open: true,
      asset,
    });
  };

  const confirmDeleteTemplateAsset = async () => {
    const asset = deleteAssetModal.asset;

    if (!asset) return;

    try {
      const result = await deleteTemplateBackground(
        selectedTemplateType,
        asset.id,
      );

      const mapped = mapBackendTemplateToState(
        result.data,
        selectedTemplateType === "ijazah" ? ijazahBg : transkripBg,
      );

      setTemplateImages((prev) => ({
        ...prev,
        [selectedTemplateType]: mapped.image,
      }));

      setTemplateAssets((prev) => ({
        ...prev,
        [selectedTemplateType]: mapped.assets,
      }));

      if (pendingSelectedAssetId === asset.id) {
        setPendingSelectedAssetId(null);
      }

      setDeleteAssetModal({
        open: false,
        asset: null,
      });
    } catch (error) {
      console.error("Gagal menghapus background:", error);
      alert(error.message || "Gagal menghapus background template.");
    }
  };

  const handleSaveAssetChanges = () => {
    if (!pendingSelectedAssetId) {
      alert("Pilih salah satu gambar template terlebih dahulu.");
      return;
    }

    setShowConfirmUploadModal(true);
  };

  const confirmSaveTemplateImage = async () => {
    const selectedAsset = templateAssets[selectedTemplateType].find(
      (asset) => asset.id === pendingSelectedAssetId,
    );

    if (!selectedAsset) {
      alert("Gambar yang dipilih tidak ditemukan.");
      return;
    }

    try {
      const result = await selectTemplateBackground(
        selectedTemplateType,
        selectedAsset.id,
      );

      const mapped = mapBackendTemplateToState(
        result.data,
        selectedTemplateType === "ijazah" ? ijazahBg : transkripBg,
      );

      setTemplateImages((prev) => ({
        ...prev,
        [selectedTemplateType]: mapped.image,
      }));

      setTemplateAssets((prev) => ({
        ...prev,
        [selectedTemplateType]: mapped.assets,
      }));

      setShowConfirmUploadModal(false);
      setUploadModalOpen(false);
      setSelectedTemplateFile(null);
      setSelectedTemplatePreview("");
      setPendingSelectedAssetId(null);
      setSelectedTemplateName("");
      setSelectedTemplateType(activeTab);
    } catch (error) {
      console.error("Gagal memilih background aktif:", error);
      alert(error.message || "Gagal memilih background aktif.");
    }
  };

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
    setShowConfirmUploadModal(false);
    setSelectedTemplateFile(null);
    setSelectedTemplatePreview("");
    setSelectedTemplateName("");
    setPendingSelectedAssetId(null);
    setDeleteAssetModal({
      open: false,
      asset: null,
    });
    setSelectedTemplateType(activeTab);
  };

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

    let size = getFieldSize(field, activeTab);

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
      setIjazahSaved(false);
      setIjazahHasPreviewed(false);
    } else {
      setTranskripElements((prev) => [...prev, newElement]);
      setTranskripSaved(false);
      setTranskripHasPreviewed(false);
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
        el.id === draggingElement.id ? { ...el, x: newX, y: newY } : el,
      );

    if (activeTab === "ijazah") {
      setIjazahElements(updater);
      resetPreviewState();
    } else {
      setTranskripElements(updater);
      resetPreviewState();
    }
  };

  const handleMouseUpTemplate = () => setDraggingElement(null);

  const handleToggleField = (field) => {
    if (isSaved || isLocked) return;

    const remover = (prev) => prev.filter((el) => el.label !== field);

    if (activeTab === "ijazah") {
      setIjazahElements(remover);
      resetPreviewState();
    } else {
      setTranskripElements(remover);
      resetPreviewState();
    }
  };

  const handleEditLock = () => {
    if (!hasFields) return;

    if (activeTab === "ijazah") {
      if (ijazahLocked) {
        setIjazahLocked(false);
        setIjazahSaved(false);
        setIjazahHasPreviewed(false);
      } else {
        setIjazahLocked(true);
        setIjazahHasPreviewed(false);
      }
    } else {
      if (transkripLocked) {
        setTranskripLocked(false);
        setTranskripSaved(false);
        setTranskripHasPreviewed(false);
      } else {
        setTranskripLocked(true);
        setTranskripHasPreviewed(false);
      }
    }
  };

  const handlePreview = () => {
    if (!hasFields || !isLocked) return;

    if (activeTab === "ijazah") {
      setIjazahHasPreviewed(true);
      setIjazahPreview(true);
    } else {
      setTranskripHasPreviewed(true);
      setTranskripPreview(true);
    }
  };

  const handleSave = () => {
    if (!hasFields || !isLocked || !hasPreviewed) return;

    setShowConfirmSaveModal(true);
  };

  const confirmSaveTemplate = async () => {
    try {
      const jenis = activeTab === "ijazah" ? "ijazah" : "transkrip";

      const elements = jenis === "ijazah" ? ijazahElements : transkripElements;
      const isLockedValue = jenis === "ijazah" ? ijazahLocked : transkripLocked;
      const hasPreviewedValue =
        jenis === "ijazah" ? ijazahHasPreviewed : transkripHasPreviewed;

      const result = await saveTemplateLayout(
        jenis,
        elements,
        true,
        isLockedValue,
        hasPreviewedValue,
      );

      const mapped = mapBackendTemplateToState(
        result.data,
        jenis === "ijazah" ? ijazahBg : transkripBg,
      );

      if (jenis === "ijazah") {
        setIjazahElements(mapped.elements);
        setIjazahSaved(mapped.isSaved);
        setIjazahLocked(mapped.isLocked);
        setIjazahHasPreviewed(mapped.hasPreviewed);
      } else {
        setTranskripElements(mapped.elements);
        setTranskripSaved(mapped.isSaved);
        setTranskripLocked(mapped.isLocked);
        setTranskripHasPreviewed(mapped.hasPreviewed);
      }

      setShowConfirmSaveModal(false);
      setShowSavedModal(true);
    } catch (error) {
      console.error("Gagal menyimpan template:", error);
      alert(error.message || "Gagal menyimpan template.");
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

        <div className="relative w-fit mx-auto">
          <img
            src={templateImages.ijazah}
            alt="Preview Ijazah"
            className="w-[780px]"
          />

          {renderElements(ijazahElements, true, true, () => {}, "ijazah", true)}
        </div>
      </div>
    );
  }

  if (transkripPreview) {
    return (
      <div className="min-h-screen bg-[#d9d9d9] p-6 overflow-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setTranskripPreview(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Keluar
          </button>
        </div>

        <div className="relative w-fit mx-auto">
          <img
            src={templateImages.transkrip}
            alt="Preview Transkrip"
            className="w-[780px]"
          />

          {renderElements(
            transkripElements,
            true,
            true,
            () => {},
            "transkrip",
            true,
          )}

          <TranskripTableOverlay
            elements={transkripElements}
            mataKuliahData={mataKuliahData}
          />
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen pb-6">
        {loadingTemplate && (
          <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-lg border">
            Memuat template...
          </div>
        )}

        {templateError && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {templateError}
          </div>
        )}
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
                className={`font-bold transition px-4 py-2 rounded-xl border ${
                  activeTab === "ijazah"
                    ? "bg-[#0B6B63] text-white border-[#0B6B63] shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-[#E6F4F1] hover:text-[#0B6B63] hover:border-[#0B6B63]"
                }`}
              >
                Ijazah Digital
              </button>

              <button
                onClick={() => setActiveTab("transkrip")}
                className={`font-bold transition px-4 py-2 rounded-xl border ${
                  activeTab === "transkrip"
                    ? "bg-[#0B6B63] text-white border-[#0B6B63] shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-[#E6F4F1] hover:text-[#0B6B63] hover:border-[#0B6B63]"
                }`}
              >
                Transkrip Digital
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenUploadModal}
              className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-xl px-5 py-3 font-semibold text-sm bg-white hover:bg-gray-50 text-black transition"
            >
              <FiUpload size={16} />
              Unggah Gambar Template
            </button>

            <button
              onClick={handlePreview}
              disabled={!hasFields || !isLocked}
              className={`border border-gray-300 shadow-sm rounded-xl px-5 py-3 font-semibold text-sm transition ${
                !hasFields || !isLocked
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50 text-black"
              }`}
            >
              🖨 Pratinjau Cetak
            </button>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4">
          <div className="flex gap-4">
            <div className="w-[260px] bg-[#e5e5e5] p-2 rounded-lg h-[760px] overflow-y-auto flex-shrink-0">
              <div className="px-2 py-2 mb-1">
                <h2 className="text-md font-black text-gray-700 uppercase tracking-wide">
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
                className="template-drop-area relative w-fit mx-auto"
              >
                {activeTab === "ijazah" && (
                  <>
                    <img
                      src={templateImages.ijazah}
                      alt="Template Ijazah"
                      className="w-[780px]"
                    />

                    {renderElements(
                      ijazahElements,
                      ijazahSaved,
                      ijazahLocked,
                      handleMouseDownElement,
                      "ijazah",
                    )}
                  </>
                )}

                {activeTab === "transkrip" && (
                  <>
                    <img
                      src={templateImages.transkrip}
                      alt="Template Transkrip"
                      className="w-[780px]"
                    />

                    {renderElements(
                      transkripElements,
                      transkripSaved,
                      transkripLocked,
                      handleMouseDownElement,
                      "transkrip",
                    )}

                    <TranskripTableOverlay
                      elements={transkripElements}
                      mataKuliahData={mataKuliahData}
                    />
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={!hasFields || !isLocked || !hasPreviewed}
                  className={`font-bold px-8 py-3 rounded-xl shadow transition ${
                    !hasFields || !isLocked || !hasPreviewed
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#0B6B63] hover:bg-[#09544e] text-white"
                  }`}
                >
                  Simpan
                </button>

                <button
                  onClick={handleEditLock}
                  disabled={!hasFields}
                  className={`font-bold px-8 py-3 rounded-xl shadow transition ${
                    !hasFields
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

        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white w-[880px] max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Menu Asset Template
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    Pilih file gambar, lalu gambar akan otomatis masuk ke tabel.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseUploadModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-800">
                    Gunakan gambar untuk
                  </label>

                  <select
                    value={selectedTemplateType}
                    onChange={(e) => {
                      const type = e.target.value;

                      setSelectedTemplateType(type);
                      setSelectedTemplateFile(null);
                      setSelectedTemplatePreview("");

                      const activeAsset = templateAssets[type]?.find(
                        (asset) => asset.isActive,
                      );

                      setPendingSelectedAssetId(activeAsset?.id || null);
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B6B63]"
                  >
                    <option value="ijazah">Template Ijazah</option>
                    <option value="transkrip">Template Transkrip</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-800">
                      Nama Gambar Template
                    </label>

                    <input
                      type="text"
                      value={selectedTemplateName}
                      onChange={(e) => setSelectedTemplateName(e.target.value)}
                      placeholder="Contoh: Template Ijazah/Transkrip 2026"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-[#0B6B63]"
                    />

                    <p className="text-xs text-gray-400">
                      Nama ini akan tampil di tabel daftar gambar template.
                    </p>
                  </div>
                  <label className="text-sm font-semibold text-gray-800">
                    Pilih File Gambar
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTemplateImageChange}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  />

                  <p className="text-xs text-gray-400">
                    Setelah pilih file, gambar akan otomatis masuk ke tabel.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800">
                      Daftar Gambar Template
                    </h3>
                  </div>

                  <table className="w-full text-sm table-fixed">
                    <thead className="bg-[#F7F7F7] text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-3 text-center w-[60px]"></th>
                        <th className="px-3 py-3 text-center w-[100px]">
                          Preview
                        </th>
                        <th className="px-3 py-3 text-left w-[145px]">
                          Nama Gambar
                        </th>
                        <th className="px-3 py-3 text-center w-[110px]">
                          Status
                        </th>
                        <th className="px-3 py-3 text-center w-[70px]">Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {templateAssets[selectedTemplateType].map((asset) => (
                        <tr
                          key={asset.id}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-3 py-3 text-center w-[60px]">
                            <input
                              type="radio"
                              name={`template-asset-${selectedTemplateType}`}
                              checked={pendingSelectedAssetId === asset.id}
                              onChange={() => handleUseTemplateAsset(asset)}
                              className="w-4 h-4 accent-[#0B6B63] cursor-pointer"
                            />
                          </td>

                          <td className="px-3 py-3 text-center w-[110px]">
                            <button
                              type="button"
                              onClick={() =>
                                setImagePreviewModal({
                                  open: true,
                                  src: getTemplateImageSrc(
                                    asset.src,
                                    selectedTemplateType === "ijazah"
                                      ? ijazahBg
                                      : transkripBg,
                                  ),
                                  name: asset.name,
                                })
                              }
                              className="w-14 h-14 mx-auto rounded-lg overflow-hidden border border-gray-200 bg-gray-100 hover:scale-105 transition"
                              title="Lihat gambar template"
                            >
                              <img
                                src={getTemplateImageSrc(
                                  asset.src,
                                  selectedTemplateType === "ijazah"
                                    ? ijazahBg
                                    : transkripBg,
                                )}
                                alt={asset.name}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          </td>

                          <td className="px-3 py-3 font-semibold text-gray-800 text-left w-[145px]">
                            {asset.name}
                          </td>

                          <td className="px-3 py-3 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                asset.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {asset.isActive ? "Aktif" : "Tidak Aktif"}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteTemplateAsset(asset)}
                              disabled={asset.isActive}
                              title="Hapus gambar"
                              className={`w-8 h-8 rounded-md flex items-center justify-center mx-auto transition ${
                                asset.isActive
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                              }`}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {templateAssets[selectedTemplateType].length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-4 py-8 text-center text-gray-400"
                          >
                            Belum ada gambar template.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-5 bg-gray-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCloseUploadModal}
                  className="px-6 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSaveAssetChanges}
                  disabled={!pendingSelectedAssetId}
                  className={`px-6 py-2 rounded-xl font-semibold transition ${
                    !pendingSelectedAssetId
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#0B6B63] hover:bg-[#09544e] text-white"
                  }`}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        {imagePreviewModal.open && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-[720px] max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Preview Gambar Template
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    {imagePreviewModal.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setImagePreviewModal({
                      open: false,
                      src: "",
                      name: "",
                    })
                  }
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 overflow-auto bg-gray-50 flex justify-center">
                <img
                  src={imagePreviewModal.src}
                  alt={imagePreviewModal.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl border border-gray-200 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {deleteAssetModal.open && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-[390px] p-6 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-3xl font-bold">!</span>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Hapus Gambar Template?
              </h2>

              <p className="text-sm text-gray-500 mb-6">
                Gambar ini akan dihapus dari daftar template. Tindakan ini tidak
                bisa dibatalkan.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteAssetModal({
                      open: false,
                      asset: null,
                    })
                  }
                  className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteTemplateAsset}
                  className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmUploadModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-[390px] p-6 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 text-3xl font-bold">!</span>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Simpan Perubahan Gambar?
              </h2>

              <p className="text-sm text-gray-500 mb-6">
                Gambar yang dipilih akan digunakan sebagai template aktif.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmUploadModal(false)}
                  className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={confirmSaveTemplateImage}
                  className="px-6 py-2 rounded-xl bg-[#0B6B63] text-white font-bold hover:bg-[#09544e]"
                >
                  Ya, Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-[390px] p-6 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 text-3xl font-bold">!</span>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Simpan Template?
              </h2>

              <p className="text-sm text-gray-500 mb-6">
                Pastikan posisi field sudah sesuai. Template akan disimpan
              </p>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmSaveModal(false)}
                  className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={confirmSaveTemplate}
                  className="px-6 py-2 rounded-xl bg-[#0B6B63] text-white font-bold hover:bg-[#09544e]"
                >
                  Ya, Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {showSavedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-[360px] p-6 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-3xl font-bold">✓</span>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Data Berhasil Disimpan
              </h2>

              <p className="text-sm text-gray-500 mb-5">
                Template berhasil disimpan.
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
