"use client";

import { useEffect, useRef } from "react";

type Point = {
  x: number; y: number;       // posisi asal (0-1, relatif kanvas)
  cx: number; cy: number;     // posisi saat ini (piksel)
  vx: number; vy: number;     // kecepatan
  r: number;                  // radius
  phase: number;              // offset fase supaya tiap titik hanyut sendiri-sendiri
  speed: number;
  cluster: number;
};

/**
 * LATENT FIELD — set piece di hero.
 *
 * Titik-titik bertepi hitam yang MENGELOMPOK, persis seperti proyeksi
 * 2D ruang laten (t-SNE/UMAP) yang dipakai untuk melihat isi sebuah
 * model. Tiga kelompok, tiga wilayah kerja — dan warnanya sama dengan
 * warna domain di kartu proyek, jadi biru di sini dan biru di kartu
 * berarti hal yang sama.
 *
 * Jadi dekorasinya punya arti, bukan partikel acak yang bisa ditempel
 * di web mana pun.
 *
 * Tiap titik digambar dengan garis tepi hitam seperti semua elemen
 * lain di halaman ini. Itu yang membuatnya menyatu dengan sistemnya
 * alih-alih terlihat seperti latar belakang yang kebetulan menempel.
 *
 * Kenapa canvas dan bukan SVG: ratusan titik yang bergerak tiap frame
 * membuat SVG kewalahan karena tiap titik jadi node DOM. Canvas
 * menggambar semuanya dalam satu buffer.
 */
