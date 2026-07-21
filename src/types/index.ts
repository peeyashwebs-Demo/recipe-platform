export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: "user" | "creator" | "admin";
  unit_preference: "metric" | "imperial";
  created_at: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  author_id: string;
  author?: User;
  status: "draft" | "published" | "flagged" | "archived";
  prep_time_minutes: number;
  cook_time_minutes: number;
  serving_base: number;
  difficulty: "easy" | "medium" | "hard";
  diet_tags: string[];
  rating_average: number;
  rating_count: number;
  ingredients: Ingredient[];
  steps: Step[];
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;
  amount: number;
  unit: string;
  substitutions: string[];
  order_index: number;
}

export interface Step {
  id: string;
  recipe_id: string;
  step_number: number;
  text: string;
  media_url?: string;
  timer_seconds?: number;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  recipe_ids: string[];
  created_at: string;
}

export interface Rating {
  id: string;
  user_id: string;
  recipe_id: string;
  score: number;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin?: User;
  action: string;
  target_type: "recipe" | "user" | "collection";
  target_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface FlaggedContent {
  id: string;
  recipe_id: string;
  recipe?: Recipe;
  reason: string;
  reported_by: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: string;
}

export type UnitSystem = "metric" | "imperial";

export interface CookingModeState {
  recipeId: string;
  currentStep: number;
  isVoiceEnabled: boolean;
  isFullscreen: boolean;
}
