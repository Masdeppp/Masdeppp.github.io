# Web CV — Deva Athaya Aryaputra

Portfolio pribadi. Next.js 15 (App Router) + TypeScript + Tailwind v4.

## Menjalankan

```bash
npm install
npm run dev
```

## Struktur

```
content/          Semua konten. Edit di sini, bukan di komponen.
src/lib/schema.ts Skema Zod — build gagal kalau konten tidak valid.
src/lib/content.ts Content layer. SATU-SATUNYA pintu antara data dan UI.
src/app/tokens.css Design token. Tidak ada warna/ukuran mentah di komponen.
```

## Aturan yang dijaga

1. Komponen tidak pernah membaca file JSON langsung — selalu lewat `lib/content.ts`.
2. Komponen tidak pernah menulis nilai warna atau ukuran mentah — selalu lewat token.
3. Konten yang tidak lolos skema membuat build gagal, bukan membuat web rusak diam-diam.

## Menambah konten

- Proyek baru: buat `content/work/<slug>.mdx`, salin dari `_TEMPLATE.mdx`
- Pencapaian: tambahkan ke `content/achievements.json`
- Sedang dikerjakan: perbarui `content/now.json` (maksimal 4 item)
