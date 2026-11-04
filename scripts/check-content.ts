/**
 * Pengecek kesiapan konten.
 *
 * Jalankan: npm run content:check
 *
 * Zod menjaga BENTUK data — kalau field wajib hilang atau formatnya salah,
 * build gagal. Tapi Zod tidak tahu bahwa string "TODO — isi nanti" itu
 * placeholder; baginya itu string yang sah.
 *
 * Script ini menutup celah tersebut: dia menyisir seluruh konten dan
 * melaporkan setiap TODO yang tersisa, supaya tidak ada placeholder yang
 * ikut ter-deploy ke web publik.
 */

import fs from "node:fs";
import path from "node:path";

const CONTENT = path.join(process.cwd(), "content");
const MARKERS = /TODO|FIXME|GANTI TOTAL|\(judul\)/i;

type Finding = { file: string; where: string; text: string };
const findings: Finding[] = [];

/** Telusuri objek/array JSON secara rekursif, catat setiap nilai ber-TODO. */
function walk(node: unknown, file: string, trail: string[] = []) {
  if (typeof node === "string") {
    if (MARKERS.test(node)) {
      findings.push({
        file,
        where: trail.join(".") || "(root)",
        text: node.length > 88 ? node.slice(0, 88) + "…" : node,
      });
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, file, [...trail, String(i)]));
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("_")) continue; // key diagnostik memang berisi panduan
      walk(v, file, [...trail, k]);
    }
  }
}

for (const file of fs.readdirSync(CONTENT).filter((f) => f.endsWith(".json"))) {
  walk(JSON.parse(fs.readFileSync(path.join(CONTENT, file), "utf8")), file);
}

const workDir = path.join(CONTENT, "work");
if (fs.existsSync(workDir)) {
  for (const file of fs
    .readdirSync(workDir)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))) {
    const lines = fs.readFileSync(path.join(workDir, file), "utf8").split("\n");
    lines.forEach((line, i) => {
      if (MARKERS.test(line)) {
        findings.push({
          file: `work/${file}`,
          where: `baris ${i + 1}`,
          text: line.trim().slice(0, 88),
        });
      }
    });
  }
}

/* ---------------------------------------------------------------- */

if (findings.length === 0) {
  console.log("\n  ✓ Tidak ada TODO tersisa. Konten siap di-deploy.\n");
  process.exit(0);
}

const byFile = new Map<string, Finding[]>();
for (const f of findings) {
  byFile.set(f.file, [...(byFile.get(f.file) ?? []), f]);
}

console.log(`\n  ${findings.length} TODO tersisa di ${byFile.size} file:\n`);

// File dengan TODO paling banyak ditampilkan lebih dulu — itu yang
// paling menghambat.
const sorted = [...byFile.entries()].sort((a, b) => b[1].length - a[1].length);

for (const [file, items] of sorted) {
  console.log(`  ${file}  (${items.length})`);
  for (const it of items.slice(0, 6)) {
    console.log(`    ${it.where.padEnd(26)} ${it.text}`);
  }
  if (items.length > 6) console.log(`    … dan ${items.length - 6} lagi`);
  console.log("");
}

console.log("  Ini peringatan, bukan error — dev server tetap jalan.");
console.log("  Tapi kosongkan semuanya sebelum deploy ke domain publik.\n");
