"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** A navigation link that marks itself as the current section (aria-current) for styling and screen readers. */
export function NavLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const path = usePathname() ?? "";
  const section = href.startsWith("/data/") ? "/data" : href;
  const active = path === section || path.startsWith(`${section}/`);
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={className}>
      {children}
    </Link>
  );
}
