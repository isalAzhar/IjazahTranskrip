// src/components/ui/Navbar.jsx

import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../pages/context/AuthContext";
import logo from "../../assets/img/Logo.jpg";

// Unit/Fakultas Mapping
const unitMap = {
  1: { name: "FAI",     label: "Fakultas Agama Islam" },
  2: { name: "FKIP",    label: "Fakultas Keguruan & Ilmu Pendidikan" },
  3: { name: "FH",      label: "Fakultas Hukum" },
  4: { name: "FEB",     label: "Fakultas Ekonomi & Bisnis" },
  5: { name: "FIKES",   label: "Fakultas Ilmu Kesehatan" },
  6: { name: "FTS",     label: "Fakultas Teknik & Sains" },
};

// Role Labels dengan dukungan unit/fakultas
const roleLabels = {
  admin_sistem:  { name: "Admin Sistem", subtitle: "Administrator", hasUnit: false },
  operator:      { name: "Operator",     subtitle: "Data Entry", hasUnit: false },
  verifikator:   { name: "Verifikator",  subtitle: "Verifikator", hasUnit: false },
  rektor:        { name: "Rektor",       subtitle: "Universitas", hasUnit: false },
  // Role tambahan untuk fakultas
  dekan:         { name: "Dekan",        subtitle: null, hasUnit: true },
  wakil_dekan:   { name: "Wakil Dekan",  subtitle: null, hasUnit: true },
  tu_fakultas:   { name: "Tata Usaha",   subtitle: "Fakultas", hasUnit: true },
  wakil_rektor:  { name: "Wakil Rektor", subtitle: "Universitas", hasUnit: false },
  tu_rektorat:   { name: "Tata Usaha",   subtitle: "Rektorat", hasUnit: false },
};

// Mapping verifikator berdasarkan role asli
const verifikatorPositionMap = {
  tu_fakultas:   { name: "Verifikator", subtitle: "TU Fakultas" },
  wakil_dekan:   { name: "Verifikator", subtitle: "Wakil Dekan 1" },
  dekan:         { name: "Verifikator", subtitle: "Dekan" },
  tu_rektorat:   { name: "Verifikator", subtitle: "TU Rektorat" },
  wakil_rektor:  { name: "Verifikator", subtitle: "Wakil Rektor 1" },
  rektor:        { name: "Verifikator", subtitle: "Rektor" },
};

