import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiBell, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../pages/context/AuthContext";
import logo from "../../assets/img/Logo.jpg";

const unitMap = {
  1: { name: "FAI",     label: "Fakultas Agama Islam" },
  2: { name: "FKIP",   label: "Fakultas Keguruan & Ilmu Pendidikan" },
  3: { name: "FH",     label: "Fakultas Hukum" },
  4: { name: "FEB",    label: "Fakultas Ekonomi & Bisnis" },
  5: { name: "FIKES",  label: "Fakultas Ilmu Kesehatan" },
  6: { name: "FTS",    label: "Fakultas Teknik & Sains" },
};

const roleLabels = {
  admin:         { name: "Admin",        subtitle: "Sistem" },
  operator_data: { name: "Operator",     subtitle: "Data" },
  operator:      { name: "Operator",     subtitle: "Data" }, // 🔥 DITAMBAHKAN AGAR AMAN
  rektor:        { name: "Rektor",       subtitle: "Universitas" },
  wakil_rektor:  { name: "Wakil Rektor", subtitle: "Universitas" },
  dekan:         { name: "Dekan",        subtitle: null },
  wakil_dekan:   { name: "Wakil Dekan",  subtitle: null },
  tu_fakultas:   { name: "Tata Usaha",   subtitle: null },
  tu_rektorat:   { name: "Tata Usaha",   subtitle: "Rektorat" },
};

const ROLES_WITHOUT_NOTIF = ["admin"];

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const userRole = user?.role?.toLowerCase().trim() || "";
  const idUnit = user?.id_unit;

  const roleInfo = roleLabels[userRole] || { name: "User", subtitle: "Sistem" };
  const dynamicSubtitle = roleInfo.subtitle ?? unitMap[idUnit]?.name ?? "Fakultas";
  const currentRole = { name: roleInfo.name, subtitle: dynamicSubtitle };

  const showNotifIcon = !ROLES_WITHOUT_NOTIF.includes(userRole);

  const menuConfig = {
    admin: [
      { name: "Dashboard",       path: "/admin-dashboard" },
      { name: "Template",        path: "/template" },
      { name: "Data Mahasiswa",  path: "/data-mahasiswa" },
      { name: "Daftar Unit",     path: "/daftar-unit" },
      { name: "Daftar Pengguna", path: "/daftar-pengguna" },
    ],
    operator: [
      { name: "Dashboard",      path: "/operator-dashboard" },
      { name: "Manajemen Data", path: "/manajemen-data" },
      { name: "Pelaporan",      path: "/pelaporan" },
      { name: "Dokumen Valid",  path: "/dokumen-valid" },
    ],
    operator_data: [ // 🔥 DITAMBAHKAN AGAR MENU JUGA AMAN
      { name: "Dashboard",      path: "/operator-dashboard" },
      { name: "Manajemen Data", path: "/manajemen-data" },
      { name: "Pelaporan",      path: "/pelaporan" },
      { name: "Dokumen Valid",  path: "/dokumen-valid" },
    ],
    rektor: [
      { name: "Dashboard",      path: "/rektor-dashboard" },
      { name: "Manajemen Data", path: "/manajemen-data" },
      { name: "Pelaporan",      path: "/pelaporan" },
      { name: "Dokumen Valid",  path: "/dokumen-valid" },
    ],
    wakil_rektor: [
      { name: "Dashboard",      path: "/admin-dashboard" },
      { name: "Manajemen Data", path: "/manajemen-data" },
      { name: "Pelaporan",      path: "/pelaporan" },
    ],
    dekan: [
      { name: "Dashboard",      path: "/admin-dashboard" },
      { name: "Manajemen Data", path: "/manajemen-data" },
      { name: "Pelaporan",      path: "/pelaporan" },
    ],
    wakil_dekan: [
      { name: "Dashboard",      path: "/admin-dashboard" },
      { name: "Manajemen Data", path: "/manajemen-data" },
      { name: "Pelaporan",      path: "/pelaporan" },
    ],
    tu_fakultas: [
      { name: "Dashboard",      path: "/admin-dashboard" },
      { name: "Manajemen Data", path: "/manajemen-data" },
      { name: "Pelaporan",      path: "/pelaporan" },
    ],
    tu_rektorat: [
      { name: "Dashboard",      path: "/admin-dashboard" },
      { name: "Manajemen Data", path: "/manajemen-data" },
      { name: "Pelaporan",      path: "/pelaporan" },
    ],
  };

  const rawMenus = menuConfig[userRole] || [{ name: "Dashboard", path: "/admin-dashboard" }];

  const menus = rawMenus;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setOpenMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "text-[#0B4B48] border-b-2 border-[#0B4B48]"
        : "text-gray-500 hover:text-[#0B4B48]"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-[#0B4B48]/10 text-[#0B4B48] font-semibold"
        : "text-gray-600 hover:bg-gray-50 hover:text-[#0B4B48]"
    }`;

  return (
    <nav
      className={`w-full bg-white sticky top-0 z-50 border-b border-gray-100 transition-shadow duration-300 ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="px-4 md:px-8 py-3 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
          <div className="leading-tight">
            <div className="text-[#0B4B48] font-bold text-xs md:text-sm">Universitas</div>
            <div className="text-[#27AE60] font-bold text-xs md:text-sm">Ibn Khaldun Bogor</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-1 items-center">
          {menus.map((menu, idx) => (
            <NavLink key={idx} to={menu.path} className={linkClass}>
              {menu.name}
            </NavLink>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 md:gap-5">

          {/* NOTIFIKASI */}
          {showNotifIcon && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiBell size={20} className="text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-50">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                    Notifikasi
                  </h3>
                  <p className="text-xs text-gray-500 italic text-center py-2">
                    Tidak ada notifikasi baru.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          <div
            className="flex items-center gap-3 border-l pl-3 md:pl-4 cursor-pointer group"
            onClick={() => navigate("/profile")}
          >
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-gray-800 font-bold text-sm">{currentRole.name}</div>
              <div className="text-[10px] text-gray-500 font-medium tracking-wide">{currentRole.subtitle}</div>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-[#0B4B48] flex items-center justify-center text-[#0B4B48] bg-gray-50">
              <FiUser size={18} />
            </div>
          </div>

          {/* Hamburger */}
          <div className="md:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
            >
              {openMenu ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          openMenu ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-white space-y-1">
          {menus.map((menu, idx) => (
            <NavLink
              key={idx}
              to={menu.path}
              className={mobileLinkClass}
              onClick={() => setOpenMenu(false)}
            >
              {menu.name}
            </NavLink>
          ))}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#0B4B48] flex items-center justify-center text-[#0B4B48] bg-gray-50">
              <FiUser size={16} />
            </div>
            <div>
              <div className="text-gray-800 font-bold text-sm">{currentRole.name}</div>
              <div className="text-[10px] text-gray-500 font-medium tracking-wide">{currentRole.subtitle}</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;