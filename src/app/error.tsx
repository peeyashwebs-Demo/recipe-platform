"use client";

import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2
          className="text-[var(--text-h2)] font-bold text-[var(--fg-primary)] mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--fg-secondary)] mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
