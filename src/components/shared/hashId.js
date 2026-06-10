// src/utils/hashId.js

/**
 * Menyandikan ID (Encoding) menjadi URL-Safe Base64
 * Dipakai saat MAU PINDAH halaman (di dalam fungsi navigate)
 */
export const encodeId = (id) => {
  if (!id) return "";
  // 1. Ubah jadi string dan encode pakai Base64 (btoa)
  // 2. Ganti karakter yang bikin error URL (+, /, dan =)
  return btoa(String(id))
    .replace(/\+/g, "-")  
    .replace(/\//g, "_")  
    .replace(/=+$/, "");  
};

/**
 * Menerjemahkan kembali ID (Decoding) dari URL-Safe Base64 ke ID Asli
 * Dipakai saat BARU MASUK halaman (di useParams) sebelum nembak API
 */
export const decodeId = (encoded) => {
  if (!encoded) return null;
  try {
    // 1. Kembalikan karakter URL-Safe ke Base64 standar
    let base64 = encoded
      .replace(/-/g, "+")  
      .replace(/_/g, "/"); 
    
    // 2. Tambahkan kembali karakter padding '=' yang hilang
    while (base64.length % 4) {
      base64 += "=";
    }
    
    // 3. Decode kembali ke ID asli
    return atob(base64);
  } catch (error) {
    console.error("Gagal men-decode ID:", error);
    return null;
  }
};