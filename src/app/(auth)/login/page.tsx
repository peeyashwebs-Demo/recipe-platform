"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/lib/stores";

export default function LoginPage() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    addToast("Welcome back!", "success");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-[var(--accent-primary)] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Moxn
          </h1>
          <p className="text-sm text-[var(--fg-secondary)]">
            Welcome back to your digital cookbook
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-[var(--state-danger)] bg-[var(--state-danger)]/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--fg-muted)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[var(--accent-primary)] font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