// Role yang tidak menampilkan notifikasi
const ROLES_WITHOUT_NOTIF = ["admin_sistem"];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const userRole = user?.role?.toLowerCase().trim() || "";
  const userOriginalRole = user?.original_role || user?.role || userRole;
  const userName = user?.name || user?.fullname || user?.username || "User";
  const idUnit = user?.id_unit;

  // Fungsi untuk mendapatkan nama unit/fakultas
  const getUnitName = () => {
    if (idUnit && unitMap[idUnit]) {
      return unitMap[idUnit].name;
    }
    return null;
  };

  // Fungsi untuk mendapatkan label verifikator berdasarkan role asli
  const getVerifikatorLabel = () => {
    if (userOriginalRole && verifikatorPositionMap[userOriginalRole]) {
      return verifikatorPositionMap[userOriginalRole];
    }
    
    const email = user?.email || "";
    if (email.includes("tu_fakultas")) return { name: "Verifikator", subtitle: "TU Fakultas" };
    if (email.includes("wakil_dekan")) return { name: "Verifikator", subtitle: "Wakil Dekan 1" };
    if (email.includes("dekan")) return { name: "Verifikator", subtitle: "Dekan" };
    if (email.includes("tu_rektorat")) return { name: "Verifikator", subtitle: "TU Rektorat" };
    if (email.includes("wakil_rektor")) return { name: "Verifikator", subtitle: "Wakil Rektor 1" };
    if (email.includes("rektor") && userRole !== "rektor") return { name: "Verifikator", subtitle: "Rektor" };
    
    return roleLabels.verifikator;
  };

  // Tentukan role info yang akan ditampilkan
  let currentRoleInfo;
  if (userRole === "verifikator") {
    currentRoleInfo = getVerifikatorLabel();
  } else {
    const roleConfig = roleLabels[userRole] || { name: "User", subtitle: "Sistem", hasUnit: false };
    currentRoleInfo = { ...roleConfig };
    
    // Jika role memiliki unit (dekan, wakil_dekan, tu_fakultas), tambahkan nama unit
    if (roleConfig.hasUnit && getUnitName()) {
      currentRoleInfo.subtitle = getUnitName();
    }
  }

  const showNotifIcon = !ROLES_WITHOUT_NOTIF.includes(userRole);

  // MENU PER ROLE - Disesuaikan dengan route yang diminta
  const menuConfig = {
    admin_sistem: [
      { name: "Dashboard",       path: "/admin/dashboard" },
      { name: "Template",        path: "/admin/template" },
      { name: "Daftar Batch",    path: "/admin/data-mahasiswa" },
      { name: "Daftar Unit",     path: "/admin/daftar-unit" },
      { name: "Daftar Pengguna", path: "/admin/daftar-pengguna" },
    ],
    operator: [
      { name: "Dashboard",      path: "/operator/dashboard" },
      { name: "Upload Data", path: "/operator/upload-data" },
      { name: "Pelaporan",      path: "/operator/pelaporan" },
      { name: "Dokumen Valid",  path: "/operator/dokumen-valid" },
    ],
    verifikator: [
      { name: "Dashboard",      path: "/verifikator/dashboard" },
      { name: "Manajemen Data", path: "/verifikator/manajemen-data" },
      { name: "Pelaporan",      path: "/verifikator/pelaporan" },
    ],
    rektor: [
      { name: "Dashboard",      path: "/rektor/dashboard" },
      { name: "Manajemen Data", path: "/rektor/manajemen-data" },
      { name: "Pelaporan",      path: "/rektor/pelaporan" },
      { name: "Dokumen Valid",  path: "/rektor/dokumen-valid" },
    ],
    // Role fakultas (dekan, wakil_dekan, tu_fakultas) - akses ke admin routes
    dekan: [
      { name: "Dashboard",       path: "/admin/dashboard" },
      { name: "Daftar Batch",    path: "/admin/data-mahasiswa" },
      { name: "Pelaporan",       path: "/pelaporan" },
    ],
    wakil_dekan: [
      { name: "Dashboard",       path: "/admin/dashboard" },
      { name: "Daftar Batch",    path: "/admin/data-mahasiswa" },
      { name: "Pelaporan",       path: "/pelaporan" },
    ],
    tu_fakultas: [
      { name: "Dashboard",       path: "/admin/dashboard" },
      { name: "Daftar Batch",    path: "/admin/data-mahasiswa" },
      { name: "Pelaporan",       path: "/pelaporan" },
    ],
    wakil_rektor: [
      { name: "Dashboard",       path: "/admin/dashboard" },
      { name: "Daftar Batch",    path: "/admin/data-mahasiswa" },
      { name: "Pelaporan",       path: "/pelaporan" },
    ],
    tu_rektorat: [
      { name: "Dashboard",       path: "/admin/dashboard" },
      { name: "Daftar Batch",    path: "/admin/data-mahasiswa" },
      { name: "Pelaporan",       path: "/pelaporan" },
    ],
  };

  const activeMenus = menuConfig[userRole] || menuConfig.operator || [{ name: "Dashboard", path: "/dashboard" }];

  // Cek apakah route aktif (untuk nested routes)
