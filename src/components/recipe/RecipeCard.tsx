"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Clock, Users, Star } from "lucide-react";
import Card from "@/components/ui/Card";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card variant="interactive" padding="none" className="overflow-hidden h-full">
        <div className="relative aspect-[4/3] bg-[var(--bg-surface)]">
          {recipe.cover_image_url ? (
            <img
              src={recipe.cover_image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--fg-muted)]">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-[var(--surface-1)]/80 backdrop-blur-sm transition-transform duration-[var(--duration-fast)] cursor-pointer hover:scale-110"
            aria-label={isSaved ? "Unsave recipe" : "Save recipe"}
          >
            <motion.div
              animate={isSaved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <Heart
                className={`w-4 h-4 transition-colors duration-[var(--duration-fast)] ${
                  isSaved
                    ? "fill-[var(--state-danger)] text-[var(--state-danger)]"
                    : "text-[var(--fg-secondary)]"
                }`}
              />
            </motion.div>
          </button>

          {recipe.difficulty && (
            <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-medium bg-[var(--surface-1)]/80 backdrop-blur-sm rounded-full text-[var(--fg-secondary)] capitalize">
              {recipe.difficulty}
            </span>
          )}
        </div>

        <div className="p-4">
          <h3
            className="font-semibold text-[var(--fg-primary)] mb-1 line-clamp-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {recipe.title}
          </h3>
          <p className="text-sm text-[var(--fg-secondary)] line-clamp-2 mb-3">
            {recipe.description}
          </p>

          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {recipe.prep_time_minutes + recipe.cook_time_minutes}m
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {recipe.serving_base}
              </span>
            </div>
            {recipe.rating_average > 0 && (
              <span className="flex items-center gap-1 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-[var(--state-warning)] text-[var(--state-warning)]" />
                {recipe.rating_average.toFixed(1)}
              </span>
            )}
          </div>

          {recipe.diet_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {recipe.diet_tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] font-medium bg-[var(--bg-surface)] text-[var(--fg-secondary)] rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
