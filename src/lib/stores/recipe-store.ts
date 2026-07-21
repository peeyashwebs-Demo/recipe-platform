import { create } from "zustand";
import type { Recipe, UnitSystem } from "@/types";

interface RecipeState {
  recipes: Recipe[];
  featuredRecipes: Recipe[];
  trendingRecipes: Recipe[];
  selectedRecipe: Recipe | null;
  unitSystem: UnitSystem;
  searchQuery: string;
  isLoading: boolean;
  setRecipes: (recipes: Recipe[]) => void;
  setFeaturedRecipes: (recipes: Recipe[]) => void;
  setTrendingRecipes: (recipes: Recipe[]) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setUnitSystem: (unit: UnitSystem) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  featuredRecipes: [],
  trendingRecipes: [],
  selectedRecipe: null,
  unitSystem: "metric",
  searchQuery: "",
  isLoading: false,
  setRecipes: (recipes) => set({ recipes }),
  setFeaturedRecipes: (recipes) => set({ featuredRecipes: recipes }),
  setTrendingRecipes: (recipes) => set({ trendingRecipes: recipes }),
  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),
  setUnitSystem: (unitSystem) => set({ unitSystem }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
}));
