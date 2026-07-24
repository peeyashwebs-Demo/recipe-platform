"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore, useToastStore } from "@/lib/stores";
import type { Rating } from "@/types";

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="p-0.5 cursor-pointer"
        >
          <Star
            className={`w-6 h-6 transition-colors duration-[var(--duration-fast)] ${
              n <= (hovered || value)
                ? "fill-[var(--state-warning)] text-[var(--state-warning)]"
                : "text-[var(--border-default)]"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewSkeletonRow() {
  return (
    <div className="flex gap-3 py-4">
      <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 skeleton rounded" />
        <div className="h-3 w-24 skeleton rounded" />
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-2/3 skeleton rounded" />
      </div>
    </div>
  );
}

export default function Reviews({ recipeId }: { recipeId: string }) {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    let active = true;
    const fetchReviews = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("ratings")
        .select("*, author:profiles(display_name, avatar_url)")
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false });
      if (active) {
        setReviews((data as unknown as Rating[]) || []);
        setIsLoading(false);
      }
    };
    fetchReviews();
    return () => {
      active = false;
    };
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (score === 0) {
      addToast("Pick a star rating first", "warning");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ratings")
      .upsert(
        { user_id: user.id, recipe_id: recipeId, score, comment },
        { onConflict: "user_id,recipe_id" }
      )
      .select("*, author:profiles(display_name, avatar_url)")
      .single();

    setSubmitting(false);

    if (error) {
      addToast("Couldn't post your review — try again", "error");
      return;
    }

    setReviews((prev) => [
      data as unknown as Rating,
      ...prev.filter((r) => r.user_id !== user.id),
    ]);
    setComment("");
    setScore(0);
    addToast("Thanks for your feedback!", "success");
  };

  return (
    <div>
      <h3
        className="text-[var(--text-h3)] font-semibold text-[var(--fg-primary)] mb-1 flex items-center gap-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <MessageSquare className="w-5 h-5 text-[var(--accent-primary)]" />
        Feedback & Reviews
      </h3>
      <p className="text-sm text-[var(--fg-muted)] mb-6">
        {isLoading
          ? "Loading reviews…"
          : reviews.length === 0
          ? "Be the first to share how it turned out."
          : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
      </p>

      {/* Submit form — gated inline rather than blurred, since it's an action, not content */}
      {user ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 md:p-5 mb-6 space-y-3"
        >
          <StarPicker value={score} onChange={setScore} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How did it turn out? Any tweaks you made?"
            rows={3}
            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 resize-none"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:bg-[var(--accent-primary-hover)] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Posting…" : "Post review"}
          </motion.button>
        </form>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border-default)] p-4 mb-6 text-sm text-[var(--fg-secondary)]">
          <a href="/login" className="text-[var(--accent-primary)] font-medium hover:underline">
            Sign in
          </a>{" "}
          to leave a review.
        </div>
      )}

      {isLoading ? (
        <div className="divide-y divide-[var(--border-subtle)]">
          <ReviewSkeletonRow />
          <ReviewSkeletonRow />
        </div>
      ) : reviews.length === 0 ? null : (
        <AnimatePresence initial={false}>
          <div className="divide-y divide-[var(--border-subtle)]">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3 py-4"
              >
                <img
                  src={
                    review.author?.avatar_url ||
                    `https://api.dicebear.com/9.x/adventurer/svg?seed=${review.user_id}`
                  }
                  alt=""
                  className="w-10 h-10 rounded-full flex-shrink-0 bg-[var(--bg-surface)]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--fg-primary)]">
                      {review.author?.display_name || "MOXN cook"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-3.5 h-3.5 ${
                            n <= review.score
                              ? "fill-[var(--state-warning)] text-[var(--state-warning)]"
                              : "text-[var(--border-default)]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-[var(--fg-secondary)] mt-1 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