// Cek apakah route aktif (untuk nested routes)
const isRouteActive = (path) => {
  // Untuk admin data mahasiswa (daftar batch)
  if (path === "/admin/data-mahasiswa") {
    const activePaths = ["/admin/data-mahasiswa", "/admin/detail-batch", "/admin/detail-mahasiswa"];
    return activePaths.some(activePath => location.pathname.startsWith(activePath));
  }
  
  // Untuk operator - manajemen data (HANYA untuk route /operator/manajemen-data)
  if (path === "/operator/manajemen-data") {
    // HANYA aktif jika persis di /operator/manajemen-data
    return location.pathname === "/operator/manajemen-data";
  }
  
  // Untuk operator - dokumen valid (DetailMahasiswaOperator)
  if (path === "/operator/detail-mahasiswa") {
    // Aktif jika di /operator/detail-mahasiswa (tanpa parameter) atau dengan parameter NIM
    return location.pathname.startsWith("/operator/detail-mahasiswa");
  }
  
  // Untuk operator - pelaporan
  if (path === "/operator/pelaporan") {
    return location.pathname === "/operator/pelaporan";
  }
  
  // Untuk operator - dashboard
  if (path === "/operator/dashboard") {
    return location.pathname === "/operator/dashboard";
  }
  
  // Untuk verifikator
  if (path === "/verifikator/manajemen-data") {
    return location.pathname === "/verifikator/manajemen-data";
  }
  if (path === "/verifikator/pelaporan") {
    return location.pathname === "/verifikator/pelaporan";
  }
  
  // Untuk rektor
  if (path === "/rektor/manajemen-data") {
    return location.pathname === "/rektor/manajemen-data";
  }
  if (path === "/rektor/pelaporan") {
    return location.pathname === "/rektor/pelaporan";
  }
  if (path === "/rektor/dokumen-valid") {
    return location.pathname === "/rektor/dokumen-valid";
  }
  
  // Cocokkan persis untuk route lainnya
  return location.pathname === path;
};

  // Handle navigasi profile berdasarkan role
  const handleProfileClick = () => {
    switch (userRole) {
      case "admin_sistem":
        navigate("/admin/profile");
        break;
      case "operator":
        navigate("/operator/profile");
        break;
      case "verifikator":
        navigate("/verifikator/profile");
        break;
      case "rektor":
        navigate("/rektor/profile");
        break;
      default:
        navigate("/profile");
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setOpenMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Style untuk link desktop
  const linkClass = (path) => {
    const isActive = isRouteActive(path);
    return `px-4 py-2 text-sm font-medium transition-all duration-300 relative
      ${isActive ? "text-[#27AE60]" : "text-gray-500 hover:text-[#27AE60]"}
      ${isActive ? "after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[0.5px] after:bg-[#27AE60]" : ""}`;
  };

  // Style untuk link mobile
  const mobileLinkClass = (path) => {
    const isActive = isRouteActive(path);
    return `block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-[#27AE60]/10 text-[#27AE60] font-semibold"
        : "text-gray-600 hover:bg-gray-50 hover:text-[#27AE60]"
    }`;
  };

  // Mendapatkan dashboard path untuk logo
  const getDashboardPath = () => {
    switch (userRole) {
      case "admin_sistem": return "/admin/dashboard";
      case "operator": return "/operator/dashboard";
      case "verifikator": return "/verifikator/dashboard";
      case "rektor": return "/rektor/dashboard";
      default: return "/admin/dashboard";
    }
  };

  return (
    <nav
      className={`w-full bg-white sticky top-0 z-50 border-b border-gray-100 transition-shadow duration-300 ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="px-4 md:px-8 py-3 flex items-center justify-between">

        {/* Logo */}
        <NavLink 
          to={getDashboardPath()} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img 
            src={logo} 
            alt="Logo UIKA" 
            className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform group-hover:scale-105" 
          />
          <div className="leading-tight hidden sm:block">
            <div className="text-black font-semibold text-xs md:text-sm">Universitas</div>
            <div className="text-[#27AE60] font-bold text-xs md:text-sm">Ibn Khaldun Bogor</div>
          </div>
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-4 lg:gap-8">
          {activeMenus.map((menu, idx) => (
            <NavLink key={idx} to={menu.path} className={() => linkClass(menu.path)}>
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
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#27AE60]"
                aria-label="Notifikasi"
              >
                <FiBell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
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
            onClick={handleProfileClick}
          >
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-gray-800 font-bold text-sm capitalize">{userName}</div>
              <div className="text-[10px] text-gray-500 font-medium tracking-wide">
                {currentRoleInfo.name}
                {currentRoleInfo.subtitle && (
                  <span className="text-gray-400"> - {currentRoleInfo.subtitle}</span>
                )}
              </div>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-[#27AE60] flex items-center justify-center text-[#27AE60] bg-gray-50 group-hover:bg-[#27AE60] group-hover:text-white transition-all duration-300">
              <FiUser size={18} />
            </div>
          </div>

          {/* Hamburger */}
          <div className="md:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-[#27AE60]"
              aria-label="Menu"
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
          {activeMenus.map((menu, idx) => (
            <NavLink
              key={idx}
              to={menu.path}
              className={() => mobileLinkClass(menu.path)}
              onClick={() => setOpenMenu(false)}
            >
              {menu.name}
            </NavLink>
          ))}
          
          {/* Profile di Mobile Menu */}
          <div 
            className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => {
              handleProfileClick();
              setOpenMenu(false);
            }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#27AE60] flex items-center justify-center text-[#27AE60] bg-gray-50">
              <FiUser size={16} />
            </div>
            <div>
              <div className="text-gray-800 font-bold text-sm capitalize">{userName}</div>
              <div className="text-[10px] text-gray-500 font-medium tracking-wide">
                {currentRoleInfo.name}
                {currentRoleInfo.subtitle && (
                  <span className="text-gray-400"> - {currentRoleInfo.subtitle}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;