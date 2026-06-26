import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../pages/context/AuthContext";
import logo from "../../assets/img/Logo.jpg";
import { getRejectRevokeNotifications } from "../../services/dashboard.api";
import { getAuthToken } from "../../services/auth.api";
const ROLES_WITH_NOTIF = [
  "operator",
  "operator_data",
  "tu_fakultas",
  "wakil_dekan_1",
  "wakil_dekan",
  "dekan",
  "tu_rektorat",
  "wakil_rektor_1",
  "wakil_rektor",
  "rektor",
];

const NOTIF_READ_KEY = "notif_read_ids";

const getReadIds = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_READ_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveReadIds = (ids) => {
  localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(ids));
};

const getCachedProfileUser = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

const saveCachedProfileUser = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const profileCacheKey = `navbar_profile_user_${
    user?.id_user || user?.id || user?.email || "guest"
  }`;

  const [openMenu, setOpenMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(getReadIds);
  const [profileUser, setProfileUser] = useState(() =>
    getCachedProfileUser(profileCacheKey),
  );
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const cachedProfile = getCachedProfileUser(profileCacheKey);
    if (cachedProfile) {
      setProfileUser(cachedProfile);
    }
  }, [profileCacheKey]);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setProfileUser(null);
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile/me", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json().catch(() => ({}));

        if (isMounted && response.ok && result?.data) {
          setProfileUser(result.data);
          saveCachedProfileUser(profileCacheKey, result.data);
        }
      } catch (error) {
        console.error("Gagal mengambil profile user:", error);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [profileCacheKey, user?.id_user, user?.id]);

  const activeUser = profileUser || user || {};

  const userRole = String(activeUser?.role || user?.role || "")
    .toLowerCase()
    .trim();

  const fallbackName =
    activeUser?.email || user?.email
      ? String(activeUser?.email || user?.email).split("@")[0]
      : "User";

  const formatRoleLabel = (role) => {
    const labels = {
      admin: "Admin",
      admin_sistem: "Admin",
      operator: "Operator",
      operator_data: "Operator",
      tu_fakultas: "TU Fakultas",
      wakil_dekan_1: "Wakil Dekan",
      wakil_dekan: "Wakil Dekan",
      dekan: "Dekan",
      tu_rektorat: "TU Rektorat",
      wakil_rektor_1: "Wakil Rektor",
      wakil_rektor: "Wakil Rektor",
      rektor: "Rektor",
    };

    return labels[role] || role || "-";
  };

  const getValidText = (value) => {
    const text = String(value || "").trim();
    return text && text !== "-" ? text : "";
  };

  const getNavbarName = () => {
    return (
      getValidText(activeUser?.nama) ||
      getValidText(activeUser?.name) ||
      getValidText(activeUser?.fullname) ||
      getValidText(activeUser?.username) ||
      fallbackName
    );
  };

  const isAdminOrOperatorRole = [
    "admin",
    "admin_sistem",
    "operator",
    "operator_data",
  ].includes(userRole);

  const displayTitle = isAdminOrOperatorRole
    ? formatRoleLabel(userRole)
    : getNavbarName();

  const displaySubtitle = isAdminOrOperatorRole
    ? ["admin", "admin_sistem"].includes(userRole)
      ? "Sistem"
      : "Data"
    : formatRoleLabel(userRole);

  const showNotifIcon = ROLES_WITH_NOTIF.includes(userRole);

  const adminMenu = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Template", path: "/admin/template" },
    { name: "Daftar Batch", path: "/admin/data-mahasiswa" },
    { name: "Dokumen Valid", path: "/admin/dokumen-valid-admin" },
    { name: "Daftar Unit", path: "/admin/daftar-unit" },
    { name: "Daftar Pengguna", path: "/admin/daftar-pengguna" },
  ];

  const operatorMenu = [
    { name: "Dashboard", path: "/operator/dashboard" },
    { name: "Upload Data", path: "/operator/upload-data" },
    { name: "Pelaporan", path: "/operator/pelaporan" },
    { name: "Dokumen Valid", path: "/operator/dokumen-valid" },
  ];

  const verifikatorMenu = [
    { name: "Dashboard", path: "/verifikator/dashboard" },
    { name: "Daftar Batch", path: "/verifikator/daftar-batch" },
    { name: "Pelaporan", path: "/verifikator/pelaporan" },
  ];

  const rektorMenu = [
    { name: "Dashboard", path: "/rektor/dashboard" },
    { name: "Daftar Batch", path: "/rektor/daftar-batch" },
    { name: "Pelaporan", path: "/rektor/pelaporan" },
    { name: "Dokumen Valid", path: "/rektor/dokumen-valid" },
  ];

  const menuConfig = {
    admin: adminMenu,
    admin_sistem: adminMenu,
    operator: operatorMenu,
    operator_data: operatorMenu,
    rektor: rektorMenu,
    tu_rektorat: verifikatorMenu,
    wakil_rektor_1: verifikatorMenu,
    tu_fakultas: verifikatorMenu,
    wakil_dekan_1: verifikatorMenu,
    dekan: verifikatorMenu,
  };

  const activeMenus = menuConfig[userRole] || verifikatorMenu;

  const unreadCount = notifications.filter(
    (n) => !readIds.includes(n.id_log),
  ).length;

  const isRouteActive = (path) => {
    if (
      path === "/admin/data-mahasiswa" &&
      location.pathname.startsWith("/admin/data-mahasiswa")
    )
      return true;
    if (
      path === "/operator/detail-mahasiswa" &&
      location.pathname.startsWith("/operator/detail-mahasiswa")
    )
      return true;
    if (
      path.includes("/daftar-batch") &&
      location.pathname.includes("/detail-batch")
    )
      return true;
    if (
      path.includes("/dokumen-valid") &&
      location.pathname.includes("/detail-dokumen-valid")
    )
      return true;
    return location.pathname === path;
  };

  const handleProfileClick = () => {
    switch (userRole) {
      case "admin":
      case "admin_sistem":
        return navigate("/admin/profile");
      case "operator":
      case "operator_data":
        return navigate("/operator/profile");
      case "rektor":
        return navigate("/rektor/profile");
      default:
        return navigate("/verifikator/profile");
    }
  };

  const getDashboardPath = () => {
    switch (userRole) {
      case "admin":
      case "admin_sistem":
        return "/admin/dashboard";
      case "operator":
      case "operator_data":
        return "/operator/dashboard";
      case "rektor":
        return "/rektor/dashboard";
      default:
        return "/verifikator/dashboard";
    }
  };

  const getNotificationTargetPath = () => {
    if (["operator", "operator_data"].includes(userRole))
      return "/operator/pelaporan";
    if (["rektor"].includes(userRole)) return "/rektor/pelaporan";
    if (
      [
        "tu_fakultas",
        "wakil_dekan_1",
        "wakil_dekan",
        "dekan",
        "tu_rektorat",
        "wakil_rektor_1",
        "wakil_rektor",
      ].includes(userRole)
    )
      return "/verifikator/pelaporan";
    return getDashboardPath();
  };

  const handleToggleNotif = () => {
    const next = !showNotif;
    setShowNotif(next);

    if (next && notifications.length > 0) {
      const allIds = notifications.map((n) => n.id_log);
      const merged = [...new Set([...readIds, ...allIds])];
      setReadIds(merged);
      saveReadIds(merged);
    }
  };

  const handleNotificationClick = () => {
    setShowNotif(false);
    navigate(getNotificationTargetPath());
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotif(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target))
        setOpenMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showNotifIcon) {
      setNotifications([]);
      return;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const data = await getRejectRevokeNotifications(5);
        if (isMounted) setNotifications(data);
      } catch (error) {
        if (isMounted) setNotifications([]);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showNotifIcon, userRole, user?.id_user]);

  const linkClass = (path) => {
    const isActive = isRouteActive(path);
    return `px-2 lg:px-4 py-2 text-sm font-medium transition-all duration-300 relative whitespace-nowrap
      ${isActive ? "text-[#0B6B63]" : "text-gray-500 hover:text-[#0B6B63]"}
      ${isActive ? "after:absolute after:left-0 after:-bottom-3 after:w-full after:h-[2px] after:bg-[#0B6B63]" : ""}`;
  };

  const mobileLinkClass = (path) => {
    const isActive = isRouteActive(path);
    return `block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-[#0B6B63]/10 text-[#0B6B63] font-semibold"
        : "text-gray-600 hover:bg-gray-50 hover:text-[#0B6B63]"
    }`;
  };

  const ProfileSubtitle = () => {
    if (!displaySubtitle) return null;
    return (
      <div className="text-[11px] sm:text-[12px] text-gray-500 font-medium tracking-wide capitalize mt-0.5 max-w-[80px] sm:max-w-[120px] truncate">
        {displaySubtitle}
      </div>
    );
  };

  return (
    <nav
      className={`w-full bg-white sticky top-0 z-50 border-b border-gray-100 transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}
    >
      <div className="px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-2">
        {/* Logo Section */}
        <NavLink
          to={getDashboardPath()}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 max-w-[60%] sm:max-w-none"
        >
          <img
            src={logo}
            alt="Logo UIKA"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-12 object-contain transition-transform group-hover:scale-105 shrink-0"
          />
          <div className="leading-tight flex flex-col justify-center min-w-0">
            <div className="text-black font-semibold text-[10px] sm:text-[11px] md:text-sm truncate">
              Universitas
            </div>
            <div className="text-[#0B6B63] font-bold text-[10px] sm:text-[11px] md:text-sm truncate">
              Ibn Khaldun Bogor
            </div>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 lg:gap-6">
          {activeMenus.map((menu, idx) => (
            <NavLink
              key={idx}
              to={menu.path}
              className={() => linkClass(menu.path)}
            >
              {menu.name}
            </NavLink>
          ))}
        </div>

        {/* Right Action Elements */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
          {/* Notifikasi Dropdown Panel */}
          {showNotifIcon && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleToggleNotif}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#0B6B63]"
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {showNotif && (
                // 🔥 SOLUSI FINAL ANTI KEPOTONG:
                // Di Mobile: Menggunakan fixed position, menempel aman dari kiri dan kanan layar (left-4 right-4).
                // Di Desktop (sm+): Kembali menggunakan absolute agar menempel rapi di bawah icon lonceng.
                <div className="fixed top-[64px] left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:w-[360px] md:w-[420px] sm:mt-3 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 sm:p-5 z-[100]">
                  <h3 className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">
                    Notifikasi Terbaru
                  </h3>

                  {notifications.length > 0 ? (
                    <>
                      <div className="space-y-2.5 sm:space-y-3 max-h-[60vh] sm:max-h-80 overflow-y-auto pr-1">
                        {notifications.map((notif) => {
                          const isRead = readIds.includes(notif.id_log);
                          return (
                            <div
                              key={notif.id_log}
                              className={`w-full text-left border rounded-xl p-3.5 sm:p-4 transition-colors ${
                                isRead
                                  ? "border-gray-50 bg-white"
                                  : "border-green-100 bg-green-50/70"
                              }`}
                            >
                              <div className="flex items-start gap-3 sm:gap-4">
                                <span
                                  className={`mt-0.5 flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold ${
                                    notif.type === "reject"
                                      ? "bg-red-50 text-red-600"
                                      : "bg-orange-50 text-orange-600"
                                  }`}
                                >
                                  {notif.type === "reject" ? "R" : "V"}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <p className="text-xs sm:text-[13px] font-bold text-gray-800 break-words leading-tight">
                                    {notif.title || "Aktivitas terbaru"}
                                  </p>
                                  <p className="text-[11px] sm:text-xs text-gray-600 mt-1.5 break-words leading-relaxed">
                                    {notif.message ||
                                      "Ada aktivitas reject/revoke terbaru."}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                    {notif.time_label} WIB
                                  </p>
                                </div>

                                {!isRead && (
                                  <span className="mt-1 w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full bg-[#0B6B63] shrink-0" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={handleNotificationClick}
                        className="mt-4 w-full py-2.5 sm:py-3 rounded-xl bg-[#0B6B63] hover:brightness-110 text-white text-[11px] sm:text-xs font-bold transition-all shadow-sm"
                      >
                        Lihat Semua Laporan
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <FiBell className="text-gray-300 text-xl" />
                      </div>
                      <p className="text-xs sm:text-[13px] text-gray-500 font-medium text-center">
                        Belum ada notifikasi
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 text-center mt-1">
                        Aktivitas reject/revoke akan muncul di sini.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Profile Controls */}
          <div
            className="flex items-center gap-2 border-l pl-2 sm:pl-3 md:pl-4 cursor-pointer group min-w-0"
            onClick={handleProfileClick}
          >
            <div className="text-right leading-tight hidden sm:block min-w-0">
              <div className="text-gray-800 font-bold text-sm capitalize max-w-[80px] sm:max-w-[120px] truncate">
                {displayTitle}
              </div>
              <ProfileSubtitle />
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border-2 border-[#0B6B63] flex items-center justify-center text-[#0B6B63] bg-gray-50 group-hover:bg-[#0B6B63] group-hover:text-white transition-all duration-300 shrink-0 shadow-sm">
              <FiUser size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
          </div>

          {/* Mobile Hamburger Menu Toggle Button */}
          <div className="md:hidden flex items-center" ref={mobileMenuRef}>
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-[#0B6B63]"
              aria-label="Toggle Menu"
            >
              {openMenu ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu Block */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${openMenu ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-white space-y-1 shadow-inner">
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

          <div
            className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => {
              handleProfileClick();
              setOpenMenu(false);
            }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#0B6B63] flex items-center justify-center text-[#0B6B63] bg-gray-50 shrink-0">
              <FiUser size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-gray-800 font-bold text-sm capitalize truncate max-w-[180px]">
                {displayTitle}
              </div>
              <ProfileSubtitle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
