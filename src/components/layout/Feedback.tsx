"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star, Send } from "lucide-react";
import { useAuthStore, useToastStore } from "@/lib/stores";
import { createClient } from "@/lib/supabase/client";

interface Testimonial {
  id: string;
  author: string;
  role: string;
  quote: string;
  rating: number;
  avatar_seed: string;
}

function TestimonialSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-7">
      <div className="h-3 w-16 skeleton rounded mb-5" />
      <div className="space-y-2 mb-6">
        <div className="h-3.5 w-full skeleton rounded" />
        <div className="h-3.5 w-full skeleton rounded" />
        <div className="h-3.5 w-2/3 skeleton rounded" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 skeleton rounded" />
          <div className="h-2.5 w-16 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export default function Feedback() {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(
    null
  );
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("platform_feedback")
        .select("id, author, role, quote, rating, avatar_seed")
        .order("created_at", { ascending: false })
        .limit(6);
      if (!cancelled) setTestimonials(data ?? []);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      await supabase.from("platform_feedback").insert({
        user_id: user?.id,
        quote: comment.trim(),
        rating,
      });
      setComment("");
      addToast(
        "Thanks — your feedback helps us improve the cookbook.",
        "success"
      );
    } catch {
      addToast("Couldn't submit feedback. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-4">
      <div className="flex items-center gap-3 mb-8">
        <span className="h-px w-8 bg-[var(--accent-primary)]" />
        <span className="text-xs tracking-[0.2em] uppercase text-[var(--fg-secondary)]">
          What people are saying
        </span>
      </div>

      <h2
        className="text-[var(--text-h2)] font-normal text-[var(--fg-primary)] mb-10 max-w-xl leading-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Trusted by home cooks and{" "}
        <span className="italic text-[var(--accent-primary)]">
          professional creators
        </span>{" "}
        alike.
      </h2>

      {testimonials === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <TestimonialSkeleton key={i} />
          ))}
        </div>
      ) : testimonials.length > 0 ? (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12"
        >
          {testimonials.map((t) => (
            <motion.figure
              key={t.id}
              variants={item}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-7 hover:shadow-[var(--shadow-md)] transition-shadow duration-[var(--duration-base)]"
            >
              <Quote className="w-5 h-5 text-[var(--accent-primary)]/40 mb-4" />
              <blockquote className="text-[15px] text-[var(--fg-primary)] leading-relaxed mb-6">
                “{t.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
                    t.avatar_seed
                  )}`}
                  alt=""
                  className="w-9 h-9 rounded-full flex-shrink-0 bg-[var(--bg-surface)]"
                />
                <div>
                  <div className="text-sm font-semibold text-[var(--fg-primary)]">
                    {t.author}
                  </div>
                  <div className="text-xs text-[var(--fg-muted)]">
                    {t.role}
                  </div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < t.rating
                          ? "fill-[var(--state-warning)] text-[var(--state-warning)]"
                          : "text-[var(--border-default)]"
                      }`}
                    />
                  ))}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      ) : null}

      {/* Leave feedback */}
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-7 md:p-9 max-w-2xl">
        <h3
          className="text-[var(--text-h3)] font-normal text-[var(--fg-primary)] mb-1.5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Tell us what you think
        </h3>
        <p className="text-sm text-[var(--fg-secondary)] mb-6">
          Your feedback shapes what we build next.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onClick={() => setRating(n)}
                className="p-0.5"
              >
                <Star
                  className={`w-5 h-5 transition-colors duration-[var(--duration-fast)] ${
                    n <= rating
                      ? "fill-[var(--state-warning)] text-[var(--state-warning)]"
                      : "text-[var(--border-default)]"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What's working well? What would you like to see?"
            rows={3}
            className="w-full px-4 py-3 rounded-md border border-[var(--border-default)] bg-transparent text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors duration-[var(--duration-base)] resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--accent-primary)] text-white text-sm font-semibold hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-[var(--duration-base)]"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Sending…" : "Send feedback"}
          </button>
        </form>
      </div>
    </section>
  );
}
