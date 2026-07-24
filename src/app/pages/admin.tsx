import { Link } from "react-router";
import { Shield, Check, Star, EyeOff, Eye, Sparkles, ClipboardList, MessageSquare, LayoutGrid } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useStore } from "../store";
import { useAuthUI } from "../components/auth-ui";
import { categories, img } from "../data/seed";
import { toast } from "sonner";

export function AdminPage() {
  const store = useStore();
  const { openAuth } = useAuthUI();

  if (!store.ready) return <div className="min-h-[50vh]" />;

  if (!store.currentUser || store.currentUser.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-28 text-center">
        <div className="grid place-items-center size-16 rounded-full bg-primary/10 text-primary mx-auto"><Shield className="size-7" /></div>
        <h1 className="font-display mt-6" style={{ fontSize: "2.2rem" }}>Curation desk</h1>
        <p className="text-muted-foreground mt-2">This area is for the editorial team.</p>
        {!store.currentUser
          ? <Button className="rounded-full mt-6" onClick={() => openAuth("signin", "Sign in as curators@table.co to access curation.")}>Sign in as curator</Button>
          : <Button asChild variant="outline" className="rounded-full mt-6"><Link to="/">Back home</Link></Button>}
        <p className="text-muted-foreground mt-4" style={{ fontSize: "0.78rem" }}>Demo: sign in with curators@table.co (any password).</p>
      </div>
    );
  }

  const pending = store.recipes.filter((r) => r.status === "pending");
  const published = store.recipes.filter((r) => r.status === "published");
  const allReviews = [...store.reviews];

  const stats = [
    { label: "Published", value: published.length, icon: ClipboardList },
    { label: "In review", value: pending.length, icon: Sparkles },
    { label: "Reviews", value: allReviews.length, icon: MessageSquare },
    { label: "Categories", value: categories.length, icon: LayoutGrid },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-full bg-primary/10 text-primary"><Shield className="size-5" /></span>
        <div>
          <h1 className="font-display" style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>Curation desk</h1>
          <p className="text-muted-foreground" style={{ fontSize: "0.9rem" }}>Feature the best, moderate the rest.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <s.icon className="size-5 text-primary" />
            <div className="font-display mt-2" style={{ fontSize: "1.8rem" }}>{s.value}</div>
            <div className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="queue" className="mt-8">
        <TabsList>
          <TabsTrigger value="queue">Approval queue{pending.length ? ` (${pending.length})` : ""}</TabsTrigger>
          <TabsTrigger value="feature">Featured</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="cats">Categories</TabsTrigger>
        </TabsList>

        {/* Queue */}
        <TabsContent value="queue" className="mt-5 space-y-3">
          {pending.length === 0 && <p className="text-muted-foreground py-8 text-center">Queue is clear. Nice work.</p>}
          {pending.map((r) => (
            <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3">
              <ImageWithFallback src={img(r.image, 160, 160)} alt={r.title} className="size-16 rounded-xl object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <Link to={`/recipe/${r.id}`} className="font-display hover:text-primary" style={{ fontSize: "1.05rem" }}>{r.title}</Link>
                <div className="text-muted-foreground truncate" style={{ fontSize: "0.8rem" }}>by {store.userById(r.creatorId)?.name} · {r.cuisine}</div>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => { store.setRecipeStatus(r.id, "draft"); toast("Sent back to draft"); }}>Reject</Button>
              <Button className="rounded-full" onClick={() => { store.setRecipeStatus(r.id, "published"); toast.success("Recipe published"); }}><Check className="size-4" /> Approve</Button>
            </div>
          ))}
        </TabsContent>

        {/* Featured */}
        <TabsContent value="feature" className="mt-5 grid gap-3 sm:grid-cols-2">
          {published.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <ImageWithFallback src={img(r.image, 120, 120)} alt={r.title} className="size-14 rounded-xl object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-display truncate" style={{ fontSize: "1rem" }}>{r.title}</div>
                <div className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{store.ratingFor(r.id).average.toFixed(1)} ★ · {store.ratingFor(r.id).count} reviews</div>
              </div>
              <Button
                variant={r.featured ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => { store.toggleFeatured(r.id); toast(r.featured ? "Unfeatured" : "Featured on home"); }}
              >
                <Star className={`size-4 ${r.featured ? "fill-current" : ""}`} /> {r.featured ? "Featured" : "Feature"}
              </Button>
            </div>
          ))}
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="mt-5 space-y-3">
          {allReviews.map((rv) => {
            const recipe = store.recipes.find((r) => r.id === rv.recipeId);
            return (
              <div key={rv.id} className={`rounded-2xl border border-border p-4 ${rv.hidden ? "bg-muted/50 opacity-70" : "bg-card"}`}>
                <div className="flex items-center gap-3">
                  <img src={rv.userAvatar} alt={rv.userName} className="size-8 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div style={{ fontSize: "0.88rem" }}>{rv.userName} <span className="text-muted-foreground">on</span> {recipe?.title}</div>
                    <div className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>{rv.rating} ★ · {rv.createdAt}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full ml-auto" onClick={() => { store.toggleReviewHidden(rv.recipeId, rv.id); toast(rv.hidden ? "Review restored" : "Review hidden"); }}>
                    {rv.hidden ? <><Eye className="size-4" /> Restore</> : <><EyeOff className="size-4" /> Hide</>}
                  </Button>
                </div>
                {rv.comment && <p className="mt-2 text-foreground/90" style={{ fontSize: "0.9rem" }}>{rv.comment}</p>}
              </div>
            );
          })}
        </TabsContent>

        {/* Categories */}
        <TabsContent value="cats" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const count = store.recipes.filter((r) => r.category === c.id && r.status === "published").length;
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="relative h-24">
                  <ImageWithFallback src={img(c.image, 400, 200)} alt={c.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-white font-display" style={{ fontSize: "1.1rem" }}>{c.name}</div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: "0.8rem" }}>{c.blurb}</span>
                  <Badge variant="secondary" className="rounded-full">{count}</Badge>
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
