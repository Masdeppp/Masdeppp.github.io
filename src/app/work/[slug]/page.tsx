import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  getAllWork,
  getWorkBySlug,
  getNextWork,
  getHeadings,
  slugifyHeading,
  formatPeriod,
  STATUS_LABEL,
  TONE_LABEL,
  domainTone,
} from "@/lib/work";

/** Semua case study dirender statis saat build — tidak ada kerja di runtime. */
export function generateStaticParams() {
  return getAllWork().map((w) => ({ slug: w.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getWorkBySlug(slug);
  if (!entry) return {};
  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.tagline,
  };
}

/** Teks polos dari children React — judul MDX bisa berisi <strong>/<code>. */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

/* h2 di tulisan diberi id supaya daftar isi bisa menunjuk ke sana.
   Aturan id-nya slugifyHeading — sama persis dengan getHeadings. */
const mdxComponents = {
  h2: ({ children, ...rest }: ComponentPropsWithoutRef<"h2">) => (
    <h2 {...rest} id={slugifyHeading(textOf(children))}>
      {children}
    </h2>
  ),
};

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getWorkBySlug(slug);
  if (!entry) notFound();

  const { frontmatter: f, body } = entry;

  /* Nada warna proyek. Nilainya SAMA dengan yang dipakai kartu di /work,
     jadi warna yang dilihat pembaca sebelum mengklik tetap ada setelah
     ia masuk. Itu inti konsistensinya. */
  const tone = domainTone(f.domain);
  const headings = getHeadings(body);
  const next = getNextWork(f.slug);

  // Link yang masih placeholder tidak ditampilkan sebagai tautan.
  const links = Object.entries(f.links).filter(
    ([, url]) => typeof url === "string" && url.startsWith("http")
  ) as Array<[string, string]>;

  return (
    <main id="main" className="section container">
      {/* Dua jalan pulang di atas: beranda dan daftar Work. */}
      <nav aria-label="Remah roti" className="crumbs">
        <ol>
          <li><Link href="/" className="link-pill">Beranda</Link></li>
          <li><Link href="/work" className="link-pill">Work</Link></li>
          <li aria-current="page">
            <span className="crumbs__current">{f.title}</span>
          </li>
        </ol>
      </nav>

      {/* Satu panel berwarna menampung judul, meta, dan metrik —
          bagian yang dipindai. Tulisan panjangnya menyusul di bawah. */}
      <header
        className={`case-head case-head--${tone}`}
        style={{ marginTop: "var(--s-7)" }}
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

        <h1 className="case-head__title">{f.title}</h1>
        <p className="case-head__tagline">{f.tagline}</p>

        <hr className="case-head__rule" />

        {/* Meta ditaruh di atas isi supaya pembaca yang cuma memindai
            langsung tahu konteksnya tanpa membaca seluruh tulisan. */}
        <dl className="meta-list">
          <dt>Peran</dt>
          <dd>{f.role}</dd>

          <dt>Tim</dt>
          <dd>{f.team}</dd>

          <dt>Stack</dt>
          <dd>
            <ul className="chips">
              {f.stack.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
          </dd>

          {links.length > 0 && (
            <>
              <dt>Tautan</dt>
              <dd>
                <div
                  style={{
                    display: "flex",
                    gap: "var(--s-2)",
                    flexWrap: "wrap",
                  }}
                >
                  {links.map(([label, url]) => (
                    <a
                      key={label}
                      className="link-pill"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {label} ↗
                    </a>
                  ))}
                </div>
              </dd>
            </>
          )}
        </dl>

        {f.metrics.length > 0 && (
          <ul className="metrics" style={{ marginTop: "var(--s-6)" }}>
            {f.metrics.map((m) => (
              <li key={m.label} className="metric">
                <span className="metric__label">{m.label}</span>
                <span className="metric__value">{m.value}</span>
                {m.note && <span className="metric__note">{m.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="case-body">
        {/* Daftar isi hanya kalau ada lebih dari satu bagian — satu
            tautan saja bukan navigasi, cuma hiasan. */}
        {headings.length > 1 && (
          <aside className="case-toc" aria-label="Daftar isi">
            <p className="label">Isi halaman</p>
            <ol>
              {headings.map((h, i) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="toc-link">
                    <span className="toc-link__num">{String(i + 1).padStart(2, "0")}</span>
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </aside>
        )}

        <article className="mdx">
          <MDXRemote
            source={body}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </article>
      </div>

      {/* Kaki halaman: jalan lanjut (proyek berikutnya) dan dua jalan
          pulang yang sama dengan remah roti di atas — pembaca yang
          sudah sampai bawah tidak perlu menggulir balik. */}
      <footer className="case-foot">
        {next && (
          <Link
            href={`/work/${next.frontmatter.slug}`}
            className={`work-card next-card work-card--${domainTone(next.frontmatter.domain)}`}
          >
            <span className="card-tag">{TONE_LABEL[domainTone(next.frontmatter.domain)]}</span>
            <span className="label">Case study berikutnya →</span>
            <span className="work-card__title">{next.frontmatter.title}</span>
            <span className="work-card__tagline">{next.frontmatter.tagline}</span>
          </Link>
        )}

        <nav aria-label="Navigasi case study" className="case-foot__nav">
          <Link href="/work" className="btn btn--lime">
            ← Semua case study
          </Link>
          <Link href="/" className="btn">
            Kembali ke beranda
          </Link>
        </nav>
      </footer>
    </main>
  );
}
