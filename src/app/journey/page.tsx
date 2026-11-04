import Link from "next/link";
import type { Metadata } from "next";
import { getTimeline } from "@/lib/content";
import { formatPeriod } from "@/lib/work";

export const metadata: Metadata = {
  title: "Journey",
  description: "Perjalanan pendidikan, program, dan pengalaman kerja.",
};

const TYPE_LABEL: Record<string, string> = {
  education: "Pendidikan",
  work: "Kerja",
  internship: "Magang",
  organization: "Organisasi",
  freelance: "Freelance",
  milestone: "Titik balik",
};

export default function Journey() {
  const { entries } = getTimeline();

  return (
    <main id="main" className="section container">
      <p className="sticker">Journey</p>
      <h1 style={{ marginTop: "var(--s-5)", fontSize: "var(--t-2xl)" }}>
        Perjalanan
      </h1>
      <p className="prose" style={{ marginTop: "var(--s-5)" }}>
        Bukan daftar tanggal. Setiap titik punya konteks: apa yang dikerjakan,
        dan apa yang berubah karenanya.
      </p>

      <div className="timeline" style={{ marginTop: "var(--s-8)" }}>
        {entries.map((e) => {
          const berjalan = e.endDate === null;

          return (
            <article
              key={e.id}
              className="timeline__item"
            >
              <div
                style={{
                  display: "flex",
                  gap: "var(--s-3)",
                  alignItems: "baseline",
                  flexWrap: "wrap",
                }}
              >
                <span className="timeline__period">
                  {formatPeriod(e.startDate, e.endDate)}
                </span>
                <span className="chip">
                  {TYPE_LABEL[e.type] ?? e.type}
                </span>
                {/* Limau dipakai untuk status, bukan jenis entri. Titik di
                    garis timeline sengaja polos — baru berwarna saat hover. */}
                {berjalan && <span className="chip chip--live">Sedang berjalan</span>}
              </div>

              <h2 style={{ fontSize: "var(--t-lg)", marginTop: "var(--s-3)" }}>
                {e.title}
              </h2>

              <p className="timeline__org" style={{ marginTop: "var(--s-1)" }}>
                {e.organization}
                {e.location && ` · ${e.location}`}
              </p>

              <p className="prose" style={{ marginTop: "var(--s-4)" }}>
                {e.summary}
              </p>

              {e.highlights.length > 0 && (
                <ul className="bullets">
                  {e.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}

              {e.stack.length > 0 && (
                <ul className="chips" style={{ marginTop: "var(--s-4)" }}>
                  {e.stack.map((s) => (
                    <li key={s} className="chip chip--ml">{s}</li>
                  ))}
                </ul>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "var(--s-2)",
                  marginTop: "var(--s-4)",
                  fontSize: "var(--t-sm)",
                  flexWrap: "wrap",
                }}
              >
                {e.relatedWork && (
                  <Link href={`/work/${e.relatedWork}`} className="link-pill">Lihat case study →</Link>
                )}
                {e.link?.startsWith("http") && (
                  <a href={e.link} target="_blank" rel="noreferrer" className="link-pill">
                    Repositori ↗
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
