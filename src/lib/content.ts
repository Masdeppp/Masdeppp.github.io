import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  profileSchema,
  nowSchema,
  timelineSchema,
  achievementsSchema,
  skillsSchema,
} from "./schema";

/**
 * CONTENT LAYER — satu-satunya pintu antara data dan UI.
 *
 * Seluruh komponen mengambil data lewat file ini, tidak pernah
 * membaca JSON langsung. Konsekuensinya: kalau suatu hari pindah ke
 * Payload CMS, Sanity, atau database, yang berubah cukup file ini —
 * bukan puluhan komponen.
 *
 * Ini asuransi arsitektur yang murah, dan alasan kenapa memilih JSON
 * sekarang tidak mengunci pilihan di masa depan.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Membuang key diagnostik (_panduan, _catatan, _example, ...) yang
 *  sengaja ditaruh di file konten sebagai petunjuk pengisian. */
function stripMeta<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripMeta) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k.startsWith("_")) continue;
      out[k] = stripMeta(v);
    }
    return out as T;
  }
  return value;
}

function readJson<S extends z.ZodTypeAny>(file: string, schema: S): z.infer<S> {
  const full = path.join(CONTENT_DIR, file);

  let raw: string;
  try {
    raw = fs.readFileSync(full, "utf8");
  } catch {
    throw new Error(`[content] File tidak ditemukan: content/${file}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      `[content] JSON tidak valid di content/${file}\n${(e as Error).message}`
    );
  }

  const result = schema.safeParse(stripMeta(parsed));
  if (!result.success) {
    // Pesan error yang menunjuk persis ke field bermasalah, supaya
    // memperbaikinya tidak perlu menebak.
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".") || "(root)"} — ${i.message}`)
      .join("\n");
    throw new Error(`[content] Validasi gagal di content/${file}\n${issues}`);
  }

  return result.data;
}

/* ----------------------------------------------------------------
   API publik. Komponen memakai HANYA fungsi-fungsi di bawah ini.
   ---------------------------------------------------------------- */

export const getProfile = () => readJson("profile.json", profileSchema);
export const getSkills = () => readJson("skills.json", skillsSchema);
export const getAchievements = () =>
  readJson("achievements.json", achievementsSchema);

export function getNow() {
  const data = readJson("now.json", nowSchema);
  return { ...data, items: data.items.filter((i) => !i.id.startsWith("TODO")) };
}

export function getTimeline() {
  const data = readJson("timeline.json", timelineSchema);
  // Urut terbaru dulu. endDate null berarti masih berjalan → paling atas.
  const sorted = [...data.entries].sort((a, b) => {
    if (a.endDate === null && b.endDate !== null) return -1;
    if (b.endDate === null && a.endDate !== null) return 1;
    return (b.endDate ?? b.startDate).localeCompare(a.endDate ?? a.startDate);
  });
  return { entries: sorted };
}
