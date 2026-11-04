"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveal — animasi masuk saat elemen tergulir ke layar.
 *
 * Pakai IntersectionObserver bawaan browser, BUKAN library animasi.
 * Satu file 50 baris ini menggantikan dependency ~50KB, dan kamu
 * bisa menjelaskan cara kerjanya kalau ditanya saat interview.
 *
 * DUA ARAH: elemen ikut menghilang lagi saat keluar layar, jadi
 * animasinya muncul lagi kalau digulir balik ke atas. Observer
 * sengaja TIDAK di-disconnect setelah kemunculan pertama.
 *
 * `delay` dipakai untuk stagger — item dalam satu daftar muncul
 * berurutan, bukan serempak. Itu yang membuat gerakannya terasa
 * disengaja, bukan efek tempelan.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Kalau pengguna minta gerak dikurangi, tampilkan langsung dan
    // jangan amati apa pun. Ini bukan opsional — sebagian orang
    // benar-benar pusing karena animasi.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => setShown(entry.isIntersecting),
      // rootMargin bawah negatif: animasi mulai setelah elemen
      // benar-benar masuk layar, bukan saat baru menyentuh tepinya.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal${shown ? " reveal--in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
