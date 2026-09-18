"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}) {
  const base =
    "inline-flex min-h-[52px] w-full items-center justify-center px-4 font-mono text-[14px] uppercase tracking-[0.08em] transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:translate-y-px disabled:opacity-40";
  const styles =
    variant === "primary"
      ? "nq-btn rounded-[8px] font-bold"
      : variant === "secondary"
        ? "rounded-[8px] border border-olive text-olive"
        : "text-olive underline";
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
