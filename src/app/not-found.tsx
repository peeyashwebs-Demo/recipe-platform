import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p
          className="text-[var(--text-display)] font-bold text-[var(--accent-primary)]/20 mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          404
        </p>
        <h2
          className="text-[var(--text-h2)] font-bold text-[var(--fg-primary)] mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Recipe not found
        </h2>
        <p className="text-sm text-[var(--fg-secondary)] mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
