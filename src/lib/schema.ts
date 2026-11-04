import { z } from "zod";

/**
 * Skema konten — satu sumber kebenaran untuk bentuk data.
 *
 * Kenapa ini ada: kalau sebuah field wajib lupa diisi, build GAGAL
 * dengan pesan yang menunjuk persis ke file dan field-nya. Web tidak
 * akan pernah rusak diam-diam di production karena JSON yang salah.
 *
 * Ini alasan utama memilih JSON+Zod ketimbang headless CMS: CMS tidak
 * memberi jaminan sekuat ini di waktu build.
 */

const isoMonth = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Format harus YYYY-MM (contoh: 2024-09)");

/**
 * Varian yang juga menerima placeholder "TODO ...".
 * Dipakai HANYA di frontmatter case study, supaya dev server tetap jalan
 * selagi kontennya belum lengkap. Placeholder-nya tetap dilaporkan oleh
 * `npm run content:check`, jadi tidak ada yang lolos diam-diam ke production.
 */
const isoMonthOrTodo = z
  .string()
  .refine(
    (v) => /^\d{4}-\d{2}$/.test(v) || /^TODO/i.test(v),
    "Format harus YYYY-MM (contoh: 2024-09), atau placeholder yang diawali TODO"
  );

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/, "Format harus YYYY-MM atau YYYY-MM-DD");

/* ---------------------------------------------------------------- */

export const profileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1).max(80),
  tagline: z.string().min(1).max(200),
  location: z.object({
    city: z.string(),
    region: z.string().optional(),
    country: z.string(),
    timezone: z.string(),
  }),
  availability: z.object({
    status: z.enum(["open", "selective", "closed"]),
    note: z.string(),
  }),
  seeking: z.string(),
  avatar: z.string(),
  bio: z.object({
    short: z.string().min(1).max(300),
    long: z.string().min(1),
  }),
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
  links: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    github: z.string(),
    linkedin: z.string(),
    kaggle: z.string().optional(),
    huggingface: z.string().optional(),
    website: z.string().optional(),
  }),
  education: z.object({
    institution: z.string(),
    degree: z.string(),
    focus: z.string(),
    startYear: z.number().int(),
    endYear: z.number().int(),
    status: z.enum(["ongoing", "graduated"]),
  }),
});

export const nowSchema = z.object({
  updatedAt: isoDate,
  items: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        kind: z.enum(["project", "learning", "research", "writing", "reading"]),
        description: z.string(),
        why: z.string(),
        progress: z.number().min(0).max(100).nullable(),
        startedAt: isoMonth,
        link: z.string(),
        relatedWork: z.string().optional(),
      })
    )
    .max(4, "Maksimal 4 item — lebih dari itu terlihat tidak fokus"),
});

export const timelineSchema = z.object({
  entries: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "education",
        "work",
        "internship",
        "organization",
        "freelance",
        "milestone",
      ]),
      title: z.string(),
      organization: z.string(),
      location: z.string(),
      startDate: isoMonth,
      endDate: isoMonth.nullable(),
      summary: z.string(),
      highlights: z.array(z.string()),
      stack: z.array(z.string()),
      link: z.string().optional(),
      logo: z.string().optional(),
      relatedWork: z.string().optional(),
      relatedAchievement: z.string().optional(),
    })
  ),
});

const courseSchema = z.object({
  title: z.string(),
  date: isoDate,
  verifyUrl: z.string(),
  note: z.string().optional(),
});

export const achievementsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      issuer: z.string(),
      category: z.enum([
        "certification",
        "award",
        "competition",
        "publication",
        "speaking",
        "scholarship",
        "opensource",
      ]),
      featured: z.boolean().default(false),
      date: isoDate,
      periodStart: isoDate.optional(),
      periodEnd: isoDate.optional(),
      scale: z.string().optional(),
      rank: z.string().optional(),
      description: z.string(),
      credentialId: z.string().optional(),
      verifyUrl: z.string(),
      skills: z.array(z.string()),
      relatedWork: z.string().optional(),
      childrenLabel: z.string().optional(),
      children: z
        .array(
          z.object({
            group: z.string(),
            issuer: z.string(),
            type: z.string(),
            verifyUrl: z.string().optional(),
            date: isoDate.optional(),
            note: z.string().optional(),
            courses: z.array(courseSchema),
          })
        )
        .optional(),
    })
  ),
});

export const skillsSchema = z.object({
  groups: z.array(
    z.object({
      name: z.string(),
      items: z.array(
        z.object({
          name: z.string(),
          /**
           * Sengaja BUKAN angka atau bar bintang 1-5 — itu tidak punya
           * standar pembanding sehingga tidak dipercaya pembaca.
           * Tiga tingkat standar, dengan definisi yang dipegang konsisten:
           *   beginner     — pernah dipakai dengan panduan/tutorial
           *   intermediate — bisa membangun fitur sendiri sambil buka dokumentasi
           *   advanced     — bisa membaca & memperbaiki kode orang lain,
           *                  dan menjelaskan trade-off pilihan teknisnya
           */
          level: z.enum(["beginner", "intermediate", "advanced"]),
          years: z.number().nullable().optional(),
          note: z.string().optional(),
        })
      ),
    })
  ),
});

export const workFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  tagline: z.string().max(160),
  featured: z.boolean(),
  order: z.number().int(),
  status: z.enum(["shipped", "wip", "archived"]),
  period: z.object({ start: isoMonthOrTodo, end: isoMonthOrTodo.nullable() }),
  role: z.string(),
  team: z.string(),
  domain: z.array(z.string()),
  stack: z.array(z.string()),
  metrics: z.array(
    z.object({
      label: z.string(),
      /**
       * Menerima teks, angka, ATAU kosong.
       *
       * Tiga hal yang wajar diketik orang di YAML, dan ketiganya harus jalan:
       *   value: "180ms"   -> string
       *   value: 500       -> YAML membacanya sebagai angka, bukan string
       *   value:           -> YAML membacanya sebagai null (field dikosongkan)
       *
       * Semuanya dinormalkan jadi string di sini. Metrik yang kosong
       * disaring saat dibaca (lihat lib/work.ts), jadi kartunya cuma
       * menampilkan metrik yang lebih sedikit — bukan gagal build.
       *
       * Aturan umumnya: mengosongkan field TIDAK BOLEH merusak web.
       */
      value: z
        .union([z.string(), z.number(), z.null()])
        .transform((v) => (v === null ? "" : String(v))),
      note: z.string().optional(),
    })
  ),
  links: z.object({
    repo: z.string().optional(),
    demo: z.string().optional(),
    writeup: z.string().optional(),
    paper: z.string().optional(),
  }),
  cover: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});

export type Profile = z.infer<typeof profileSchema>;
export type Now = z.infer<typeof nowSchema>;
export type Timeline = z.infer<typeof timelineSchema>;
export type Achievements = z.infer<typeof achievementsSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type WorkFrontmatter = z.infer<typeof workFrontmatterSchema>;

export type SkillLevel =
  z.infer<typeof skillsSchema>["groups"][number]["items"][number]["level"];

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Urutan untuk sorting — advanced tampil lebih dulu dalam satu grup. */
export const SKILL_LEVEL_RANK: Record<SkillLevel, number> = {
  advanced: 3,
  intermediate: 2,
  beginner: 1,
};
