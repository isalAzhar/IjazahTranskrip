// src/components/ui/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../pages/context/AuthContext";
import logo from "../../assets/img/Logo.jpg";

// Mapping untuk verifikator berdasarkan role asli
const verifikatorPositionMap = {
  tu_fakultas:   { name: "Verifikator", subtitle: "TU Fakultas" },
  wakil_dekan:   { name: "Verifikator", subtitle: "Wakil Dekan 1" },
  dekan:         { name: "Verifikator", subtitle: "Dekan" },
  tu_rektorat:   { name: "Verifikator", subtitle: "TU Rektorat" },
  wakil_rektor:  { name: "Verifikator", subtitle: "Wakil Rektor 1" },
  rektor:        { name: "Verifikator", subtitle: "Rektor" },
};

// ROLE LABELS
const roleLabels = {
  admin_sistem:  { name: "Admin Sistem", subtitle: "Administrator" },
  operator:      { name: "Operator",     subtitle: "Data Entry" },
  verifikator:   { name: "Verifikator",  subtitle: "Verifikator" },
  rektor:        { name: "Rektor",       subtitle: "Universitas" },
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
    currentRoleInfo = roleLabels[userRole] || { name: "User", subtitle: "Sistem" };
  }

  const showNotifIcon = !ROLES_WITHOUT_NOTIF.includes(userRole);

  // MENU PER ROLE
  const menuConfig = {
    admin_sistem: [
      { name: "Dashboard",       path: "/admin/dashboard" },
      { name: "Template",        path: "/template" },
      { name: "Data Mahasiswa",  path: "/data-mahasiswa" },
      { name: "Daftar Unit",     path: "/daftar-unit" },
      { name: "Daftar Pengguna", path: "/daftar-pengguna" },
    ],
    operator: [
      { name: "Dashboard",       path: "/operator/dashboard" },
      { name: "Manajemen Data",  path: "/manajemen-data" },
      { name: "Pelaporan",       path: "/pelaporan" },
      { name: "Dokumen Valid",   path: "/dokumen-valid" },
    ],
    verifikator: [
      { name: "Dashboard",       path: "/verifikator/dashboard" },
      { name: "Manajemen Data",  path: "/manajemen-data" },
      { name: "Pelaporan",       path: "/pelaporan" },
    ],
    rektor: [
      { name: "Dashboard",       path: "/rektor/dashboard" },
      { name: "Manajemen Data",  path: "/manajemen-data" },
      { name: "Pelaporan",       path: "/pelaporan" },
      { name: "Dokumen Valid",   path: "/dokumen-valid" },
    ],
  };

  const activeMenus = menuConfig[userRole] || menuConfig.verifikator || [{ name: "Dashboard", path: "/verifikator/dashboard" }];

  // Cek apakah route aktif
  const isRouteActive = (path) => {
    if (path === "/data-mahasiswa") {
      const activePaths = ["/data-mahasiswa", "/detail-batch", "/detail-mahasiswa"];
      return activePaths.some(activePath => location.pathname.startsWith(activePath));
    }
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
    return `text-lg font-semibold transition-colors ${isActive ? "text-[#27AE60]" : "text-gray-700"}`;
  };

  // Mendapatkan dashboard path untuk logo
  const getDashboardPath = () => {
    switch (userRole) {
      case "admin_sistem": return "/admin/dashboard";
      case "operator": return "/operator/dashboard";
      case "verifikator": return "/verifikator/dashboard";
      case "rektor": return "/rektor/dashboard";
      default: return "/dashboard";
    }
  };

  // Ambil inisial dari nama untuk avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
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
            <NavLink key={idx} to={menu.path} className={linkClass(menu.path)}>
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
                {currentRoleInfo.subtitle && currentRoleInfo.subtitle !== "Administrator" && (
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
              className={mobileLinkClass(menu.path)}
              onClick={() => setOpenMenu(false)}
            >
              {menu.name}
            </NavLink>
          ))}
          <hr className="my-4 border-gray-200" />
          <div
            className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => {
              handleProfileClick();
              setOpenMenu(false);
            }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#27AE60] flex items-center justify-center text-[#27AE60] bg-gray-50">
              <FiUser size={14} />
            </div>
            <div>
              <div className="text-gray-800 font-bold text-sm capitalize">{userName}</div>
              <div className="text-[10px] text-gray-500 font-medium tracking-wide">
                {currentRoleInfo.name}
                {currentRoleInfo.subtitle && currentRoleInfo.subtitle !== "Administrator" && (
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