export function LatentField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let w = 0, h = 0, dpr = 1;
    let t = 0;
    const pointer = { x: -9999, y: -9999 };

    // Tiga cluster — mewakili tiga wilayah kerja. Urutannya menentukan
    // warna: 0 = machine learning (biru), 1 = web (magenta),
    // 2 = riset (ungu). ML diberi titik paling banyak karena memang
    // di situ bobot kerjanya.
    const CLUSTERS = [
      { x: 0.34, y: 0.30, n: 48 },
      { x: 0.70, y: 0.46, n: 34 },
      { x: 0.42, y: 0.70, n: 30 },
    ];

    /* Batas aman supaya tidak ada titik yang lahir di luar kanvas.
       Tanpa ini, sebaran gaussian ditambah hanyutnya bisa melempar
       sebagian titik ke luar tepi dan seluruh kelompok hilang dari
       pandangan tanpa jejak. */
    const clamp01 = (v: number) => Math.min(0.94, Math.max(0.06, v));

    /* Jumlah serbuk dan jarak sambungnya ikut lebar kanvas.
       Di layar sempit, jumlah yang sama membuat titik-titiknya
       berdesakan dan benang antar-titik berubah jadi diagram jaringan —
       persis kesan yang tidak diinginkan di sini. */
    let density = 1;
    let linkDist = 82;

    let points: Point[] = [];

    function build() {
      points = [];
      CLUSTERS.forEach((c, ci) => {
        const n = Math.max(12, Math.round(c.n * density));
        for (let i = 0; i < n; i++) {
          // Sebaran gaussian sederhana (Box-Muller) supaya kelompoknya
          // terlihat organik, bukan lingkaran rata.
          const u = Math.random() || 1e-6;
          const v = Math.random();
          const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
          const g2 = Math.sqrt(-2 * Math.log(u)) * Math.sin(2 * Math.PI * v);

          const x = clamp01(c.x + g * 0.07);
          const y = clamp01(c.y + g2 * 0.07);

          points.push({
            x, y,
            cx: x * w, cy: y * h,
            vx: 0, vy: 0,
            r: 3 + Math.random() * 4.5,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 0.9,
            cluster: ci,
          });
        }
      });
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      density = Math.min(1, Math.max(0.4, w / 1100));
      linkDist = Math.min(74, w * 0.07);
      build();
    }

    /** Ambil warna dari CSS token supaya ikut berubah saat mode terang/gelap. */
    function tokens() {
      const s = getComputedStyle(document.documentElement);
      const read = (name: string, fallback: string) =>
        s.getPropertyValue(name).trim() || fallback;
      return {
        ink: read("--ink", "#0d0d0f"),
        // Benang antar-titik memakai warna garis struktur, bukan tinta:
        // di mode gelap tinta tetap hitam dan benangnya akan lenyap.
        rule: read("--rule", "#0d0d0f"),
        // Urutannya mengikuti urutan cluster: ML, web, riset.
        fill: [
          read("--c-ml", "#2b6bff"),
          read("--c-web", "#ff2e88"),
          read("--c-research", "#7c3aed"),
        ],
      };
    }
    let color = tokens();

    function frame() {
      t += 0.006;
      ctx!.clearRect(0, 0, w, h);

      for (const p of points) {
        // Hanyut: titik targetnya sendiri yang bergeser pelan mengikuti
        // sinus, jadi gerakannya terasa dibawa angin — bukan bergetar
        // di tempat.
        const tx = (p.x + Math.sin(t * p.speed + p.phase) * 0.035) * w;
        const ty = (p.y + Math.cos(t * p.speed * 0.8 + p.phase) * 0.045) * h;

        // Gaya pegas menarik titik kembali ke targetnya.
        p.vx += (tx - p.cx) * 0.006;
        p.vy += (ty - p.cy) * 0.006;

        // Kursor mendorong serbuk menjauh — inilah bagian interaktifnya.
        const dx = p.cx - pointer.x;
        const dy = p.cy - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140 && d2 > 0.01) {
          const f = (1 - Math.sqrt(d2) / 140) * 1.7;
          p.vx += (dx / Math.sqrt(d2)) * f;
          p.vy += (dy / Math.sqrt(d2)) * f;
        }

        p.vx *= 0.94;   // redaman lebih ringan = melayang, bukan menyentak
        p.vy *= 0.94;
        p.cx += p.vx;
        p.cy += p.vy;
      }

      // Benang antar titik yang berdekatan DAN satu cluster. Membatasi
      // ke satu cluster membuat strukturnya terbaca sebagai kelompok,
      // bukan jaring acak.
      ctx!.lineWidth = 1.2;
      ctx!.strokeStyle = color.rule;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          if (a.cluster !== b.cluster) continue;
          const dx = a.cx - b.cx, dy = a.cy - b.cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > linkDist) continue;
          ctx!.globalAlpha = (1 - dist / linkDist) * 0.4;
          ctx!.beginPath();
          ctx!.moveTo(a.cx, a.cy);
          ctx!.lineTo(b.cx, b.cy);
          ctx!.stroke();
        }
      }

      // Titiknya: isi warna domain, tepi hitam tebal. Digambar setelah
      // benang supaya tepinya menutup ujung garis dengan rapi.
      ctx!.globalAlpha = 1;
      ctx!.lineWidth = 1.6;
      ctx!.strokeStyle = color.ink;
      for (const p of points) {
        ctx!.fillStyle = color.fill[p.cluster] ?? color.fill[0];
        ctx!.beginPath();
        ctx!.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.stroke();
      }

      raf = requestAnimationFrame(frame);
    }

    function onPointer(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    }
    function onLeave() { pointer.x = pointer.y = -9999; }
    function onTheme() { color = tokens(); }

    /* Tema diganti lewat atribut data-theme di <html>, bukan lewat
       preferensi sistem — jadi media query saja tidak cukup. Tanpa
       pengamat ini, warna serbuk baru ikut berubah setelah halaman
       dimuat ulang. */
    const themeObserver = new MutationObserver(onTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerleave", onLeave);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", onTheme);

    if (reduced) {
      // Gambar sekali, diam. Strukturnya tetap terlihat tanpa gerak.
      for (const p of points) { p.cx = p.x * w; p.cy = p.y * h; }
      frame();
      cancelAnimationFrame(raf);
      raf = 0;
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="latent-field"
      /* dekorasi murni — tidak ada informasi yang hilang bagi pembaca layar */
      aria-hidden="true"
    />
  );
}
