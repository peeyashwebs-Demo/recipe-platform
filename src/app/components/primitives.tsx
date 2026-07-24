import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { motion } from "motion/react";

// Simulates a brief backend fetch so shimmer states are visible.
export function useLoading(delay = 850, deps: unknown[] = []) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return loading;
}

// ---- Shimmer skeleton ----
export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-muted/70 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <Shimmer className="aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-3">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-5 w-full" />
        <Shimmer className="h-5 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Shimmer className="h-6 w-16 rounded-full" />
          <Shimmer className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ---- Star rating (display + interactive) ----
export function Stars({
  value,
  size = 16,
  onChange,
  className = "",
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
  className?: string;
}) {
  const interactive = !!onChange;
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i - 0.25;
        const half = !filled && value >= i - 0.75;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i)}
            className={interactive ? "cursor-pointer transition-transform hover:scale-125" : "cursor-default"}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
          >
            <Star
              style={{ width: size, height: size }}
              className={
                filled || half
                  ? "fill-primary text-primary"
                  : "fill-transparent text-muted-foreground/40"
              }
            />
          </button>
        );
      })}
    </div>
  );
}

// ---- Section reveal on scroll ----
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
