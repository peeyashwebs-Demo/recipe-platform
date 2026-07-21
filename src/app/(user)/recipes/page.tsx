"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import RecipeCard from "@/components/recipe/RecipeCard";
import RecipeCardSkeleton from "@/components/ui/RecipeCardSkeleton";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/types";

const allDietTags = ["Italian", "Vegan", "Vegetarian", "Gluten-Free", "High Protein", "Japanese", "Indian", "No-Cook"];
const allDifficulties = ["easy", "medium", "hard"];

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [search, setSearch] = useState(initialQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      const supabase = createClient();
      let query = supabase
        .from("recipes")
        .select("*")
        .eq("status", "published")
        .order("rating_count", { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (selectedTags.length > 0) {
        query = query.overlaps("diet_tags", selectedTags);
      }

      if (selectedDifficulty) {
        query = query.eq("difficulty", selectedDifficulty);
      }

      const { data } = await query;
      setRecipes(
        (data || []).map((r) => ({
          ...r,
          ingredients: [],
          steps: [],
          diet_tags: Array.isArray(r.diet_tags) ? r.diet_tags : [],
        }))
      );
      setIsLoading(false);
    };

    fetchRecipes();
  }, [search, selectedTags, selectedDifficulty]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-[var(--text-h2)] font-bold text-[var(--fg-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Recipes
          </h1>
          <p className="text-sm text-[var(--fg-secondary)] mt-1">
            {recipes.length} recipes found
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 md:w-80">
            <Input
              showSearch
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2.5 rounded-lg border border-[var(--border-default)] text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer md:hidden"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar — desktop */}
        <aside className={`w-64 flex-shrink-0 ${showFilters ? "block" : "hidden"} md:block`}>
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--fg-primary)] mb-3">
                Diet Tags
              </h3>
              <div className="space-y-2">
                {allDietTags.map((tag) => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={(e) =>
                        setSelectedTags(
                          e.target.checked
                            ? [...selectedTags, tag]
                            : selectedTags.filter((t) => t !== tag)
                        )
                      }
                      className="rounded border-[var(--border-default)] accent-[var(--accent-primary)]"
                    />
                    <span className="text-sm text-[var(--fg-secondary)]">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--fg-primary)] mb-3">
                Difficulty
              </h3>
              <div className="space-y-2">
                {allDifficulties.map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      checked={selectedDifficulty === d}
                      onChange={() =>
                        setSelectedDifficulty(selectedDifficulty === d ? "" : d)
                      }
                      className="accent-[var(--accent-primary)]"
                    />
                    <span className="text-sm text-[var(--fg-secondary)] capitalize">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            {(selectedTags.length > 0 || selectedDifficulty) && (
              <button
                onClick={() => {
                  setSelectedTags([]);
                  setSelectedDifficulty("");
                }}
                className="flex items-center gap-1 text-sm text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
          </div>
        </aside>

        {/* Recipe grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <RecipeCardSkeleton key={i} />
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-[var(--fg-secondary)]">No recipes found</p>
              <p className="text-sm text-[var(--fg-muted)] mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
