"use client";

import { useEffect, useState } from "react";

/**
 * Tombol ganti tema.
 *
 * Default-nya TERANG untuk semua orang, tidak mengikuti setelan sistem —
 * supaya tampilan pertama yang dilihat HR selalu sama. Pilihan pengguna
 * disimpan di localStorage dan dipulihkan lewat skrip kecil di layout.tsx
 * yang jalan SEBELUM halaman digambar, jadi tidak ada kedipan tema.
 *
 * Ikonnya SVG, bukan karakter ☾/☀: karakter itu digambar oleh font
 * bawaan sistem, jadi bentuk dan tebalnya berbeda di tiap perangkat dan
 * tidak pernah cocok dengan garis tebal di sekitarnya.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // Sinkronkan state React dengan tema yang sudah dipasang skrip di <head>.
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Mode private / cookie diblokir. Temanya tetap berganti untuk
      // sesi ini, cuma tidak diingat. Tidak perlu memberi tahu pengguna.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label={dark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
      title={dark ? "Tema terang" : "Tema gelap"}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
          strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
          strokeWidth="2.4" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7z" />
        </svg>
      )}
    </button>
  );
}
