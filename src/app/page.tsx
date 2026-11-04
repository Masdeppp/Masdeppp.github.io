import Link from "next/link";
import { getProfile, getNow, getSkills, getTimeline } from "@/lib/content";
import { SKILL_LEVEL_LABEL } from "@/lib/schema";
import { getFeaturedWork, formatPeriod, STATUS_LABEL, domainTone, TONE_LABEL } from "@/lib/work";
import { Reveal } from "@/components/reveal";
import { LatentField } from "@/components/latent-field";

export default function Home() {
  const p = getProfile();
  const now = getNow();
  const skills = getSkills();
  // Tiga teratas saja di landing — daftar lengkapnya ada di /work.
  const featured = getFeaturedWork().slice(0, 3);
  const timeline = getTimeline().entries.slice(0, 3);

  return (
    <main id="main">
      {/* ============================================================
          HERO
          Nama sebesar mungkin, satu blok sorot, dan latent field
          interaktif di sebelahnya. Satu set piece — sisanya tenang.
          ============================================================ */}
      <section className="hero">
        <LatentField />

        <div className="hero__inner container">
          <p className="sticker">
            {p.location.city} · {p.location.country}
          </p>

          {/* Satu kata per baris, tiap kata blok stiker dengan warna
              bergilir (ungu → limau → merah muda). */}
          <h1 className="hero__name">
            {p.name.split(" ").map((word, i) => (
              <span className="line-mask" key={`${word}-${i}`}>
                <span>
                  <span className={`hero__word hilite hero__word--${(i % 3) + 1}`}>{word}</span>
                </span>
              </span>
            ))}
          </h1>

          <p
            className="line-mask"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--t-lg)",
              color: "var(--c-ml)",
              marginTop: "var(--s-5)",
              lineHeight: "var(--leading-snug)",
            }}
          >
            <span>{p.headline}</span>
          </p>

          <Reveal delay={420}>
            <p className="prose" style={{ marginTop: "var(--s-6)", fontSize: "var(--t-lg)" }}>
              {p.tagline}
            </p>

            {/* Kontak berbentuk tombol, bukan tautan teks. Di halaman
                yang tujuannya dihubungi HR, aksi utamanya harus terlihat
                seperti benda yang bisa ditekan. */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--s-3)",
                marginTop: "var(--s-7)",
              }}
            >
              <a className="btn btn--primary" href={`mailto:${p.links.email}`}>
                Hubungi saya
              </a>
              {p.links.linkedin.startsWith("http") && (
                <a className="btn" href={p.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              )}
              {p.links.github.startsWith("http") && (
                <a className="btn" href={p.links.github} target="_blank" rel="noreferrer">GitHub</a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- SEDANG DIKERJAKAN ---------- */}
      <section className="section section--alt">
        <div className="container">
        <Reveal>
          <header className="section-head">
            <h2>Sedang dikerjakan</h2>
            <p className="label">Diperbarui {now.updatedAt}</p>
          </header>
        </Reveal>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "var(--s-6)" }}>
          {now.items.map((item, i) => (
            // delay bertingkat: item muncul berurutan, bukan serempak
            <Reveal as="li" key={item.id} delay={i * 90}>
              <div style={{ borderTop: "var(--bw) solid var(--rule)", paddingTop: "var(--s-4)" }}>
                <div style={{ display: "flex", gap: "var(--s-3)", alignItems: "baseline", flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "var(--t-lg)" }}>{item.title}</h3>
                  <span className="chip chip--ml">{item.kind}</span>
                </div>

                <p className="prose" style={{ marginTop: "var(--s-3)" }}>{item.description}</p>

                {item.why && (
                  <p className="prose" style={{ marginTop: "var(--s-3)", color: "var(--text-secondary)", fontSize: "var(--t-base)" }}>
                    {item.why}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
        </div>
      </section>

      {/* ---------- SELECTED WORK ---------- */}
      <section className="section container">
        <Reveal>
          <header className="section-head">
            <h2>Selected work</h2>
            <Link href="/work" className="link-pill">
              Semua case study →
            </Link>
          </header>
        </Reveal>

        <div className="work-grid">
          {featured.map(({ frontmatter: f }, i) => {
            const tone = domainTone(f.domain);
            return (
              <Reveal key={f.slug} delay={i * 110} className={i === 0 ? "span-full" : ""}>
                <Link
                  href={`/work/${f.slug}`}
                  className={`work-card work-card--${tone}${i === 0 ? " work-card--featured" : ""}`}
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

                  <h3 className="work-card__title" style={{ marginTop: "var(--s-3)" }}>
                    {f.title}
                  </h3>

                  <p className="work-card__tagline">{f.tagline}</p>

                  <ul className="chips" style={{ marginTop: "var(--s-4)" }}>
                    {f.stack.slice(0, 5).map((s) => (
                      <li key={s} className="chip">{s}</li>
                    ))}
                  </ul>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- CUPLIKAN TIMELINE ---------- */}
      {/* Wadah luar selebar layar, container di dalam — supaya garis
          pembatas di atas section ini membentang penuh seperti garis
          section lain, bukan cuma selebar kolom konten. */}
      <section className="section">
        <div className="container">
        <Reveal>
          <header className="section-head">
            <h2>Journey</h2>
            <Link href="/journey" className="link-pill">
              Timeline lengkap →
            </Link>
          </header>
        </Reveal>

        <div className="timeline">
          {timeline.map((e, i) => (
            <Reveal key={e.id} delay={i * 90}>
              <div className="timeline__item">
                {/* Status "masih berjalan" dibawa chip ini, bukan titik
                    di garis timeline — titiknya baru berwarna saat hover. */}
                <div className="card-meta">
                  <span className="timeline__period">
                    {formatPeriod(e.startDate, e.endDate)}
                  </span>
                  {e.endDate === null && <span className="chip chip--live">Sedang berjalan</span>}
                </div>
                <h3 style={{ fontSize: "var(--t-lg)", marginTop: "var(--s-2)" }}>{e.title}</h3>
                <p className="timeline__org">{e.organization}</p>
              </div>
            </Reveal>
          ))}
        </div>
        </div>
      </section>

      {/* ---------- TOOLBOX ---------- */}
      <section className="section section--alt">
        <div className="container">
        <Reveal>
          <header className="section-head">
            <h2>Toolbox</h2>
            <Link href="/achievements" className="link-pill">
              Sertifikasi →
            </Link>
          </header>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
            gap: "var(--s-7)",
          }}
        >
          {skills.groups.map((group, gi) => (
            <Reveal key={group.name} delay={gi * 110}>
              <h3 className="label">{group.name}</h3>

              <ul style={{ listStyle: "none", padding: 0, margin: "var(--s-4) 0 0", display: "grid", gap: "var(--s-3)" }}>
                {group.items.map((s) => (
                  <li key={s.name}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-strong)" }}>
                      {s.name}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "var(--t-sm)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {SKILL_LEVEL_LABEL[s.level]}
                      {s.note ? ` · ${s.note}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        </div>
      </section>
    </main>
  );
}
