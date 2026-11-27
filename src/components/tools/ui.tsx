"use client";

import type { ReactNode } from "react";

export function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-rule bg-card p-5 sm:p-7">{children}</div>;
}

export function TextArea({
  value,
  onChange,
  label,
  placeholder,
  rows = 8,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-rule bg-paper px-3 py-2.5 text-[0.98rem] leading-relaxed text-ink placeholder:text-ink-3"
      />
    </label>
  );
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-rule bg-paper px-4 py-3">
      <div className="font-serif text-2xl font-semibold text-accent">{value}</div>
      <div className="mt-0.5 text-sm text-ink-2">{label}</div>
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        variant === "primary"
          ? "h-11 rounded-lg bg-accent px-5 font-medium text-accent-ink hover:opacity-90 disabled:opacity-50"
          : "h-11 rounded-lg border border-rule bg-paper px-5 text-ink hover:border-accent disabled:opacity-50"
      }
    >
      {children}
    </button>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <span className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-11 w-full cursor-pointer accent-[var(--accent)]"
        />
        <span className="w-24 shrink-0 text-right text-sm text-ink">
          {value}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </span>
    </label>
  );
}

export const SAMPLE_SCRIPT =
  "Thank you all for being here. Today I want to share one idea: clear speaking is a skill you can practice, not a talent you are born with. In the next few minutes, I will show you three habits that make any talk easier to follow. First, lead with your point. Second, pause after every important sentence. Third, end by telling people exactly what to do next.";
