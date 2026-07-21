"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToastStore } from "@/lib/stores";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: "text-[var(--state-success)]",
  error: "text-[var(--state-danger)]",
  info: "text-[var(--accent-primary)]",
  warning: "text-[var(--state-warning)]",
};

function ToastItem({
  id,
  message,
  type,
  duration = 4000,
}: {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}) {
  const removeToast = useToastStore((s) => s.removeToast);
  const Icon = icons[type];
  const [isPaused, setIsPaused] = useState(false);
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => removeToast(id), remaining);
    return () => clearTimeout(timer);
  }, [id, remaining, isPaused, removeToast]);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center gap-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] rounded-lg px-4 py-3 min-w-[300px] max-w-[500px] backdrop-blur-sm overflow-hidden"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${colors[type]}`} />
      <p className="text-sm text-[var(--fg-primary)] flex-1">{message}</p>
      <button
        onClick={() => removeToast(id)}
        className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
      {/* Timer bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${
          type === "success"
            ? "bg-[var(--state-success)]"
            : type === "error"
            ? "bg-[var(--state-danger)]"
            : type === "warning"
            ? "bg-[var(--state-warning)]"
            : "bg-[var(--accent-primary)]"
        }`}
        initial={{ width: "100%" }}
        animate={{ width: isPaused ? undefined : "0%" }}
        transition={
          isPaused
            ? { duration: 0 }
            : { duration: remaining / 1000, ease: "linear" }
        }
      />
    </motion.div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 md:bottom-6 md:left-auto md:translate-x-0 md:right-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
