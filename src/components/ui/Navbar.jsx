import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../pages/context/AuthContext";
import logo from "../../assets/img/Logo.jpg";

// Role-role level rektorat/universitas — tidak perlu tampilkan sub-label fakultas
const UNIVERSITY_ROLES = [
  "rektor",
  "wakil_rektor_1",
  "tu_rektorat",
  "admin",
  "admin_sistem",
];

// Mapping role DB → label tampilan yang rapi
const roleDisplayMap = {
  // Admin
  admin:          "Admin Sistem",
  admin_sistem:   "Admin Sistem",
  // Operator
  operator:       "Operator",
  operator_data:  "Operator Data",
  // Tingkat Fakultas
  tu_fakultas:    "Tata Usaha Fakultas",
  wakil_dekan_1:  "Wakil Dekan",
  dekan:          "Dekan",
  // Tingkat Rektorat
  tu_rektorat:    "Tata Usaha Rektorat",
  wakil_rektor_1: "Wakil Rektor",
  rektor:         "Rektor",
};

const ROLES_WITHOUT_NOTIF = ["admin", "admin_sistem"];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // 🔥 Semua data berasal dari AuthContext

  const [openMenu, setOpenMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // ==========================================
  // EKSTRAKSI DATA USER (TanPA HIT API)
  // ==========================================
  const userRole = user?.role?.toLowerCase().trim() || "";
  const fallbackName = user?.email ? user.email.split("@")[0] : "User";
  const userName = user?.name || user?.fullname || user?.username || fallbackName;

  const currentRoleName = roleDisplayMap[userRole] || "User";
  const isUniversityRole = UNIVERSITY_ROLES.includes(userRole);

  // 🔥 Mengambil Nama Unit (Fakultas) langsung dari Payload User
  // Cek property apa yang dikirim backend (nama_unit, unit, fakultas, dll)
  const unitName = isUniversityRole 
    ? null 
    : (user?.nama_unit || user?.unit || user?.fakultas || user?.department || null);

  const showNotifIcon = !ROLES_WITHOUT_NOTIF.includes(userRole);

  // KONFIGURASI MENU
  const adminMenu = [
    { name: "Dashboard",       path: "/admin/dashboard" },
    { name: "Template",        path: "/admin/template" },
    { name: "Daftar Batch",    path: "/admin/data-mahasiswa" },
    { name: "Daftar Unit",     path: "/admin/daftar-unit" },
    { name: "Daftar Pengguna", path: "/admin/daftar-pengguna" },
  ];

  const operatorMenu = [
    { name: "Dashboard",     path: "/operator/dashboard" },
    { name: "Upload Data",   path: "/operator/upload-data" },
    { name: "Pelaporan",     path: "/operator/pelaporan" },
    { name: "Dokumen Valid", path: "/operator/dokumen-valid" },
  ];

  const verifikatorMenu = [
    { name: "Dashboard",      path: "/verifikator/dashboard" },
    { name: "Manajemen Data", path: "/verifikator/daftar-batch" },
    { name: "Pelaporan",      path: "/verifikator/pelaporan" },
  ];

  const rektorMenu = [
    { name: "Dashboard",      path: "/rektor/dashboard" },
    { name: "Manajemen Data", path: "/rektor/daftar-batch" },
    { name: "Pelaporan",      path: "/rektor/pelaporan" },
    { name: "Dokumen Valid",  path: "/rektor/dokumen-valid" },
  ];

  const menuConfig = {
    admin:          adminMenu,
    admin_sistem:   adminMenu,
    operator:       operatorMenu,
    operator_data:  operatorMenu,
    rektor:         rektorMenu,
    // Semua role verifikator (fakultas & rektorat) pakai menu yang sama
    tu_fakultas:    verifikatorMenu,
    wakil_dekan_1:  verifikatorMenu,
    dekan:          verifikatorMenu,
    tu_rektorat:    verifikatorMenu,
    wakil_rektor_1: verifikatorMenu,
  };

  const activeMenus = menuConfig[userRole] || verifikatorMenu;

  const isRouteActive = (path) => {
    if (path === "/admin/data-mahasiswa" && location.pathname.startsWith("/admin/data-mahasiswa")) return true;
    if (path === "/operator/detail-mahasiswa" && location.pathname.startsWith("/operator/detail-mahasiswa")) return true;
    return location.pathname === path;
  };

  const handleProfileClick = () => {
    switch (userRole) {
      case "admin":
      case "admin_sistem": return navigate("/admin/profile");
      case "operator":
      case "operator_data": return navigate("/operator/profile");
      case "rektor": return navigate("/rektor/profile");
      default: return navigate("/verifikator/profile");
    }
  };

  const getDashboardPath = () => {
    switch (userRole) {
      case "admin":
      case "admin_sistem": return "/admin/dashboard";
      case "operator":
      case "operator_data": return "/operator/dashboard";
      case "rektor": return "/rektor/dashboard";
      default: return "/verifikator/dashboard";
    }
  };

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

  const linkClass = (path) => {
    const isActive = isRouteActive(path);
    return `px-4 py-2 text-sm font-medium transition-all duration-300 relative
      ${isActive ? "text-[#27AE60]" : "text-gray-500 hover:text-[#27AE60]"}
      ${isActive ? "after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[0.5px] after:bg-[#27AE60]" : ""}`;
  };

  const mobileLinkClass = (path) => {
    const isActive = isRouteActive(path);
    return `block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
      isActive ? "bg-[#27AE60]/10 text-[#27AE60] font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-[#27AE60]"
    }`;
  };

  // Label profil: "Wakil Rektor" atau "Dekan - Fakultas Teknik dan Sains"
  const ProfileSubtitle = () => (
    <div className="text-[10px] text-gray-500 font-medium tracking-wide">
      {currentRoleName}
      {unitName && <span className="text-gray-400"> - {unitName}</span>}
    </div>
  );

  return (
    <nav className={`w-full bg-white sticky top-0 z-50 border-b border-gray-100 transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
      <div className="px-4 md:px-8 py-3 flex items-center justify-between">

        {/* Logo */}
        <NavLink to={getDashboardPath()} className="flex items-center gap-3 cursor-pointer group">
          <img src={logo} alt="Logo UIKA" className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform group-hover:scale-105" />
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
          {showNotifIcon && (
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#27AE60]">
                <FiBell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-50">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Notifikasi</h3>
                  <p className="text-xs text-gray-500 italic text-center py-2">Tidak ada notifikasi baru.</p>
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          <div className="flex items-center gap-3 border-l pl-3 md:pl-4 cursor-pointer group" onClick={handleProfileClick}>
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-gray-800 font-bold text-sm capitalize">{userName}</div>
              <ProfileSubtitle />
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-[#27AE60] flex items-center justify-center text-[#27AE60] bg-gray-50 group-hover:bg-[#27AE60] group-hover:text-white transition-all duration-300">
              <FiUser size={18} />
            </div>
          </div>

          {/* Hamburger */}
          <div className="md:hidden" ref={mobileMenuRef}>
            <button onClick={() => setOpenMenu(!openMenu)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-[#27AE60]">
              {openMenu ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${openMenu ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-white space-y-1">
          {activeMenus.map((menu, idx) => (
            <NavLink key={idx} to={menu.path} className={() => mobileLinkClass(menu.path)} onClick={() => setOpenMenu(false)}>
              {menu.name}
            </NavLink>
          ))}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => { handleProfileClick(); setOpenMenu(false); }}>
            <div className="w-8 h-8 rounded-full border-2 border-[#27AE60] flex items-center justify-center text-[#27AE60] bg-gray-50">
              <FiUser size={16} />
            </div>
            <div>
              <div className="text-gray-800 font-bold text-sm capitalize">{userName}</div>
              <ProfileSubtitle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;