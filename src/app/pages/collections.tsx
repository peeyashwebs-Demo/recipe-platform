import { useState } from "react";
import { Link } from "react-router";
import { BookMarked, Bookmark, Plus, Lock } from "lucide-react";
import { RecipeCard } from "../components/recipe-card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "../components/ui/dialog";
import { useStore } from "../store";
import { useAuthUI } from "../components/auth-ui";
import { img } from "../data/seed";
import { toast } from "sonner";

export function CollectionsPage() {
  const store = useStore();
  const { openAuth } = useAuthUI();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [open, setOpen] = useState(false);

  if (!store.ready) return <div className="min-h-[50vh]" />;

  if (!store.currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-28 text-center">
        <div className="grid place-items-center size-16 rounded-full bg-primary/10 text-primary mx-auto"><Lock className="size-7" /></div>
        <h1 className="font-display mt-6" style={{ fontSize: "2.2rem" }}>Your recipe box awaits</h1>
        <p className="text-muted-foreground mt-2">Sign in to save recipes and organise them into collections.</p>
        <Button className="rounded-full mt-6" onClick={() => openAuth("signup", "Create an account to start saving recipes.")}>Sign in or create account</Button>
      </div>
    );
  }

  const saved = store.recipes.filter((r) => store.savedIds.includes(r.id));
  const collections = store.myCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Your kitchen</h1>
          <p className="text-muted-foreground mt-1">Everything you've saved, in one warm place.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="outline" className="rounded-full"><Plus className="size-4" /> New collection</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create a collection</DialogTitle></DialogHeader>
            <div className="flex gap-3">
              <Input value={emoji} onChange={(e) => setEmoji(e.target.value.slice(0, 2))} className="w-16 text-center" />
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunday Roasts" autoFocus />
            </div>
            <DialogFooter>
              <Button className="rounded-full" onClick={() => { if (!name.trim()) return; store.createCollection(name.trim(), emoji); setName(""); setOpen(false); toast.success("Collection created"); }}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Collections row */}
      {collections.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => {
            const cover = store.recipes.find((r) => r.id === c.recipeIds[0]);
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="relative h-32 bg-muted">
                  {cover ? (
                    <ImageWithFallback src={img(cover.image, 500, 260)} alt={c.name} className="h-full w-full object-cover" />
                  ) : <div className="h-full grid place-items-center text-4xl">{c.emoji}</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white flex items-center gap-2">
                    <span className="text-xl">{c.emoji}</span>
                    <span className="font-display" style={{ fontSize: "1.15rem" }}>{c.name}</span>
                  </div>
                </div>
                <div className="p-3 text-muted-foreground" style={{ fontSize: "0.82rem" }}>{c.recipeIds.length} recipe{c.recipeIds.length === 1 ? "" : "s"}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Saved */}
      <div className="mt-12 flex items-center gap-2">
        <Bookmark className="size-5 text-primary" />
        <h2 className="font-display" style={{ fontSize: "1.6rem" }}>Saved recipes</h2>
      </div>
      {saved.length ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {saved.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} />)}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-12 text-center">
          <BookMarked className="size-8 text-muted-foreground mx-auto" />
          <p className="mt-3 text-muted-foreground">Nothing saved yet.</p>
          <Button asChild variant="outline" className="rounded-full mt-4"><Link to="/explore">Find recipes to save</Link></Button>
        </div>
      )}
    </div>
  );
}
