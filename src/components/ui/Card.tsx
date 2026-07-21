"use client";

import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  children,
  className = "",
  variant = "default",
  padding = "md",
  ...props
}: CardProps) {
  const variants = {
    default: "bg-[var(--surface-1)] border border-[var(--border-subtle)]",
    elevated:
      "bg-[var(--surface-1)] border border-[var(--border-subtle)] shadow-[var(--shadow-md)]",
    interactive:
      "bg-[var(--surface-1)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-[var(--duration-base)] cursor-pointer",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-7",
  };

  return (
    <div
      className={`rounded-xl ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
