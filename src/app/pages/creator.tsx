import { useState } from "react";
import { Link } from "react-router";
import { PenLine, Plus, Trash2, X, ChefHat, Eye, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useStore } from "../store";
import { useAuthUI } from "../components/auth-ui";
import { categories, img, type Ingredient, type Step } from "../data/seed";
import { toast } from "sonner";

const heroImages = [
  "1546549032-9571cd6b27df", "1598103442097-8b74394b95c6", "1512621776951-a57141f2eefd",
  "1517427294546-5aa121f68e8a", "1638866281450-3933540af86a", "1621523131496-0a1af8e2b20c",
];

export function CreatorPage() {
  const store = useStore();
  const { openAuth } = useAuthUI();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("mains");
  const [cuisine, setCuisine] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Advanced">("Easy");
  const [prep, setPrep] = useState(10);
  const [cook, setCook] = useState(20);
  const [servings, setServings] = useState(4);
  const [image, setImage] = useState(heroImages[0]);
  const [ingredients, setIngredients] = useState<{ qty: string; unit: string; name: string }[]>([{ qty: "", unit: "", name: "" }]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [tags, setTags] = useState("");

  if (!store.ready) return <div className="min-h-[50vh]" />;

  if (!store.currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-28 text-center">
        <div className="grid place-items-center size-16 rounded-full bg-accent/15 text-accent mx-auto"><ChefHat className="size-7" /></div>
        <h1 className="font-display mt-6" style={{ fontSize: "2.2rem" }}>Share your cooking</h1>
        <p className="text-muted-foreground mt-2">Sign in to publish recipes and build your following of home cooks.</p>
        <Button className="rounded-full mt-6" onClick={() => openAuth("signup", "Create an account to publish recipes.")}>Get started</Button>
      </div>
    );
  }

  const mine = store.recipes.filter((r) => r.creatorId === store.currentUser!.id);

  const [publishing, setPublishing] = useState(false);

  const publish = async () => {
    if (!title.trim() || !description.trim()) { toast.error("Add a title and description"); return; }
    const ing: Ingredient[] = ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({ id: crypto.randomUUID(), quantity: i.qty.trim() ? Number(i.qty) : null, unit: i.unit.trim(), name: i.name.trim() }));
    const st: Step[] = steps.filter((s) => s.trim()).map((s) => ({ id: crypto.randomUUID(), text: s.trim() }));
    if (!ing.length || !st.length) { toast.error("Add at least one ingredient and one step"); return; }
    setPublishing(true);
    try {
      await store.addRecipe({
        title: title.trim(), description: description.trim(), image, category, cuisine: cuisine.trim() || "Modern",
        difficulty, prepMinutes: prep, cookMinutes: cook, baseServings: servings,
        ingredients: ing, steps: st, tags: tags.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean),
      });
      toast.success("Recipe submitted for review!", { description: "Curators will feature it once approved." });
      setTitle(""); setDescription(""); setCuisine(""); setIngredients([{ qty: "", unit: "", name: "" }]); setSteps([""]); setTags("");
    } catch (e) {
      toast.error("Could not submit recipe", { description: (e as Error).message });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-full bg-accent/15 text-accent"><PenLine className="size-5" /></span>
        <div>
          <h1 className="font-display" style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>Creator studio</h1>
          <p className="text-muted-foreground" style={{ fontSize: "0.9rem" }}>Publish structured recipes and manage your collection.</p>
        </div>
      </div>

      <Tabs defaultValue="new" className="mt-8">
        <TabsList>
          <TabsTrigger value="new">New recipe</TabsTrigger>
          <TabsTrigger value="mine">My recipes ({mine.length})</TabsTrigger>
        </TabsList>

        {/* New recipe */}
        <TabsContent value="new" className="mt-6">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8">
            <div className="space-y-5">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Grandma's Sunday Ragù" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short, appetising intro…" className="resize-none min-h-[80px]" /></div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}><SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Cuisine</Label><Input value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="Italian" /></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2"><Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}><SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Prep (m)</Label><Input type="number" value={prep} onChange={(e) => setPrep(Number(e.target.value))} /></div>
                <div className="space-y-2"><Label>Cook (m)</Label><Input type="number" value={cook} onChange={(e) => setCook(Number(e.target.value))} /></div>
                <div className="space-y-2"><Label>Serves</Label><Input type="number" value={servings} onChange={(e) => setServings(Number(e.target.value))} /></div>
              </div>

              {/* Ingredients */}
              <div className="space-y-2">
                <Label>Ingredients</Label>
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={ing.qty} onChange={(e) => setIngredients((a) => a.map((x, idx) => idx === i ? { ...x, qty: e.target.value } : x))} placeholder="200" className="w-20" />
                    <Input value={ing.unit} onChange={(e) => setIngredients((a) => a.map((x, idx) => idx === i ? { ...x, unit: e.target.value } : x))} placeholder="g" className="w-20" />
                    <Input value={ing.name} onChange={(e) => setIngredients((a) => a.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="flour" className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => setIngredients((a) => a.filter((_, idx) => idx !== i))}><X className="size-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIngredients((a) => [...a, { qty: "", unit: "", name: "" }])}><Plus className="size-4" /> Add ingredient</Button>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                <Label>Method</Label>
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="grid place-items-center size-8 shrink-0 mt-1 rounded-full bg-primary/10 text-primary font-mono-num" style={{ fontSize: "0.8rem" }}>{i + 1}</span>
                    <Textarea value={s} onChange={(e) => setSteps((a) => a.map((x, idx) => idx === i ? e.target.value : x))} placeholder="Describe this step…" className="resize-none min-h-[60px]" />
                    <Button variant="ghost" size="icon" className="mt-1" onClick={() => setSteps((a) => a.filter((_, idx) => idx !== i))}><X className="size-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setSteps((a) => [...a, ""])}><Plus className="size-4" /> Add step</Button>
              </div>

              <div className="space-y-2"><Label>Tags (comma separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="vegetarian, 30-minutes, cozy" /></div>

              <Button className="rounded-full h-11 px-8" onClick={publish} disabled={publishing}>{publishing ? "Submitting…" : "Submit for review"}</Button>
            </div>

            {/* Live preview + photo picker */}
            <div>
              <Label className="mb-2 block">Cover photo</Label>
              <div className="grid grid-cols-3 gap-2">
                {heroImages.map((h) => (
                  <button key={h} onClick={() => setImage(h)} className={`relative rounded-xl overflow-hidden aspect-square ring-2 transition-all ${image === h ? "ring-primary" : "ring-transparent hover:ring-border"}`}>
                    <ImageWithFallback src={img(h, 200, 200)} alt="option" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="sticky top-20 mt-5 rounded-2xl border border-border bg-card overflow-hidden">
                <div className="relative aspect-[4/3] bg-muted">
                  <ImageWithFallback src={img(image, 500, 375)} alt="preview" className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>{cuisine || "Cuisine"} · {difficulty}</div>
                  <div className="font-display mt-1" style={{ fontSize: "1.15rem" }}>{title || "Your recipe title"}</div>
                  <p className="text-muted-foreground mt-1 line-clamp-2" style={{ fontSize: "0.85rem" }}>{description || "Your description will appear here as you type."}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* My recipes */}
        <TabsContent value="mine" className="mt-6">
          {mine.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center">You haven't published anything yet.</p>
          ) : (
            <div className="space-y-3">
              {mine.map((r) => (
                <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3">
                  <ImageWithFallback src={img(r.image, 160, 160)} alt={r.title} className="size-16 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/recipe/${r.id}`} className="font-display hover:text-primary transition-colors" style={{ fontSize: "1.05rem" }}>{r.title}</Link>
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                      <span className="font-mono-num inline-flex items-center gap-1"><Clock className="size-3.5" />{r.prepMinutes + r.cookMinutes}m</span>
                      <span>·</span><span>{store.ratingFor(r.id).count} reviews</span>
                    </div>
                  </div>
                  <StatusBadge status={r.status} featured={r.featured} />
                  <Button variant="ghost" size="icon" asChild><Link to={`/recipe/${r.id}`}><Eye className="size-4" /></Link></Button>
                  <Button variant="ghost" size="icon" onClick={() => { store.deleteRecipe(r.id); toast("Recipe deleted"); }}><Trash2 className="size-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status, featured }: { status: string; featured: boolean }) {
  if (featured) return <Badge className="bg-primary text-primary-foreground border-none rounded-full">Featured</Badge>;
  const map: Record<string, string> = {
    published: "bg-accent/15 text-accent",
    pending: "bg-amber-500/15 text-amber-700",
    draft: "bg-muted text-muted-foreground",
  };
  return <Badge variant="outline" className={`rounded-full border-none capitalize ${map[status]}`}>{status}</Badge>;
}
