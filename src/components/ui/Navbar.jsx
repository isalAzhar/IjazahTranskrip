import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../pages/context/AuthContext";
import logo from "../../assets/img/Logo.jpg";

const ROLES_WITHOUT_NOTIF = ["admin", "admin_sistem"];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [openMenu, setOpenMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // ==========================================
  // EKSTRAKSI DATA USER
  // ==========================================
 const userRole = user?.role?.toLowerCase().trim() || "";
  const fallbackName = user?.email ? user.email.split("@")[0] : "User";
  
  // 🔥 TEKS ATAS: Paksa jadi "Admin" jika role-nya admin
  let displayTitle = user?.name || user?.fullname || user?.username || fallbackName;
  if (["admin", "admin_sistem"].includes(userRole)) {
    displayTitle = "Admin";
  }

  const showNotifIcon = !ROLES_WITHOUT_NOTIF.includes(userRole);

  // 🔥 TEKS BAWAH (SUB-BAB)
  let displaySubtitle = null;
  const rawUnitName = user?.nama_unit || user?.unit || user?.fakultas || user?.department || user?.prodi?.unit?.nama_unit || "";
  const cleanUnit = rawUnitName.replace(/^fakultas\s+/i, "").trim();

  if (["admin", "admin_sistem"].includes(userRole)) {
    displaySubtitle = "Sistem"; 
  } else if (["operator", "operator_data"].includes(userRole)) {
    displaySubtitle = "Data"; 
  } else if (["rektor"].includes(userRole)) {
    displaySubtitle = null; 
  } else if (["wakil_rektor_1", "wakil_rektor", "tu_rektorat"].includes(userRole)) {
    displaySubtitle = "Rektorat"; 
  } else if (["dekan", "wakil_dekan_1", "wakil_dekan", "tu_fakultas"].includes(userRole)) {
    displaySubtitle = cleanUnit ? `Fakultas ${cleanUnit}` : "Fakultas"; 
  } else {
    displaySubtitle = cleanUnit ? `Fakultas ${cleanUnit}` : userRole;
  }
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
    { name: "Daftar Batch",   path: "/verifikator/daftar-batch" },
    { name: "Pelaporan",      path: "/verifikator/pelaporan" },
  ];

  const rektorMenu = [
    { name: "Dashboard",      path: "/rektor/dashboard" },
    { name: "Daftar Batch",   path: "/rektor/daftar-batch" },
    { name: "Pelaporan",      path: "/rektor/pelaporan" },
    { name: "Dokumen Valid",  path: "/rektor/dokumen-valid" },
  ];

  const menuConfig = {
    admin:          adminMenu,
    admin_sistem:   adminMenu,
    operator:       operatorMenu,
    operator_data:  operatorMenu,
    rektor:         rektorMenu,          
    tu_rektorat:    verifikatorMenu,     
    wakil_rektor_1: verifikatorMenu,     
    tu_fakultas:    verifikatorMenu,
    wakil_dekan_1:  verifikatorMenu,
    dekan:          verifikatorMenu,
  };

  const activeMenus = menuConfig[userRole] || verifikatorMenu;

  const isRouteActive = (path) => {
    if (path === "/admin/data-mahasiswa" && location.pathname.startsWith("/admin/data-mahasiswa")) return true;
    if (path === "/operator/detail-mahasiswa" && location.pathname.startsWith("/operator/detail-mahasiswa")) return true;
    
    if (path.includes("/daftar-batch") && location.pathname.includes("/detail-batch")) return true;
    if (path.includes("/dokumen-valid") && location.pathname.includes("/detail-dokumen-valid")) return true;
    
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

  // 🔥 Komponen Subtitle: Hanya dirender kalau ada isinya (Kalau Rektor dia akan hilang 100%)
  const ProfileSubtitle = () => {
    if (!displaySubtitle) return null;
    return (
      <div className="text-[12px] text-gray-500 font-medium tracking-wide capitalize mt-0.5">
        {displaySubtitle}
      </div>
    );
  };

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
              {/* Teks Atas: Nama Asli dari DB */}
              <div className="text-gray-800 font-bold text-sm capitalize">{displayTitle}</div>
              {/* Teks Bawah: Mapping Sub-bab Cerdas */}
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
              <div className="text-gray-800 font-bold text-sm capitalize">{displayTitle}</div>
              <ProfileSubtitle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );  
};

export default Navbar;