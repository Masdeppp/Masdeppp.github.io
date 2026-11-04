import Link from "next/link";
import type { Metadata } from "next";
import { getAchievements } from "@/lib/content";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Sertifikasi dan pencapaian, lengkap dengan tautan verifikasi resmi.",
};

/** "2025-01-10" → "10 Jan 2025"; "2024-10" → "Okt 2024" */
function formatDate(value: string): string {
  const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (full) return `${Number(full[3])} ${BULAN[Number(full[2]) - 1]} ${full[1]}`;
  const month = /^(\d{4})-(\d{2})$/.exec(value);
  if (month) return `${BULAN[Number(month[2]) - 1]} ${month[1]}`;
  return value;
}

export default function Achievements() {
  const { items } = getAchievements();

  return (
    <main id="main" className="section container">
      <p className="sticker">Achievements</p>
      <h1 style={{ marginTop: "var(--s-5)", fontSize: "var(--t-2xl)" }}>
        Sertifikasi & Pencapaian
      </h1>
      <p className="prose" style={{ marginTop: "var(--s-5)" }}>
        Setiap entri punya tautan verifikasi resmi dari penerbitnya — bukan
        salinan PDF. Silakan diperiksa.
      </p>

      <div style={{ marginTop: "var(--s-8)", display: "grid", gap: "var(--s-6)" }}>
        {items.map((item) => {
          const jumlahKursus =
            item.children?.reduce((n, g) => n + g.courses.length, 0) ?? 0;

          return (
            <section key={item.id} className="cert">
              <div
                style={{
                  display: "flex",
                  gap: "var(--s-3)",
                  alignItems: "baseline",
                  flexWrap: "wrap",
                }}
              >
                <span className="timeline__period">{formatDate(item.date)}</span>
                {item.scale && <span className="chip">{item.scale}</span>}
                {item.rank && <span className="chip chip--live">{item.rank}</span>}
              </div>

              <h2 style={{ fontSize: "var(--t-xl)", marginTop: "var(--s-3)" }}>
                {item.title}
              </h2>

              <p className="timeline__org" style={{ marginTop: "var(--s-1)" }}>
                {item.issuer}
              </p>

              <p className="prose" style={{ marginTop: "var(--s-4)" }}>
                {item.description}
              </p>

              {item.skills.length > 0 && (
                <ul className="chips" style={{ marginTop: "var(--s-4)" }}>
                  {item.skills.map((s) => (
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
                {item.verifyUrl.startsWith("http") && (
                  <a href={item.verifyUrl} target="_blank" rel="noreferrer" className="link-pill">
                    Verifikasi ↗
                  </a>
                )}
                {item.relatedWork && (
                  <Link href={`/work/${item.relatedWork}`} className="link-pill">Case study →</Link>
                )}
              </div>

              {item.credentialId && (
                <p className="label" style={{ marginTop: "var(--s-3)" }}>
                  {item.credentialId}
                </p>
              )}

              {/*
                23 sertifikat pendukung disembunyikan di dalam <details>.
                Alasannya: HR yang memindai melihat SATU sinyal kuat, sementara
                engineer yang ingin memverifikasi tetap bisa membuka semuanya.
                23 kartu terpisah akan membuat halaman ini terbaca sebagai
                daftar kursus, bukan daftar pencapaian.

                <details> dipilih karena bekerja tanpa JavaScript sama sekali
                dan sudah aksesibel lewat keyboard secara bawaan.
              */}
              {item.children && item.children.length > 0 && (
                <details className="cert__more">
                  <summary>
                    {item.childrenLabel ?? `${jumlahKursus} sertifikat pendukung`}
                  </summary>

                  {item.children.map((group) => (
                    <div key={group.group} className="cert-group">
                      <h3 className="cert-group__name">
                        {group.group}
                        {group.verifyUrl && (
                          <>
                            {" "}
                            <a
                              href={group.verifyUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: "var(--t-sm)" }}
                            >
                              verifikasi
                            </a>
                          </>
                        )}
                      </h3>

                      <p className="label" style={{ marginTop: "var(--s-1)" }}>
                        {group.issuer}
                        {group.note ? ` · ${group.note}` : ""}
                      </p>

                      <ul className="cert-group__list">
                        {group.courses.map((c) => (
                          <li key={c.verifyUrl} className="cert-course">
                            <a href={c.verifyUrl} target="_blank" rel="noreferrer">
                              {c.title}
                            </a>
                            <span className="cert-course__date">
                              {formatDate(c.date)}
                              {c.note ? ` · ${c.note}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </details>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
