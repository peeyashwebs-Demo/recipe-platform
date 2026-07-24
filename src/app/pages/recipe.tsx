import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft, Bookmark, Clock, Flame, Minus, Plus, Printer, Share2, Timer, Users,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Stars, Shimmer, useLoading } from "../components/primitives";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { useStore } from "../store";
import { useAuthUI } from "../components/auth-ui";
import { categories, img } from "../data/seed";
import { toast } from "sonner";

function formatQty(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const whole = Math.floor(rounded);
  const frac = rounded - whole;
  const map: [number, string][] = [
    [0.125, "⅛"], [0.25, "¼"], [0.333, "⅓"], [0.5, "½"],
    [0.666, "⅔"], [0.75, "¾"],
  ];
  let fracStr = "";
  let best = 1;
  for (const [v, s] of map) {
    if (Math.abs(frac - v) < best && Math.abs(frac - v) < 0.06) { best = Math.abs(frac - v); fracStr = s; }
  }
  if (fracStr) return whole ? `${whole}${fracStr}` : fracStr;
  return rounded % 1 === 0 ? String(rounded) : String(rounded);
}

export function RecipePage() {
  const { id } = useParams();
  const store = useStore();
  const { requireAuth } = useAuthUI();
  const loading = useLoading(650, [id]) || !store.ready;

  const recipe = store.recipes.find((r) => r.id === id);
  const [servings, setServings] = useState(recipe?.baseServings ?? 2);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState("");

  // Sync the servings scaler to the recipe's base once it has loaded.
  useEffect(() => { if (recipe) setServings(recipe.baseServings); }, [recipe?.id]);

  const rating = recipe ? store.ratingFor(recipe.id) : { average: 0, count: 0 };
  const creator = recipe ? store.userById(recipe.creatorId) : undefined;
  const reviews = recipe ? store.reviewsFor(recipe.id).filter((r) => !r.hidden) : [];
  const related = useMemo(
    () => recipe ? store.recipes.filter((r) => r.category === recipe.category && r.id !== recipe.id && r.status === "published").slice(0, 3) : [],
    [recipe, store.recipes],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        <Shimmer className="h-5 w-28 mb-6" />
        <Shimmer className="aspect-[21/9] w-full rounded-3xl" />
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 mt-8">
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Shimmer key={i} className="h-6 w-full" />)}</div>
          <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Shimmer key={i} className="h-6 w-full" />)}</div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-32 text-center">
        <h1 className="font-display" style={{ fontSize: "2rem" }}>Recipe not found</h1>
        <Button asChild className="rounded-full mt-6"><Link to="/explore">Back to explore</Link></Button>
      </div>
    );
  }

  const factor = servings / recipe.baseServings;
  const saved = store.isSaved(recipe.id);

  const onSave = () =>
    requireAuth(() => {
      store.toggleSave(recipe.id);
      toast(saved ? "Removed from saved" : "Saved to your recipes", { description: recipe.title });
    }, "Sign in to save this recipe.");

  const submitReview = () =>
    requireAuth(() => {
      if (!myRating) { toast.error("Pick a star rating first"); return; }
      store.addReview(recipe.id, myRating, comment.trim());
      setMyRating(0); setComment("");
      toast.success("Thanks for your review!");
    }, "Sign in to rate and review recipes.");

  const toggleCheck = (id: string) =>
    setChecked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground" style={{ fontSize: "0.88rem" }}>
          <ArrowLeft className="size-4" /> Back to recipes
        </Link>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-4">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative rounded-3xl overflow-hidden aspect-[21/10] bg-muted">
          <ImageWithFallback src={img(recipe.image, 1400, 700)} alt={recipe.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary text-primary-foreground border-none">{recipe.cuisine}</Badge>
              <span className="text-white/80" style={{ fontSize: "0.8rem" }}>{categories.find((c) => c.id === recipe.category)?.name}</span>
            </div>
            <h1 className="font-display mt-2" style={{ fontSize: "clamp(1.8rem,4.5vw,3.4rem)", lineHeight: 1.05 }}>{recipe.title}</h1>
            <div className="flex items-center gap-3 mt-3">
              <Stars value={rating.average} size={18} />
              <span className="text-white/90" style={{ fontSize: "0.85rem" }}>
                {rating.count ? `${rating.average.toFixed(1)} · ${rating.count} review${rating.count === 1 ? "" : "s"}` : "Be the first to review"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Meta bar */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-5 flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-3">
          <img src={creator?.avatar} alt={creator?.name} className="size-11 rounded-full object-cover" />
          <div>
            <div className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>Recipe by</div>
            <div className="font-display" style={{ fontSize: "1rem" }}>{creator?.name}</div>
          </div>
        </div>
        <Separator orientation="vertical" className="h-10 hidden sm:block" />
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-1.5"><Timer className="size-4 text-primary" /> <span className="font-mono-num">{recipe.prepMinutes}m</span> prep</div>
          <div className="flex items-center gap-1.5"><Clock className="size-4 text-primary" /> <span className="font-mono-num">{recipe.cookMinutes}m</span> cook</div>
          <div className="flex items-center gap-1.5"><Flame className="size-4 text-primary" /> {recipe.difficulty}</div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast("Link copied"); }}><Share2 className="size-4" /></Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => window.print()}><Printer className="size-4" /></Button>
          <Button className="rounded-full" variant={saved ? "secondary" : "default"} onClick={onSave}>
            <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      <p className="mx-auto max-w-6xl px-4 sm:px-6 mt-6 text-muted-foreground" style={{ fontSize: "1.05rem", lineHeight: 1.6 }}>{recipe.description}</p>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-8 grid lg:grid-cols-[0.9fr_1.3fr] gap-10">
        {/* Ingredients + scaler */}
        <div>
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display" style={{ fontSize: "1.35rem" }}>Ingredients</h2>
              <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "0.8rem" }}><Users className="size-4" /> serves</div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-border bg-input-background">
                <button onClick={() => setServings((s) => Math.max(1, s - 1))} className="grid place-items-center size-9 rounded-full hover:bg-secondary" aria-label="Fewer servings"><Minus className="size-4" /></button>
                <span className="w-10 text-center font-mono-num" style={{ fontSize: "1.1rem" }}>{servings}</span>
                <button onClick={() => setServings((s) => Math.min(40, s + 1))} className="grid place-items-center size-9 rounded-full hover:bg-secondary" aria-label="More servings"><Plus className="size-4" /></button>
              </div>
              {servings !== recipe.baseServings && (
                <button onClick={() => setServings(recipe.baseServings)} className="text-primary hover:underline" style={{ fontSize: "0.8rem" }}>
                  reset to {recipe.baseServings}
                </button>
              )}
            </div>
            <Separator className="my-4" />
            <ul className="space-y-1">
              {recipe.ingredients.map((ing) => {
                const done = checked.has(ing.id);
                return (
                  <li key={ing.id}>
                    <button onClick={() => toggleCheck(ing.id)} className="w-full flex items-start gap-3 py-2 text-left group">
                      <span className={`mt-0.5 grid place-items-center size-5 rounded-md border shrink-0 transition-colors ${done ? "bg-primary border-primary text-primary-foreground" : "border-border group-hover:border-primary"}`}>
                        {done && <span style={{ fontSize: "0.7rem" }}>✓</span>}
                      </span>
                      <span className={`${done ? "line-through text-muted-foreground" : ""}`} style={{ fontSize: "0.95rem" }}>
                        {ing.quantity !== null && <span className="font-mono-num text-primary">{formatQty(ing.quantity * factor)}</span>}
                        {ing.unit && <span className="text-muted-foreground"> {ing.unit}</span>}{" "}
                        {ing.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Steps */}
        <div>
          <h2 className="font-display" style={{ fontSize: "1.35rem" }}>Method</h2>
          <ol className="mt-4 space-y-6">
            {recipe.steps.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.03 }}
                className="flex gap-4"
              >
                <span className="grid place-items-center size-10 shrink-0 rounded-full bg-primary/10 text-primary font-display" style={{ fontSize: "1.1rem" }}>{i + 1}</span>
                <p className="pt-1.5" style={{ fontSize: "1rem", lineHeight: 1.65 }}>{s.text}</p>
              </motion.li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-2 mt-8">
            {recipe.tags.map((t) => <Badge key={t} variant="secondary" className="rounded-full">#{t}</Badge>)}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-16">
        <h2 className="font-display" style={{ fontSize: "1.8rem" }}>Reviews</h2>
        <div className="mt-5 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>How did it turn out?</div>
              <Stars value={myRating} size={30} onChange={setMyRating} className="mt-1" />
            </div>
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share tips, tweaks, or how it went…" className="mt-4 min-h-[90px] bg-input-background resize-none" />
          <Button className="rounded-full mt-3" onClick={submitReview}>Post review</Button>
        </div>

        <div className="mt-6 space-y-4">
          {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet — cook it and let us know!</p>}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <img src={r.userAvatar} alt={r.userName} className="size-9 rounded-full object-cover" />
                <div>
                  <div style={{ fontSize: "0.92rem" }}>{r.userName}</div>
                  <div className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>{r.createdAt}</div>
                </div>
                <Stars value={r.rating} size={14} className="ml-auto" />
              </div>
              {r.comment && <p className="mt-3 text-foreground/90" style={{ fontSize: "0.95rem", lineHeight: 1.55 }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-16">
          <h2 className="font-display mb-5" style={{ fontSize: "1.6rem" }}>More like this</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} to={`/recipe/${r.id}`} className="group flex gap-3 rounded-2xl border border-border bg-card p-3 hover:shadow-lg transition-shadow">
                <ImageWithFallback src={img(r.image, 200, 200)} alt={r.title} className="size-20 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <div className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>{r.cuisine}</div>
                  <div className="font-display leading-tight mt-0.5 group-hover:text-primary transition-colors" style={{ fontSize: "1rem" }}>{r.title}</div>
                  <div className="text-muted-foreground mt-1 font-mono-num" style={{ fontSize: "0.72rem" }}>{r.prepMinutes + r.cookMinutes}m</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
