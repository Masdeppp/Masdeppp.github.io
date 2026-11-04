import type { NextConfig } from "next";

/* Situs di-deploy ke GitHub Pages sebagai file statis (folder out/).
   GitHub Pages tidak menjalankan server Node, jadi:
   - output "export"   → setiap halaman di-render jadi HTML saat build
   - trailingSlash     → /work jadi /work/index.html, yang selalu bisa dilayani Pages
   - images.unoptimized → optimasi gambar Next butuh server, tidak ada di Pages
   BASE_PATH hanya diisi kalau repo-nya BUKAN <username>.github.io
   (misalnya situs di github.io/web-cv → BASE_PATH=/web-cv). */
const basePath = process.env.BASE_PATH || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  experimental: { optimizePackageImports: [] },
};

export default nextConfig;
