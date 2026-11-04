import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { getProfile } from "@/lib/content";
import { SiteNav, SiteFooter } from "@/components/site-chrome";
import "./globals.css";

/* Font dimuat lewat next/font: di-self-host saat build, jadi tidak ada
   permintaan ke server Google saat halaman dibuka. Lebih cepat, dan
   tidak ada layout shift.

   SATU keluarga untuk seluruh situs: Outfit. Judul di berat 800, label
   dan tombol di 700, badan teks di 400. Sebelumnya badan teks memakai
   DM Sans dan label memakai font mono — tiga suara berbeda yang membuat
   halaman isi terasa seperti dokumen teknis, bukan bagian dari sistem
   stiker yang sama dengan landing page. Karena Outfit font variabel,
   semua berat itu datang dari satu unduhan.

   JetBrains Mono tetap dimuat, tapi HANYA untuk potongan kode. */
const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display-loaded",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
  display: "swap",
});

/* Dijalankan sebelum halaman digambar supaya pilihan tema dari kunjungan
   sebelumnya langsung terpasang — tanpa ini halaman selalu muncul terang
   dulu lalu berkedip ke gelap, atau malah lupa pilihannya sama sekali.
   Dibungkus try karena localStorage bisa dilarang (mode private). */
const THEME_SCRIPT = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export function generateMetadata(): Metadata {
  const p = getProfile();
  return {
    title: { default: `${p.name} — ${p.headline}`, template: `%s — ${p.name}` },
    description: p.bio.short,
    openGraph: {
      title: `${p.name} — ${p.headline}`,
      description: p.bio.short,
      type: "profile",
      locale: "id_ID",
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const p = getProfile();

  /* JSON-LD schema Person — membantu Google memahami bahwa halaman ini
     tentang seseorang, bukan sekadar dokumen. Berpengaruh nyata saat
     seseorang mencari namamu. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    jobTitle: p.headline,
    email: p.links.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: p.location.city,
      addressCountry: p.location.country,
    },
    alumniOf: { "@type": "EducationalOrganization", name: p.education.institution },
    sameAs: [p.links.linkedin, p.links.github].filter(
      (u) => u && u.startsWith("http")
    ),
  };

  return (
    <html
      lang="id"
      className={`${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="sr-only">
          Lompat ke konten utama
        </a>
        <div className="scroll-progress" aria-hidden="true" />
        <SiteNav />
        {children}
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
