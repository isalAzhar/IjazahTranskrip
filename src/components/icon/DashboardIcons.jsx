import React from "react";

export const Icons = {

  // ===============================
  // DASHBOARD STATS ICON
  // ===============================
  // Icon Badge / Medali — untuk "Jumlah Ijazah Terbit"
  Badge: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      <polygon points="12 4 13.3 6.5 16 6.9 14 8.9 14.5 11.6 12 10.3 9.5 11.6 10 8.9 8 6.9 10.7 6.5 12 4" />
    </svg>
  ),

  // Icon Check / Centang — untuk "Ijazah Diproses / Selesai"
  Check: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16719E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),

  // Icon Close / X — untuk "Ijazah Ditolak (Reject)"
  Close: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="10" y1="13" x2="14" y2="17" />
      <line x1="14" y1="13" x2="10" y2="17" />
    </svg>
  ),

  // Icon List + X — untuk "Ijazah Revoke / Dicabut"
  List: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="12" y2="18" />
      <circle cx="18" cy="18" r="4.5" fill="#F59E0B" stroke="none" />
      <line x1="16.5" y1="16.5" x2="19.5" y2="19.5" stroke="white" />
      <line x1="19.5" y1="16.5" x2="16.5" y2="19.5" stroke="white" />
    </svg>
  ),

  // ===============================
  // UI / COMPONENT ICON
  // ===============================

  // Icon Dropdown Arrow — untuk select / filter dropdown
  DropdownArrow: (
    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
    </svg>
  ),

  // Icon Document Detail — untuk tombol "Detail" di tabel
  Detail: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <circle cx="10" cy="17" r="1"/>
      <line x1="14" y1="17" x2="16" y2="17"/>
    </svg>
  ),

};