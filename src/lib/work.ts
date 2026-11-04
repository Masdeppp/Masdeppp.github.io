import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { workFrontmatterSchema, type WorkFrontmatter } from "./schema";

/**
 * Pembaca case study dari content/work/*.mdx
 *
 * Sama seperti lib/content.ts: ini SATU-SATUNYA pintu antara file MDX dan UI.
 * Komponen tidak pernah membaca file MDX sendiri.
 */

const WORK_DIR = path.join(process.cwd(), "content", "work");

export type WorkEntry = {
  frontmatter: WorkFrontmatter;
  body: string;
};

/** File yang diawali "_" adalah template/arsip, bukan case study. */
function isCaseStudy(file: string) {
  return file.endsWith(".mdx") && !file.startsWith("_");
}

export function getAllWork(): WorkEntry[] {
  if (!fs.existsSync(WORK_DIR)) return [];

  const entries = fs
    .readdirSync(WORK_DIR)
    .filter(isCaseStudy)
    .map((file) => {
      const raw = fs.readFileSync(path.join(WORK_DIR, file), "utf8");
      const { data, content } = matter(raw);

      const parsed = workFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i) => `  • ${i.path.join(".") || "(root)"} — ${i.message}`)
          .join("\n");
        throw new Error(
          `[work] Frontmatter tidak valid di content/work/${file}\n${issues}`
        );
      }

      // Metrik yang nilainya kosong (atau masih TODO) tidak ditampilkan.
      // Lebih baik kartunya punya dua metrik terisi daripada tiga metrik
      // yang satu di antaranya kosong.
      const frontmatter = {
        ...parsed.data,
        metrics: parsed.data.metrics.filter(
          (m) => m.value.trim() !== "" && !/^TODO/i.test(m.value.trim())
        ),
      };

      return { frontmatter, body: content };
    });

  // Featured dulu, lalu urut berdasarkan `order`.
  return entries.sort((a, b) => {
    if (a.frontmatter.featured !== b.frontmatter.featured) {
      return a.frontmatter.featured ? -1 : 1;
    }
    return a.frontmatter.order - b.frontmatter.order;
  });
}

export function getWorkBySlug(slug: string): WorkEntry | undefined {
  return getAllWork().find((w) => w.frontmatter.slug === slug);
}

export const getFeaturedWork = () =>
  getAllWork().filter((w) => w.frontmatter.featured);

/**
 * Case study sesudahnya, berputar — yang terakhir menunjuk ke yang pertama.
 * Dipakai di kaki halaman case study supaya pembaca punya jalan lanjut
 * selain tombol kembali.
 */
export function getNextWork(slug: string): WorkEntry | null {
  const all = getAllWork();
  const i = all.findIndex((w) => w.frontmatter.slug === slug);
  if (i === -1 || all.length < 2) return null;
  return all[(i + 1) % all.length];
}

export type WorkHeading = { id: string; text: string };

/** "Pendekatan & Keputusan Teknis" → "pendekatan-dan-keputusan-teknis" */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "") // buang tanda diakritik hasil NFKD
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Judul bagian (`## ...`) dari isi MDX, untuk daftar isi case study.
 *
 * id-nya dibuat dengan slugifyHeading yang SAMA dengan komponen h2 di
 * halaman case study — kalau dua tempat itu memakai aturan berbeda,
 * tautan daftar isi diam-diam tidak mengarah ke mana pun.
 */
export function getHeadings(body: string): WorkHeading[] {
  const headings: WorkHeading[] = [];
  let inFence = false;

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      const text = m[1].replace(/[*_`]/g, "").trim();
      headings.push({ id: slugifyHeading(text), text });
    }
  }

  return headings;
}

/** "2024-10" → "Okt 2024". Nilai TODO dibiarkan apa adanya. */
export function formatMonth(value: string | null): string {
  if (!value) return "sekarang";
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return value;
  const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${BULAN[Number(m[2]) - 1]} ${m[1]}`;
}

export function formatPeriod(start: string, end: string | null): string {
  return `${formatMonth(start)} — ${formatMonth(end)}`;
}

export const STATUS_LABEL: Record<WorkFrontmatter["status"], string> = {
  shipped: "Selesai",
  wip: "Sedang berjalan",
  archived: "Arsip",
};

/**
 * Memetakan domain proyek ke warna sistem.
 *
 * Ini yang membuat warna di situs ini punya arti: sian untuk machine
 * learning, terakota untuk web/backend, indigo untuk riset. Pengunjung
 * bisa memilah jenis proyek sekilas, tanpa membaca label satu per satu.
 *
 * Urutannya sengaja: ML diperiksa lebih dulu, karena proyek yang
 * menggabungkan ML dan web sebaiknya dibaca sebagai proyek ML.
 */
export type DomainTone = "ml" | "web" | "research";

export function domainTone(domain: string[]): DomainTone {
  if (domain.includes("research")) return "research";
  if (domain.includes("ml") || domain.includes("nlp")) return "ml";
  return "web";
}

/** Label stiker domain di pojok kartu — teks pendamping warnanya. */
export const TONE_LABEL: Record<DomainTone, string> = {
  ml: "Machine Learning",
  web: "Web & Backend",
  research: "Riset & NLP",
};
