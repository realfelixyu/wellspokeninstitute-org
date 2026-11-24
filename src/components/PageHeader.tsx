import Link from "next/link";
import type { ReactNode } from "react";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-3">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={it.path} className="flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden="true">/</span> : null}
            {i < items.length - 1 ? (
              <Link href={it.path} className="hover:text-accent">
                {it.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-2">
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-rule bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-accent">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 max-w-3xl font-serif text-[2.1rem] font-semibold leading-[1.15] tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {lede ? <div className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">{lede}</div> : null}
        {children}
      </div>
    </section>
  );
}

export function Container({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return <div className={`mx-auto px-4 sm:px-6 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}>{children}</div>;
}
