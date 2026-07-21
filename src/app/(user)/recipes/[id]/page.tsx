"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  Users,
  ChefHat,
  Star,
  ArrowLeft,
  Play,
  Share2,
  Heart,
} from "lucide-react";
import Card from "@/components/ui/Card";
import IngredientScale from "@/components/recipe/IngredientScale";
import CookingMode from "@/components/recipe/CookingMode";
import RecipeCardSkeleton from "@/components/ui/RecipeCardSkeleton";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/lib/stores";
import type { Recipe, Ingredient, Step } from "@/types";

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      const supabase = createClient();

      const { data: recipeData } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (!recipeData) {
        setIsLoading(false);
        return;
      }

      const [ingredientsRes, stepsRes] = await Promise.all([
        supabase
          .from("ingredients")
          .select("*")
          .eq("recipe_id", id)
          .order("order_index"),
        supabase
          .from("steps")
          .select("*")
          .eq("recipe_id", id)
          .order("step_number"),
      ]);

      setRecipe({
        ...recipeData,
        ingredients: ingredientsRes.data || [],
        steps: stepsRes.data || [],
        diet_tags: Array.isArray(recipeData.diet_tags) ? recipeData.diet_tags : [],
      });
      setIngredients(ingredientsRes.data || []);
      setSteps(stepsRes.data || []);
      setIsLoading(false);
    };

    fetchRecipe();
  }, [id]);

  const handleSave = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addToast("Please sign in to save recipes", "warning");
      return;
    }
    setIsSaved(!isSaved);
    addToast(isSaved ? "Removed from saved" : "Saved to favorites!", "success");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
        <div className="h-6 w-20 skeleton rounded-lg" />
        <div className="aspect-[16/7] skeleton rounded-2xl" />
        <div className="h-10 w-3/4 skeleton rounded-lg" />
        <div className="h-4 w-full skeleton rounded-lg" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 text-center">
        <ChefHat className="w-16 h-16 text-[var(--fg-muted)] mx-auto mb-4" />
        <p className="text-lg text-[var(--fg-secondary)]">Recipe not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-[var(--accent-primary)] hover:underline cursor-pointer"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Hero image */}
        <div className="relative aspect-[16/7] rounded-2xl bg-[var(--bg-surface)] overflow-hidden">
          {recipe.cover_image_url ? (
            <img
              src={recipe.cover_image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-20 h-20 text-[var(--fg-muted)] opacity-30" />
            </div>
          )}
        </div>

        {/* Title & meta */}
        <div>
          <h1
            className="text-[var(--text-display)] font-bold text-[var(--fg-primary)] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {recipe.title}
          </h1>
          <p className="text-[var(--text-body)] text-[var(--fg-secondary)] mb-5">
            {recipe.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--fg-muted)]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {recipe.prep_time_minutes + recipe.cook_time_minutes} min total
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {recipe.serving_base} servings
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-[var(--state-warning)] text-[var(--state-warning)]" />
              {recipe.rating_average} ({recipe.rating_count})
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-xs capitalize">
              {recipe.difficulty}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.diet_tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-[var(--bg-surface)] text-[var(--fg-secondary)] rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCookingMode(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-semibold text-sm hover:bg-[var(--accent-primary-hover)] transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4" />
            Start Cooking
          </motion.button>
          <button
            onClick={handleSave}
            className="p-3 rounded-xl border border-[var(--border-default)] text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-[var(--state-danger)] text-[var(--state-danger)]" : ""}`} />
          </button>
          <button className="p-3 rounded-xl border border-[var(--border-default)] text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <Card>
            <IngredientScale
              ingredients={ingredients}
              servingBase={recipe.serving_base}
            />
          </Card>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div>
            <h3
              className="text-[var(--text-h3)] font-semibold text-[var(--fg-primary)] mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Instructions
            </h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex gap-4 p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)]"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--fg-primary)] leading-relaxed">
                      {step.text}
                    </p>
                    {step.timer_seconds && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-[var(--fg-muted)]">
                        <Clock className="w-3 h-3" />
                        ~{Math.ceil(step.timer_seconds / 60)} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCookingMode && steps.length > 0 && (
        <CookingMode
          steps={steps}
          recipeTitle={recipe.title}
          onClose={() => setShowCookingMode(false)}
        />
      )}
    </>
  );
}
