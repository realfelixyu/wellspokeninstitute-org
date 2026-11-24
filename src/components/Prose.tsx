import type { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return <div className="prose-body mx-auto max-w-3xl px-4 py-12 sm:px-6">{children}</div>;
}
