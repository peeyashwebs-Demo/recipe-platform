import { Link } from "react-router";
import { motion } from "motion/react";
import { Bookmark, Clock, Flame } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Stars } from "./primitives";
import { useStore } from "../store";
import { useAuthUI } from "./auth-ui";
import { img, type Recipe } from "../data/seed";
import { toast } from "sonner";

export function RecipeCard({ recipe, index = 0 }: { recipe: Recipe; index?: number }) {
  const { ratingFor, userById, isSaved, toggleSave } = useStore();
  const { requireAuth } = useAuthUI();
  const rating = ratingFor(recipe.id);
  const creator = userById(recipe.creatorId);
  const saved = isSaved(recipe.id);
  const total = recipe.prepMinutes + recipe.cookMinutes;

  const onSave = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(() => {
      toggleSave(recipe.id);
      toast(saved ? "Removed from saved" : "Saved to your recipes", {
        description: recipe.title,
      });
    }, "Sign in to save recipes to your collections.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/recipe/${recipe.id}`}
        className="group block rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 hover:shadow-[0_18px_50px_-20px_rgba(74,60,48,0.45)] hover:-translate-y-1"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <ImageWithFallback
            src={img(recipe.image, 700, 525)}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <button
            onClick={onSave}
            aria-label="Save recipe"
            className={`absolute top-3 right-3 grid place-items-center size-9 rounded-full backdrop-blur-md transition-all ${
              saved ? "bg-primary text-primary-foreground" : "bg-white/85 text-foreground hover:bg-white"
            }`}
          >
            <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
          </button>
          <span className="absolute top-3 left-3 rounded-full bg-white/85 backdrop-blur-md px-2.5 py-1 text-foreground" style={{ fontSize: "0.68rem", letterSpacing: "0.03em" }}>
            {recipe.cuisine}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: "0.72rem" }}>
            <span className="font-mono-num inline-flex items-center gap-1"><Clock className="size-3.5" /> {total}m</span>
            <span className="opacity-40">·</span>
            <span className="inline-flex items-center gap-1"><Flame className="size-3.5" /> {recipe.difficulty}</span>
          </div>
          <h3 className="font-display mt-1.5 leading-tight" style={{ fontSize: "1.15rem" }}>
            {recipe.title}
          </h3>
          <p className="text-muted-foreground mt-1.5 line-clamp-2" style={{ fontSize: "0.85rem" }}>
            {recipe.description}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 min-w-0">
              <img src={creator?.avatar} alt={creator?.name} className="size-6 rounded-full object-cover" />
              <span className="text-muted-foreground truncate" style={{ fontSize: "0.78rem" }}>{creator?.name}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Stars value={rating.average} size={13} />
              <span className="text-muted-foreground font-mono-num" style={{ fontSize: "0.72rem" }}>
                {rating.count ? rating.average.toFixed(1) : "new"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
