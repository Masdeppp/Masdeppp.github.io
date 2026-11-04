/**
 * Pemeriksa token CSS.
 *
 * Jalankan: npm run css:check
 *
 * Menemukan var(--token) yang dipakai di CSS tapi tidak pernah
 * didefinisikan di tokens.css. CSS tidak pernah error untuk kasus ini —
 * nilainya cuma jadi kosong diam-diam, dan warnanya hilang tanpa
 * pemberitahuan apa pun. Justru itu yang membuatnya berbahaya.
 *
 * Script ini dibuat setelah 4 token tertinggal saat palet dirombak.
 */

import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "src", "app");
const FILES = ["tokens.css", "globals.css", "components.css"];

// Token yang memang berasal dari luar tokens.css.
const EXTERNAL = new Set([
  "--font-display-loaded",
  "--font-body-loaded",
  "--font-mono-loaded",
  "--card-accent", // di-set per komponen lewat kelas .work-card--*
  "--card-bg",     // idem
  "--card-chip",   // idem — isi chip di dalam kartu
  "--card-sticker",// idem — isi stiker domain di pojok kartu
  "--band",        // di-set per kartu untuk pita warna
]);

const tokensCss = fs.readFileSync(path.join(DIR, "tokens.css"), "utf8");
const defined = new Set(
  [...tokensCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1])
);

const missing = new Map<string, Set<string>>();

for (const file of FILES) {
  const text = fs.readFileSync(path.join(DIR, file), "utf8");
  for (const m of text.matchAll(/var\((--[a-z0-9-]+)/g)) {
    const token = m[1];
    if (defined.has(token) || EXTERNAL.has(token)) continue;
    missing.set(token, (missing.get(token) ?? new Set()).add(file));
  }
}

if (missing.size === 0) {
  console.log(`\n  ✓ ${defined.size} token terdefinisi, semua referensi valid.\n`);
  process.exit(0);
}

console.log(`\n  ${missing.size} token dipakai tapi tidak terdefinisi:\n`);
for (const [token, files] of [...missing].sort()) {
  console.log(`    ${token.padEnd(22)} → ${[...files].sort().join(", ")}`);
}
console.log("\n  Perbaiki di src/app/tokens.css, atau ganti nama yang dipakai.\n");
process.exit(1);
