"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** A navigation link that marks itself as the current section (aria-current) for styling and screen readers. */
export function NavLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const path = usePathname() ?? "";
  const section = href.startsWith("/data/") ? "/data" : href;
  const clean = path.replace(/\.html$/, "").replace(/(.)\/$/, "$1");
  const current = clean === href ? "page" : clean === section || clean.startsWith(`${section}/`) ? "true" : undefined;
  return (
    <Link href={href} aria-current={current} className={className}>
      {children}
    </Link>
  );
}
