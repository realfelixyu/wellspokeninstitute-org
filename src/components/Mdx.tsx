import type { ReactNode, ComponentProps } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { SkillChart } from "@/components/SkillChart";
import { getEntry, type Collection } from "@/lib/content";

const CONTENT_PATH = /^(?:https?:\/\/(?:www\.)?wellspokeninstitute\.org)?\/(research|learn|professions|statistics)\/([a-z0-9-]+)\/?(?:[?#].*)?$/i;

/** A link to a content page that is not live yet (scheduled for a later date) would 404 on the static host. */
function isUnpublishedContent(href: string) {
  const m = CONTENT_PATH.exec(href);
  return Boolean(m) && !getEntry(m![1].toLowerCase() as Collection, m![2]);
}

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
      // Render plain text until the target publishes; the daily rebuild turns it into a link.
      if (isUnpublishedContent(href)) return <span>{props.children}</span>;
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

/** "O*NET" contains a literal asterisk that Markdown would read as emphasis. */
export function protectLiterals(source: string): string {
  // Escape only in Markdown text lines; JSX lines (component tags and their string props) stay literal.
  return source
    .split("\n")
    .map((line) => (line.trimStart().startsWith("<") ? line.replace(/O\\\*NET/g, "O*NET") : line.replace(/O\*NET/g, "O\\*NET")))
    .join("\n");
}

export function Mdx({ source, citationKeys }: { source: string; citationKeys: string[] }) {
  return (
    <div className="prose-body">
      <MDXRemote
        source={protectLiterals(source)}
        components={buildComponents(citationKeys)}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  );
}
