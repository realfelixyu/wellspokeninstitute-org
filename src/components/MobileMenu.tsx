"use client";

import Link from "next/link";
import { useRef, type KeyboardEvent, type MouseEvent } from "react";
import { NAV } from "@/data/site";

export function MobileMenu() {
  const menu = useRef<HTMLDetailsElement>(null);
  function handleKey(event: KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== "Escape" || !menu.current?.open) return;
    menu.current.open = false;
    menu.current.querySelector("summary")?.focus();
  }
  function handleClick(event: MouseEvent<HTMLDetailsElement>) {
    if (event.target instanceof Element && event.target.closest("a") && menu.current) menu.current.open = false;
  }
  return (
    <details ref={menu} onKeyDown={handleKey} onClick={handleClick} className="relative lg:hidden">
          <summary className="flex h-12 cursor-pointer list-none items-center gap-2 rounded-md border border-rule px-3 text-sm text-ink [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-rule bg-card p-2 shadow-lg"
          >
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-md px-3 py-2.5 text-ink hover:bg-paper-2">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/newsletter" className="block rounded-md px-3 py-2.5 text-accent hover:bg-paper-2">
                  Newsletter
                </Link>
              </li>
            </ul>
          </nav>
        </details>
  );
}
