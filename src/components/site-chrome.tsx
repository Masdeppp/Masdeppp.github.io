import Link from "next/link";
import { getProfile } from "@/lib/content";
import { ThemeToggle } from "./theme-toggle";

/** Navigasi utama. Sticky, tenang, tanpa efek berlebihan. */
export function SiteNav() {
  const p = getProfile();

  return (
    <header className="site-nav">
      <nav className="container site-nav__inner" aria-label="Navigasi utama">
        <Link href="/" className="site-nav__name">
          {p.name}
        </Link>

        <div className="site-nav__right">
          <ul className="site-nav__links">
            <li><Link href="/work">Work</Link></li>
            <li><Link href="/journey">Journey</Link></li>
            <li><Link href="/achievements">Achievements</Link></li>
          </ul>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const p = getProfile();
  const links: Array<[string, string]> = [
    ["Email", `mailto:${p.links.email}`],
    ["LinkedIn", p.links.linkedin],
    ["GitHub", p.links.github],
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <p className="prose" style={{ color: "var(--text-secondary)" }}>
          {p.seeking}
        </p>

        <ul className="site-nav__links" style={{ marginTop: "var(--s-5)" }}>
          {links
            // Link yang masih placeholder tidak ditampilkan — lebih baik
            // tidak ada daripada mengarah ke tempat yang salah.
            .filter(([, href]) => href.startsWith("http") || href.startsWith("mailto:"))
            .map(([label, href]) => (
              <li key={label}>
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {label}
                </a>
              </li>
            ))}
        </ul>

        <p className="label" style={{ marginTop: "var(--s-6)" }}>
          {p.location.city}, {p.location.country}
        </p>
      </div>
    </footer>
  );
}
