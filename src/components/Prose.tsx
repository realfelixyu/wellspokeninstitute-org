import type { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  // Same outer container as PageHeader, so the body text shares the heading's left edge on wide screens.
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="prose-body max-w-3xl">{children}</div>
    </div>
  );
}
