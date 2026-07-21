"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import RecipeCard from "@/components/recipe/RecipeCard";
import RecipeCardSkeleton from "@/components/ui/RecipeCardSkeleton";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores";
import type { Recipe, Collection } from "@/types";

export default function CollectionsPage() {
  const { profile } = useAuthStore();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionRecipes, setCollectionRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!profile) return;
      const supabase = createClient();

      const { data } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (data) {
        setCollections(data);

        const allRecipeIds = data.flatMap((c) => c.recipe_ids || []);
        if (allRecipeIds.length > 0) {
          const { data: recipes } = await supabase
            .from("recipes")
            .select("*")
            .in("id", allRecipeIds);

          if (recipes) {
            setCollectionRecipes(
              recipes.map((r) => ({
                ...r,
                ingredients: [],
                steps: [],
                diet_tags: Array.isArray(r.diet_tags) ? r.diet_tags : [],
              }))
            );
          }
        }
      }
      setIsLoading(false);
    };

    fetchCollections();
  }, [profile]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-[var(--text-h2)] font-bold text-[var(--fg-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            My Cookbook
          </h1>
          <p className="text-sm text-[var(--fg-secondary)] mt-1">
            Your saved recipes and collections
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary-hover)] transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Quick access */}
          {collections.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {collections.map((col) => (
                <Card key={col.id} variant="interactive" className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--fg-primary)]">{col.name}</p>
                    <p className="text-xs text-[var(--fg-muted)]">{col.recipe_ids?.length || 0} recipes</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {collectionRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {collectionRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-[var(--fg-muted)] mx-auto mb-3" />
              <p className="text-lg text-[var(--fg-secondary)]">No saved recipes yet</p>
              <p className="text-sm text-[var(--fg-muted)] mt-1">
                Browse recipes and save your favorites here
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
