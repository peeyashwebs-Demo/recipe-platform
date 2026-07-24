import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { RecipeCard } from "../components/recipe-card";
import { RecipeCardSkeleton, useLoading } from "../components/primitives";
import { useStore } from "../store";
import { categories } from "../data/seed";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";

const difficulties = ["All", "Easy", "Medium", "Advanced"] as const;
const sorts = [
  { id: "top", label: "Top rated" },
  { id: "new", label: "Newest" },
  { id: "quick", label: "Quickest" },
] as const;

export function ExplorePage() {
  const { recipes, ratingFor, ready } = useStore();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("All");
  const [sort, setSort] = useState<(typeof sorts)[number]["id"]>("top");

  useEffect(() => { setQ(params.get("q") ?? ""); setCategory(params.get("category") ?? "all"); }, [params]);

  const loading = useLoading(700, [q, category, difficulty, sort]) || !ready;

  const results = useMemo(() => {
    let list = recipes.filter((r) => r.status === "published");
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(t) ||
          r.cuisine.toLowerCase().includes(t) ||
          r.tags.some((tag) => tag.includes(t)) ||
          r.description.toLowerCase().includes(t),
      );
    }
    if (category !== "all") list = list.filter((r) => r.category === category);
    if (difficulty !== "All") list = list.filter((r) => r.difficulty === difficulty);
    list = [...list].sort((a, b) => {
      if (sort === "top") return ratingFor(b.id).average - ratingFor(a.id).average;
      if (sort === "new") return b.createdAt.localeCompare(a.createdAt);
      return a.prepMinutes + a.cookMinutes - (b.prepMinutes + b.cookMinutes);
    });
    return list;
  }, [recipes, q, category, difficulty, sort, ratingFor]);

  const updateCategory = (val: string) => {
    setCategory(val);
    const next = new URLSearchParams(params);
    if (val === "all") next.delete("category"); else next.set("category", val);
    setParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-8">
      <h1 className="font-display" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Explore recipes</h1>
      <p className="text-muted-foreground mt-1">Find your next favourite from the whole Larder collection.</p>

      {/* Controls */}
      <div className="mt-7 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex items-center gap-2 rounded-full bg-input-background border border-border px-4 h-12 flex-1 focus-within:ring-2 focus-within:ring-primary/40">
          <Search className="size-5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by dish, cuisine or tag…" className="bg-transparent outline-none w-full" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="size-4 text-muted-foreground hidden sm:block" />
          <Select value={category} onValueChange={updateCategory}>
            <SelectTrigger className="rounded-full h-12 min-w-36 bg-card"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
            <SelectTrigger className="rounded-full h-12 min-w-32 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>{difficulties.map((d) => <SelectItem key={d} value={d}>{d === "All" ? "Any level" : d}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="rounded-full h-12 min-w-36 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>{sorts.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-muted-foreground mt-5" style={{ fontSize: "0.85rem" }}>
        {loading ? "Searching…" : `${results.length} recipe${results.length === 1 ? "" : "s"}`}
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)
        ) : results.length ? (
          results.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} />)
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="font-display" style={{ fontSize: "1.5rem" }}>No recipes match that.</p>
            <p className="text-muted-foreground mt-1">Try a different search or clear your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
