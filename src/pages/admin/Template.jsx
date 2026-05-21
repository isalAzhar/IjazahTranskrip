import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/ui/DashboardLayout";
import ijazahBg from "../../assets/img/Tamplate Ijazah.jpg";
import transkipBg from "../../assets/img/Tamplate Transkip.jpg";

const Template = () => {
  const [editMode, setEditMode] = useState(true);
  const [activeTab, setActiveTab] = useState("ijazah");

  const [templates, setTemplates] = useState({
    ijazah: {
      background: ijazahBg,
      elements: [
        { id: "nama", label: "Nama Lengkap", x: 400, y: 250 },
        { id: "nim", label: "NIM", x: 400, y: 300 },
      ],
    },
    transkip: {
      background: transkipBg,
      elements: [
        { id: "nama2", label: "Nama Lengkap", x: 300, y: 200 },
        { id: "nim2", label: "NIM", x: 300, y: 240 },
      ],
    },
  });

  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const currentTemplate = templates[activeTab];

  const handleMouseDown = (e, id) => {
    if (!editMode) return;

    const el = currentTemplate.elements.find((el) => el.id === id);

    setDragging(id);
    setOffset({
      x: e.clientX - el.x,
      y: e.clientY - el.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    setTemplates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        elements: prev[activeTab].elements.map((el) =>
          el.id === dragging
            ? {
                ...el,
                x: e.clientX - offset.x,
                y: e.clientY - offset.y,
              }
            : el
        ),
      },
    }));
  };

  const handleMouseUp = () => setDragging(null);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  const addField = (label) => {
    setTemplates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        elements: [
          ...prev[activeTab].elements,
          {
            id: Date.now(),
            label,
            x: 200,
            y: 200,
          },
        ],
      },
    }));
  };

  return (
    <DashboardLayout>
      
      {/* HEADER */}
      <header className="mb-6">
        <h1 className="text-3xl font-black text-[#1a1a1a]">
          Manajemen Template Ijazah dan Transkip
        </h1>

        <p className="text-gray-400 text-xs mt-1">
          Konfigurasi tata letak dan elemen keamanan ijazah digital.
        </p>

        {/* TAB DI ATAS */}
        <div className="flex gap-3 mt-4 text-sm font-bold items-center">
          <button
            onClick={() => setActiveTab("ijazah")}
            className={`transition ${
              activeTab === "ijazah"
                ? "text-[#27AE60]"
                : "text-gray-400 hover:text-[#27AE60]"
            }`}
          >
            Ijazah Digital
          </button>

          <span className="text-gray-300">{">"}</span>

          <button
            onClick={() => setActiveTab("transkip")}
            className={`transition ${
              activeTab === "transkip"
                ? "text-[#27AE60]"
                : "text-gray-400 hover:text-[#27AE60]"
            }`}
          >
            Transkrip Digital
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* SIDEBAR */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold mb-4">Field Data</h3>

          {(activeTab === "ijazah"
            ? ["Nama Lengkap", "NIM", "Fakultas", "Program Studi"]
            : ["Nama Lengkap", "NIM", "Mata Kuliah", "Nilai", "IPK"]
          ).map((item, i) => (
            <div
              key={i}
              onClick={() => addField(item)}
              className="p-2 mb-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm"
            >
              + {item}
            </div>
          ))}

          <button
            onClick={() => setEditMode(!editMode)}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded text-sm font-bold"
          >
            {editMode ? "Mode Edit" : "Mode View"}
          </button>
        </div>

        {/* CANVAS */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow p-5 overflow-auto">
            <div className="relative border rounded-lg overflow-hidden">
              
              <img
                src={currentTemplate.background}
                alt="template"
                className="w-full"
              />

              {currentTemplate.elements.map((el) => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  className={`absolute px-2 py-1 text-sm font-bold ${
                    editMode
                      ? "bg-blue-500 text-white cursor-move"
                      : "text-black"
                  }`}
                  style={{
                    left: el.x,
                    top: el.y,
                  }}
                >
                  {el.label}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Template;