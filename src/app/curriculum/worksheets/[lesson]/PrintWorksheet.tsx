"use client";

export function PrintWorksheet() {
  return <button type="button" onClick={() => window.print()}>Print worksheet</button>;
}
