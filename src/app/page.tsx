import { Suspense } from "react";
import HeroSection from "@/components/layout/HeroSection";
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
          <a
            href="/recipes"
            className="text-sm font-medium text-[var(--accent-primary)] hover:underline"
          >
            View all
          </a>
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
          <a
            href="/creator/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[var(--accent-primary)] font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            Create Recipe
          </a>
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
    </div>
  );
}
