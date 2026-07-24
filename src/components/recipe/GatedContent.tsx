"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/lib/stores";

interface GatedContentProps {
  children: React.ReactNode;
  title?: string;
  message?: string;
}

/**
 * Wraps content that should only be fully visible to signed-in users.
 * Renders children normally when authenticated; otherwise shows a
 * softly blurred preview with a classic, understated unlock prompt.
 */
export default function GatedContent({
  children,
  title = "Sign in to continue reading",
  message = "Create a free account to view the complete recipe, save it to a collection, and follow along in Cooking Mode.",
}: GatedContentProps) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return <div className="h-32 skeleton rounded-xl" />;
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none select-none blur-[6px] opacity-50"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)]/95 backdrop-blur-md shadow-[var(--shadow-lg)] p-6 text-center"
        >
          <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <h4
            className="text-[var(--text-h3)] font-semibold text-[var(--fg-primary)] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h4>
          <p className="text-sm text-[var(--fg-secondary)] leading-relaxed mb-5">
            {message}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-semibold hover:bg-[var(--accent-primary-hover)] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="w-full py-2.5 rounded-xl border border-[var(--border-default)] text-[var(--fg-primary)] text-sm font-medium hover:bg-[var(--bg-surface)] transition-colors"
            >
              Create free account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
