"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale } from "lucide-react";
import type { Ingredient, UnitSystem } from "@/types";
import { useRecipeStore } from "@/lib/stores";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores";

const metricToImperial: Record<string, { factor: number; unit: string }> = {
  g: { factor: 0.03527, unit: "oz" },
  kg: { factor: 2.205, unit: "lb" },
  ml: { factor: 0.0338, unit: "fl oz" },
  l: { factor: 1.057, unit: "qt" },
  tsp: { factor: 0.333, unit: "tbsp" },
  tbsp: { factor: 0.5, unit: "fl oz" },
};

const imperialToMetric: Record<string, { factor: number; unit: string }> = {
  oz: { factor: 28.35, unit: "g" },
  lb: { factor: 0.4536, unit: "kg" },
  "fl oz": { factor: 29.57, unit: "ml" },
  qt: { factor: 0.9464, unit: "l" },
  tbsp: { factor: 3, unit: "tsp" },
};

function formatAmount(amount: number): string {
  if (amount === 0) return "0";
  if (amount >= 1 && amount % 1 === 0) return amount.toString();

  const whole = Math.floor(amount);
  const frac = amount - whole;

  const fractions: [number, string][] = [
    [0.25, "\u00BC"],
    [0.333, "\u2153"],
    [0.5, "\u00BD"],
    [0.667, "\u2154"],
    [0.75, "\u00BE"],
  ];

  for (const [val, symbol] of fractions) {
    if (Math.abs(frac - val) < 0.05) {
      return whole > 0 ? `${whole} ${symbol}` : symbol;
    }
  }

  return amount.toFixed(1);
}

interface IngredientScaleProps {
  ingredients: Ingredient[];
  servingBase: number;
}

export default function IngredientScale({
  ingredients,
  servingBase,
}: IngredientScaleProps) {
  const { unitSystem, setUnitSystem } = useRecipeStore();
  const { profile } = useAuthStore();
  const [scale, setScale] = useState(1);

  const toggleUnitSystem = useCallback(async () => {
    const newSystem = unitSystem === "metric" ? "imperial" : "metric";
    setUnitSystem(newSystem);

    if (profile) {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ unit_preference: newSystem })
        .eq("id", profile.id);
    }
  }, [unitSystem, setUnitSystem, profile]);

  const displayIngredients = useMemo(() => {
    return ingredients.map((ing) => {
      let amount = ing.amount * scale;
      let unit = ing.unit;

      if (unitSystem === "imperial" && metricToImperial[ing.unit]) {
        const conv = metricToImperial[ing.unit];
        amount *= conv.factor;
        unit = conv.unit;
      } else if (unitSystem === "metric" && imperialToMetric[ing.unit]) {
        const conv = imperialToMetric[ing.unit];
        amount *= conv.factor;
        unit = conv.unit;
      }

      return { ...ing, displayAmount: amount, displayUnit: unit };
    });
  }, [ingredients, scale, unitSystem]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[var(--text-h3)] font-semibold text-[var(--fg-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ingredients
        </h3>
        <button
          onClick={toggleUnitSystem}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg-surface)] text-[var(--fg-secondary)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
        >
          <Scale className="w-3.5 h-3.5" />
          {unitSystem === "metric" ? "Metric" : "Imperial"}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5 p-3 bg-[var(--bg-surface)] rounded-lg">
        <span className="text-sm text-[var(--fg-secondary)]">Servings:</span>
        <div className="flex items-center gap-2">
          {[0.5, 1, 1.5, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`px-3 py-1 text-sm rounded-md transition-all duration-[var(--duration-fast)] tabular-nums cursor-pointer
                ${scale === s ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--surface-1)] text-[var(--fg-secondary)] hover:bg-[var(--border-subtle)]"}`}
            >
              {Math.round(servingBase * s)}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-1">
        <AnimatePresence mode="popLayout">
          {displayIngredients.map((ing) => (
            <motion.li
              key={ing.id}
              layout
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] flex-shrink-0" />
              <span className="flex-1 text-sm text-[var(--fg-primary)]">
                {ing.name}
                {ing.substitutions.length > 0 && (
                  <span className="text-xs text-[var(--fg-muted)] ml-2">
                    ({ing.substitutions[0]})
                  </span>
                )}
              </span>
              <span className="text-sm font-medium text-[var(--fg-secondary)] tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
                {formatAmount(ing.displayAmount)} {ing.displayUnit}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
