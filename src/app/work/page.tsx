import Link from "next/link";
import type { Metadata } from "next";
import { getAllWork, formatPeriod, STATUS_LABEL, domainTone, TONE_LABEL } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work",
  description: "Case study proyek — masalah, pendekatan, keputusan teknis, dan hasilnya.",
};

export default function WorkIndex() {
  const work = getAllWork();

  return (
    <main id="main" className="section container">
      <p className="sticker">Selected work</p>
      <h1 className="page-title">
        Case <span className="hilite">Study</span>
      </h1>
      <p className="prose" style={{ marginTop: "var(--s-5)" }}>
        Empat bagian per proyek: konteks, masalah, pendekatan &amp; keputusan
        teknis, hasil. Dibuat ringkas supaya bisa dipindai, bukan dibaca
        seperti laporan.
      </p>

      {/* Legenda warna — sekali saja, di atas semua kartu. */}
      <ul className="chips legend" aria-label="Arti warna kartu">
        <li className="chip chip--ml">{TONE_LABEL.ml}</li>
        <li className="chip chip--web">{TONE_LABEL.web}</li>
        <li className="chip chip--research">{TONE_LABEL.research}</li>
      </ul>

      <div className="work-grid" style={{ marginTop: "var(--s-8)" }}>
        {work.map(({ frontmatter: f }, i) => {
          const tone = domainTone(f.domain);
          // Kartu pertama selebar grid kalau jumlahnya ganjil, supaya
          // sisanya tetap berpasangan rapi dua-dua.
          const wide = i === 0 && work.length % 2 === 1;

          return (
            <Link
              key={f.slug}
              href={`/work/${f.slug}`}
              className={`work-card work-card--${tone}${wide ? " work-card--featured span-full" : ""}`}
            >
              <span className="card-tag">{TONE_LABEL[tone]}</span>

              <div className="card-meta">
                <span className="timeline__period">
                  {formatPeriod(f.period.start, f.period.end)}
                </span>
                <span className={`chip${f.status === "wip" ? " chip--live" : ""}`}>
                  {STATUS_LABEL[f.status]}
                </span>
              </div>

              <h2 className="work-card__title" style={{ marginTop: "var(--s-3)" }}>
                {f.title}
              </h2>

              <p className="work-card__tagline">{f.tagline}</p>

              <ul className="chips" style={{ marginTop: "var(--s-4)" }}>
                {f.stack.slice(0, 6).map((s) => (
                  <li key={s} className="chip">{s}</li>
                ))}
                {f.stack.length > 6 && (
                  <li className="chip chip--live">+{f.stack.length - 6}</li>
                )}
              </ul>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
