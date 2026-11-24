import type { ReactNode, ComponentProps } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { SkillChart } from "@/components/SkillChart";

function isExternal(href: string) {
  return /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?wellspokeninstitute\.org/i.test(href);
}

export function buildComponents(citationKeys: string[]) {
  const index = new Map(citationKeys.map((k, i) => [k, i + 1]));

  function Cite({ k }: { k: string }) {
    const keys = k.split(",").map((s) => s.trim());
    return (
      <sup>
        {keys.map((key, i) => {
          const n = index.get(key);
          return (
            <span key={key}>
              {i > 0 ? "," : "["}
              <a href={`#ref-${n ?? "missing"}`} aria-label={`Reference ${n}`}>
                {n ?? "?"}
              </a>
              {i === keys.length - 1 ? "]" : ""}
            </span>
          );
        })}
      </sup>
    );
  }

  function KeyStat({ value, label, k }: { value: string; label: string; k?: string }) {
    return (
      <span className="not-prose my-8 block rounded-xl border border-rule bg-card px-6 py-5">
        <span className="block font-serif text-4xl font-semibold text-accent">{value}</span>
        <span className="mt-2 block text-base text-ink-2">
          {label}
          {k ? <Cite k={k} /> : null}
        </span>
      </span>
    );
  }

  function Callout({ title, children }: { title?: string; children: ReactNode }) {
    return (
      <aside className="my-8 rounded-xl border border-rule bg-accent-soft px-6 py-5 text-ink">
        {title ? <p className="mb-2 font-semibold">{title}</p> : null}
        <div className="text-[0.98rem] leading-relaxed [&>p+p]:mt-3">{children}</div>
      </aside>
    );
  }

  return {
    Cite,
    KeyStat,
    Callout,
    SkillChart,
    a: (props: ComponentProps<"a">) => {
      const href = typeof props.href === "string" ? props.href : "";
      return isExternal(href) ? (
        <a {...props} target="_blank" rel="noopener noreferrer" />
      ) : (
        <a {...props} />
      );
    },
    table: (props: ComponentProps<"table">) => (
      <div className="table-wrap">
        <table {...props} />
      </div>
    ),
  };
}

export function Mdx({ source, citationKeys }: { source: string; citationKeys: string[] }) {
  return (
    <div className="prose-body">
      <MDXRemote
        source={source}
        components={buildComponents(citationKeys)}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  );
}
