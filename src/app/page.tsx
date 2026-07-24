import { Suspense } from "react";
import Link from "next/link";
import HeroSection from "@/components/layout/HeroSection";
import Feedback from "@/components/layout/Feedback";
import GatedContent from "@/components/recipe/GatedContent";
import RecipeCard from "@/components/recipe/RecipeCard";
import RecipeCardSkeleton from "@/components/ui/RecipeCardSkeleton";
import { createClient } from "@/lib/supabase/server";
import type { Recipe } from "@/types";

async function getFeaturedRecipes(): Promise<Recipe[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("*")
    .eq("status", "published")
    .order("rating_count", { ascending: false })
    .limit(6);

  if (!data) return [];

  return data.map((r) => ({
    ...r,
    ingredients: [],
    steps: [],
    diet_tags: Array.isArray(r.diet_tags) ? r.diet_tags : [],
  }));
}

export default async function HomePage() {
  const featured = await getFeaturedRecipes();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-10">
      <Suspense fallback={<div className="h-[420px] skeleton rounded-2xl" />}>
        <HeroSection />
      </Suspense>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-[var(--text-h2)] font-bold text-[var(--fg-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Trending This Week
          </h2>
          <Link
            href="/recipes"
            className="text-sm font-medium text-[var(--accent-primary)] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.length > 0 ? (
            featured.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            Array.from({ length: 6 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[#a04020] text-white">
          <h3
            className="text-[var(--text-h3)] font-bold mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Start Creating
          </h3>
          <p className="text-sm opacity-90 mb-5 max-w-md">
            Share your recipes with the world. Our builder makes it easy to
            create beautiful, structured recipes with media, timers, and smart
            ingredient scaling.
          </p>
          <Link
            href="/creator/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[var(--accent-primary)] font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            Create Recipe
          </Link>
        </div>
        <div className="p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-subtle)]">
          <h3
            className="text-[var(--text-h3)] font-bold text-[var(--fg-primary)] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Cooking Mode
          </h3>
          <p className="text-sm text-[var(--fg-secondary)] mb-4">
            Hands-free, step-by-step cooking with voice commands and screen wake
            lock. Perfect for messy kitchen hands.
          </p>
          <div className="flex items-center gap-3 text-xs text-[var(--fg-muted)]">
            <span className="px-2 py-1 rounded-full bg-[var(--bg-surface)]">Voice Nav</span>
            <span className="px-2 py-1 rounded-full bg-[var(--bg-surface)]">Offline</span>
            <span className="px-2 py-1 rounded-full bg-[var(--bg-surface)]">Timers</span>
          </div>
        </div>
      </section>
      <section>
        <div className="flex items-center gap-3 mb-5">
          <span className="h-px w-8 bg-[var(--accent-primary)]" />
          <span className="text-xs tracking-[0.2em] uppercase text-[var(--fg-secondary)]">
            Members only
          </span>
        </div>
        <GatedContent
          title="See this week's creator spotlight"
          message="Sign in to view curated tips from featured creators, seasonal ingredient notes, and early access to new recipes before they go public."
        >
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-8 grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-[var(--fg-primary)] mb-1">This week&apos;s technique</h4>
              <p className="text-sm text-[var(--fg-secondary)]">How Chef Mox gets a silky lentil curry every time — the two-stage spice bloom.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--fg-primary)] mb-1">In season now</h4>
              <p className="text-sm text-[var(--fg-secondary)]">Blood oranges are peaking — three ways to use them beyond juice.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--fg-primary)] mb-1">Early access</h4>
              <p className="text-sm text-[var(--fg-secondary)]">Preview three recipes going public next week, before anyone else sees them.</p>
            </div>
          </div>
        </GatedContent>
      </section>

      <Feedback />
    </div>
  );
}
