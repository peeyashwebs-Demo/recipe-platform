"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  GripVertical,
  Plus,
  Trash2,
  Save,
  Eye,
  Clock,
  Image as ImageIcon,
  Send,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore, useToastStore } from "@/lib/stores";

interface StepDraft {
  id: string;
  text: string;
  timerSeconds: number;
  mediaUrl: string;
}

interface IngredientDraft {
  id: string;
  name: string;
  amount: number;
  unit: string;
  substitutions: string;
}

export default function NewRecipePage() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [dietTags, setDietTags] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "draft">("draft");
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([
    { id: "1", name: "", amount: 0, unit: "g", substitutions: "" },
  ]);
  const [steps, setSteps] = useState<StepDraft[]>([
    { id: "1", text: "", timerSeconds: 0, mediaUrl: "" },
  ]);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addIngredient = () =>
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: "", amount: 0, unit: "g", substitutions: "" },
    ]);

  const removeIngredient = (id: string) =>
    setIngredients(ingredients.filter((i) => i.id !== id));

  const updateIngredient = (id: string, field: keyof IngredientDraft, value: string | number) =>
    setIngredients(ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const addStep = () =>
    setSteps([...steps, { id: Date.now().toString(), text: "", timerSeconds: 0, mediaUrl: "" }]);

  const removeStep = (id: string) => setSteps(steps.filter((s) => s.id !== id));

  const updateStep = (id: string, field: keyof StepDraft, value: string | number) =>
    setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= steps.length) return;
    const newSteps = [...steps];
    const [moved] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, moved);
    setSteps(newSteps);
  };

  const handleSave = useCallback(async (asDraft = true) => {
    if (!profile || !title.trim()) {
      addToast("Please enter a recipe title", "warning");
      return;
    }

    setSaveState("saving");
    const supabase = createClient();

    const recipeData = {
      title: title.trim(),
      description: description.trim(),
      author_id: profile.id,
      status: asDraft ? "draft" : "published",
      prep_time_minutes: parseInt(prepTime) || 0,
      cook_time_minutes: parseInt(cookTime) || 0,
      serving_base: parseInt(servings) || 4,
      difficulty,
      diet_tags: dietTags.split(",").map((t) => t.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    let savedRecipeId = recipeId;

    if (recipeId) {
      await supabase.from("recipes").update(recipeData).eq("id", recipeId);
    } else {
      const { data } = await supabase
        .from("recipes")
        .insert({ ...recipeData, created_at: new Date().toISOString() })
        .select("id")
        .single();
      if (data) {
        savedRecipeId = data.id;
        setRecipeId(data.id);
      }
    }

    if (savedRecipeId) {
      await supabase.from("ingredients").delete().eq("recipe_id", savedRecipeId);
      await supabase.from("steps").delete().eq("recipe_id", savedRecipeId);

      const validIngredients = ingredients.filter((i) => i.name.trim());
      if (validIngredients.length > 0) {
        await supabase.from("ingredients").insert(
          validIngredients.map((ing, idx) => ({
            recipe_id: savedRecipeId,
            name: ing.name.trim(),
            amount: ing.amount,
            unit: ing.unit,
            substitutions: ing.substitutions.split(",").map((s) => s.trim()).filter(Boolean),
            order_index: idx,
          }))
        );
      }

      const validSteps = steps.filter((s) => s.text.trim());
      if (validSteps.length > 0) {
        await supabase.from("steps").insert(
          validSteps.map((step, idx) => ({
            recipe_id: savedRecipeId,
            step_number: idx + 1,
            text: step.text.trim(),
            media_url: step.mediaUrl || null,
            timer_seconds: step.timerSeconds || null,
          }))
        );
      }
    }

    setSaveState("saved");
    addToast(asDraft ? "Draft saved!" : "Recipe published!", "success");

    if (!asDraft && savedRecipeId) {
      router.push(`/recipes/${savedRecipeId}`);
    }
  }, [profile, title, description, prepTime, cookTime, servings, difficulty, dietTags, ingredients, steps, recipeId, addToast, router]);

  useEffect(() => {
    if (saveState === "draft" && title.trim()) {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        handleSave(true);
      }, 10000);
    }
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [title, description, ingredients, steps, saveState, handleSave]);

  const handleKeyDown = (e: React.KeyboardEvent, stepId: string) => {
    const idx = steps.findIndex((s) => s.id === stepId);
    if (e.altKey && e.key === "ArrowUp") {
      e.preventDefault();
      moveStep(idx, idx - 1);
    } else if (e.altKey && e.key === "ArrowDown") {
      e.preventDefault();
      moveStep(idx, idx + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 sticky top-16 z-10 bg-[var(--bg-base)] py-3 border-b border-[var(--border-subtle)]">
        <h1
          className="text-[var(--text-h3)] font-bold text-[var(--fg-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          New Recipe
        </h1>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              saveState === "saved"
                ? "bg-[var(--state-success)]/10 text-[var(--state-success)]"
                : saveState === "saving"
                ? "bg-[var(--state-warning)]/10 text-[var(--state-warning)]"
                : "bg-[var(--bg-surface)] text-[var(--fg-muted)]"
            }`}
          >
            {saveState === "saved"
              ? "Saved"
              : saveState === "saving"
              ? "Saving..."
              : "Unsaved draft"}
          </span>
          <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => handleSave(true)}>
            Save Draft
          </Button>
          <Button size="sm" icon={<Send className="w-4 h-4" />} onClick={() => handleSave(false)}>
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <Input
                label="Recipe Title"
                placeholder="e.g. Tuscan Chicken Pasta"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setSaveState("draft"); }}
              />
              <div>
                <label className="block text-sm font-medium text-[var(--fg-primary)] mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="A brief description of your recipe..."
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setSaveState("draft"); }}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input label="Prep Time (min)" type="number" placeholder="15" value={prepTime} onChange={(e) => { setPrepTime(e.target.value); setSaveState("draft"); }} />
                <Input label="Cook Time (min)" type="number" placeholder="25" value={cookTime} onChange={(e) => { setCookTime(e.target.value); setSaveState("draft"); }} />
                <Input label="Servings" type="number" placeholder="4" value={servings} onChange={(e) => { setServings(e.target.value); setSaveState("draft"); }} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--fg-primary)] mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => { setDifficulty(e.target.value); setSaveState("draft"); }}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--fg-primary)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <Input
                label="Diet Tags (comma separated)"
                placeholder="e.g. Vegetarian, Gluten-Free"
                value={dietTags}
                onChange={(e) => { setDietTags(e.target.value); setSaveState("draft"); }}
              />
            </div>
          </Card>

          {/* Ingredients */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold text-[var(--fg-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ingredients
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={addIngredient}
              >
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {ingredients.map((ing) => (
                <div key={ing.id} className="flex items-start gap-2">
                  <div className="flex-1 grid grid-cols-6 gap-2">
                    <input
                      placeholder="Name"
                      value={ing.name}
                      onChange={(e) => { updateIngredient(ing.id, "name", e.target.value); setSaveState("draft"); }}
                      className="col-span-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--fg-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={ing.amount || ""}
                      onChange={(e) => { updateIngredient(ing.id, "amount", parseFloat(e.target.value) || 0); setSaveState("draft"); }}
                      className="col-span-1 rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--fg-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 tabular-nums"
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => { updateIngredient(ing.id, "unit", e.target.value); setSaveState("draft"); }}
                      className="col-span-1 rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--fg-primary)] px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">L</option>
                      <option value="tsp">tsp</option>
                      <option value="tbsp">tbsp</option>
                      <option value="cup">cup</option>
                      <option value="pcs">pcs</option>
                    </select>
                    <button
                      onClick={() => removeIngredient(ing.id)}
                      className="col-span-1 p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--state-danger)] hover:bg-[var(--state-danger)]/10 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold text-[var(--fg-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Preparation Steps
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={addStep}
              >
                Add Step
              </Button>
            </div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3"
                  onKeyDown={(e) => handleKeyDown(e, step.id)}
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveStep(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 rounded text-[var(--fg-muted)] hover:text-[var(--fg-primary)] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move step up"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={() => removeStep(step.id)}
                      className="p-1 rounded text-[var(--fg-muted)] hover:text-[var(--state-danger)] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Describe this step..."
                    value={step.text}
                    onChange={(e) => { updateStep(step.id, "text", e.target.value); setSaveState("draft"); }}
                    rows={3}
                    className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all resize-none"
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                      <Clock className="w-4 h-4" />
                      <input
                        type="number"
                        placeholder="Timer (sec)"
                        value={step.timerSeconds || ""}
                        onChange={(e) => { updateStep(step.id, "timerSeconds", parseInt(e.target.value) || 0); setSaveState("draft"); }}
                        className="w-24 rounded border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--fg-primary)] px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20"
                      />
                    </div>
                    <button className="flex items-center gap-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg-primary)] cursor-pointer">
                      <ImageIcon className="w-4 h-4" />
                      Add media
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--fg-muted)]">
                    Alt+Arrow keys to reorder
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
