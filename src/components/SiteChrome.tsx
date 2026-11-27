import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import Link from "next/link";
import { NAV, SITE } from "@/data/site";

function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="7" fill="var(--accent)" />
      <path
        d="M7 10.5c2.2 0 3 1.4 3.8 4.2l1.6 5.8 2.4-8.6h2.4l2.4 8.6 1.6-5.8c.8-2.8 1.6-4.2 3.8-4.2"
        fill="none"
        stroke="var(--accent-ink)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header
      data-site-header
      className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-ink" aria-label={`${SITE.name} home`}>
          <Mark />
          <span className="font-serif text-[1.15rem] font-semibold tracking-tight">{SITE.name}</span>
        </Link>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-[0.93rem]">
            {NAV.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}

const FOOTER_COLUMNS = [
  {
    title: "Research",
    links: [
      { href: "/research", label: "Papers and studies" },
      { href: "/data/speaking-by-occupation", label: "Speaking by occupation data" },
      { href: "/statistics", label: "Statistics" },
      { href: "/research/agenda", label: "Research agenda" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/professions", label: "Speaking by profession" },
      { href: "/tools", label: "Free tools" },
      { href: "/learn", label: "Learn" },
      { href: "/curriculum", label: "Teach It Everywhere curriculum" },
      { href: "/newsletter", label: "Newsletter" },
    ],
  },
  {
    title: "Institute",
    links: [
      { href: "/about", label: "About" },
      { href: "/mission", label: "Mission" },
      { href: "/governance", label: "Governance" },
      { href: "/disclosures", label: "Funding and disclosures" },
      { href: "/editorial-policy", label: "Editorial and research policy" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getUTCFullYear();
  return (
    <footer data-site-footer className="mt-24 border-t border-rule bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <Mark />
            <span className="font-serif text-lg font-semibold">{SITE.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-2">
            A nonprofit research organization studying why spoken communication matters and publishing free
            resources so anyone can build the skill.
          </p>
          <p className="mt-4 text-sm text-ink-3">
            A {SITE.taxStatus}. EIN {SITE.ein}.
          </p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold text-ink">{col.title}</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-block py-1 text-ink-2 hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-ink-3 sm:flex-row sm:justify-between sm:px-6">
          <p>
            © {year} {SITE.legalName}, a {SITE.entityType}.
          </p>
          <p>
            Text is licensed under{" "}
            <a className="underline" href="https://creativecommons.org/licenses/by/4.0/" rel="license noopener">
              CC BY 4.0
            </a>{" "}
            unless noted. Please cite us.
          </p>
        </div>
      </div>
    </footer>
  );
}
