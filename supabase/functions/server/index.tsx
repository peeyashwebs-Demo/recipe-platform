import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { seedCooks, seedRecipes, seedReviews, categories, DEMO_PASSWORD } from "./seed_data.tsx";

const app = new Hono();
app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const P = "/make-server-4fda6252";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ---------- helpers ----------
async function getUser(c: any): Promise<{ id: string; email?: string } | null> {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? undefined };
}

async function getProfile(userId: string) {
  return (await kv.get(`profile:${userId}`)) ?? null;
}

async function ratingFor(recipeId: string) {
  const reviews = (await kv.getByPrefix(`review:${recipeId}:`)) as any[];
  const visible = reviews.filter((r) => !r.hidden);
  if (visible.length === 0) return { average: 0, count: 0 };
  const avg = visible.reduce((a, r) => a + r.rating, 0) / visible.length;
  return { average: Math.round(avg * 10) / 10, count: visible.length };
}

async function enrichRecipe(recipe: any, profilesById: Record<string, any>) {
  const creator = profilesById[recipe.creatorId];
  const rating = await ratingFor(recipe.id);
  return {
    ...recipe,
    creator: creator ? { id: creator.id, name: creator.name, avatar: creator.avatar } : null,
    rating,
  };
}

// ---------- seeding (idempotent) ----------
async function ensureSeeded() {
  const seeded = await kv.get("meta:seeded");
  if (seeded) return;

  const keyToId: Record<string, string> = {};

  for (const cook of seedCooks) {
    let id: string | undefined;
    const { data, error } = await admin.auth.admin.createUser({
      email: cook.email,
      password: DEMO_PASSWORD,
      user_metadata: { name: cook.name },
      // Auto-confirm since no email server is configured.
      email_confirm: true,
    });
    if (data?.user) {
      id = data.user.id;
    } else {
      // User probably exists already — find them.
      console.log(`Seed: createUser for ${cook.email} said: ${error?.message}. Looking up existing.`);
      const { data: list } = await admin.auth.admin.listUsers();
      id = list?.users?.find((u) => u.email === cook.email)?.id;
    }
    if (!id) {
      console.log(`Seed: could not resolve id for ${cook.email}, skipping.`);
      continue;
    }
    keyToId[cook.key] = id;
    await kv.set(`profile:${id}`, {
      id, name: cook.name, email: cook.email, avatar: cook.avatar, role: cook.role, bio: cook.bio,
    });
  }

  for (const r of seedRecipes) {
    const creatorId = keyToId[r.creatorKey];
    if (!creatorId) continue;
    const { creatorKey, ...rest } = r as any;
    await kv.set(`recipe:${r.id}`, {
      ...rest,
      creatorId,
      ingredients: r.ingredients.map((i) => ({ id: crypto.randomUUID(), ...i })),
      steps: r.steps.map((s) => ({ id: crypto.randomUUID(), ...s })),
    });
  }

  for (const rv of seedReviews) {
    const userId = keyToId[rv.authorKey];
    if (!userId) continue;
    const profile = await getProfile(userId);
    const id = crypto.randomUUID();
    await kv.set(`review:${rv.recipeId}:${id}`, {
      id, recipeId: rv.recipeId, userId,
      userName: profile?.name ?? "Cook", userAvatar: profile?.avatar ?? "",
      rating: rv.rating, comment: rv.comment, hidden: false, createdAt: rv.createdAt,
    });
  }

  // sample saves
  if (keyToId["u_amara"]) await kv.set(`saved:${keyToId["u_amara"]}`, ["r_cacio", "r_choccake"]);
  if (keyToId["u_sana"]) await kv.set(`saved:${keyToId["u_sana"]}`, ["r_ramen"]);

  await kv.set("meta:seeded", true);
  console.log("Seed: complete.");
}

// Kick off seeding on cold start.
ensureSeeded().catch((e) => console.log("Seed error on boot:", e?.message));

// ---------- routes ----------
app.get(`${P}/health`, (c) => c.json({ status: "ok" }));

// Sign up (creates auth user + profile). Curators email becomes admin.
app.post(`${P}/signup`, async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: "Email and password are required." }, 400);
    const role = email.toLowerCase() === "curators@table.co" ? "admin" : "user";
    const { data, error } = await admin.auth.admin.createUser({
      email, password,
      user_metadata: { name: name || email.split("@")[0] },
      // Auto-confirm since no email server is configured.
      email_confirm: true,
    });
    if (error || !data.user) {
      console.log(`Signup error for ${email}: ${error?.message}`);
      return c.json({ error: error?.message ?? "Could not create account." }, 400);
    }
    await kv.set(`profile:${data.user.id}`, {
      id: data.user.id, name: name || email.split("@")[0], email,
      avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(email)}`, role,
    });
    return c.json({ ok: true });
  } catch (e) {
    console.log("Signup exception:", (e as Error).message);
    return c.json({ error: "Unexpected error during signup." }, 500);
  }
});

// Public bootstrap: recipes (enriched), visible reviews, profiles, categories.
app.get(`${P}/bootstrap`, async (c) => {
  try {
    await ensureSeeded();
    const profiles = (await kv.getByPrefix("profile:")) as any[];
    const profilesById: Record<string, any> = {};
    profiles.forEach((p) => (profilesById[p.id] = p));

    const recipes = (await kv.getByPrefix("recipe:")) as any[];
    const enriched = await Promise.all(recipes.map((r) => enrichRecipe(r, profilesById)));

    const allReviews = (await kv.getByPrefix("review:")) as any[];
    const visible = allReviews.filter((r) => !r.hidden);

    const publicProfiles = profiles.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, role: p.role, bio: p.bio }));
    return c.json({ recipes: enriched, reviews: visible, profiles: publicProfiles, categories });
  } catch (e) {
    console.log("Bootstrap error:", (e as Error).message);
    return c.json({ error: (e as Error).message }, 500);
  }
});

// Current user's private data + admin extras.
app.get(`${P}/me`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  let profile = await getProfile(user.id);
  if (!profile) {
    // Backfill profile for users created outside the signup route.
    profile = { id: user.id, name: user.email?.split("@")[0] ?? "Cook", email: user.email,
      avatar: `https://i.pravatar.cc/160?u=${encodeURIComponent(user.email ?? user.id)}`, role: "user" };
    await kv.set(`profile:${user.id}`, profile);
  }
  const saved = (await kv.get(`saved:${user.id}`)) ?? [];
  const collections = (await kv.getByPrefix(`collection:${user.id}:`)) as any[];
  const extra: any = {};
  if (profile.role === "admin") {
    extra.allReviews = (await kv.getByPrefix("review:")) as any[];
  }
  return c.json({ profile, saved, collections, ...extra });
});

// Toggle save
app.post(`${P}/saved/:recipeId`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const recipeId = c.req.param("recipeId");
  const saved: string[] = (await kv.get(`saved:${user.id}`)) ?? [];
  const next = saved.includes(recipeId) ? saved.filter((id) => id !== recipeId) : [...saved, recipeId];
  await kv.set(`saved:${user.id}`, next);
  return c.json({ saved: next });
});

// Create review
app.post(`${P}/recipes/:id/reviews`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const recipeId = c.req.param("id");
  const { rating, comment } = await c.req.json();
  if (!rating || rating < 1 || rating > 5) return c.json({ error: "Rating must be 1–5." }, 400);
  const profile = await getProfile(user.id);
  const id = crypto.randomUUID();
  const review = {
    id, recipeId, userId: user.id,
    userName: profile?.name ?? "Cook", userAvatar: profile?.avatar ?? "",
    rating, comment: comment ?? "", hidden: false, createdAt: new Date().toISOString().slice(0, 10),
  };
  await kv.set(`review:${recipeId}:${id}`, review);
  return c.json({ review });
});

// Create recipe (any authenticated user)
app.post(`${P}/recipes`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  const id = "r_" + crypto.randomUUID().slice(0, 8);
  const recipe = {
    id,
    title: body.title, description: body.description, image: body.image,
    creatorId: user.id, category: body.category, cuisine: body.cuisine || "Modern",
    difficulty: body.difficulty || "Easy",
    prepMinutes: Number(body.prepMinutes) || 0, cookMinutes: Number(body.cookMinutes) || 0,
    baseServings: Number(body.baseServings) || 1,
    ingredients: (body.ingredients ?? []).map((i: any) => ({ id: crypto.randomUUID(), quantity: i.quantity ?? null, unit: i.unit ?? "", name: i.name })),
    steps: (body.steps ?? []).map((s: any) => ({ id: crypto.randomUUID(), text: s.text ?? s })),
    tags: body.tags ?? [], featured: false, status: "pending",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  await kv.set(`recipe:${id}`, recipe);
  return c.json({ recipe });
});

// Update recipe status (owner or admin)
app.patch(`${P}/recipes/:id/status`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const profile = await getProfile(user.id);
  const recipe = await kv.get(`recipe:${c.req.param("id")}`);
  if (!recipe) return c.json({ error: "Not found" }, 404);
  if (recipe.creatorId !== user.id && profile?.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  const { status } = await c.req.json();
  await kv.set(`recipe:${recipe.id}`, { ...recipe, status });
  return c.json({ ok: true });
});

// Toggle featured (admin only)
app.patch(`${P}/recipes/:id/feature`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const profile = await getProfile(user.id);
  if (profile?.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  const recipe = await kv.get(`recipe:${c.req.param("id")}`);
  if (!recipe) return c.json({ error: "Not found" }, 404);
  await kv.set(`recipe:${recipe.id}`, { ...recipe, featured: !recipe.featured });
  return c.json({ ok: true, featured: !recipe.featured });
});

// Delete recipe (owner or admin)
app.delete(`${P}/recipes/:id`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const profile = await getProfile(user.id);
  const recipe = await kv.get(`recipe:${c.req.param("id")}`);
  if (!recipe) return c.json({ error: "Not found" }, 404);
  if (recipe.creatorId !== user.id && profile?.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  await kv.del(`recipe:${recipe.id}`);
  return c.json({ ok: true });
});

// Hide / restore review (admin only)
app.patch(`${P}/reviews/:recipeId/:reviewId/hidden`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const profile = await getProfile(user.id);
  if (profile?.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  const key = `review:${c.req.param("recipeId")}:${c.req.param("reviewId")}`;
  const review = await kv.get(key);
  if (!review) return c.json({ error: "Not found" }, 404);
  await kv.set(key, { ...review, hidden: !review.hidden });
  return c.json({ ok: true, hidden: !review.hidden });
});

// Collections
app.post(`${P}/collections`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { name, emoji } = await c.req.json();
  const id = "c_" + crypto.randomUUID().slice(0, 8);
  const collection = { id, ownerId: user.id, name, emoji: emoji || "🍽️", recipeIds: [] };
  await kv.set(`collection:${user.id}:${id}`, collection);
  return c.json({ collection });
});

app.post(`${P}/collections/:id/recipes/:recipeId`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const key = `collection:${user.id}:${c.req.param("id")}`;
  const col = await kv.get(key);
  if (!col) return c.json({ error: "Not found" }, 404);
  const recipeId = c.req.param("recipeId");
  if (!col.recipeIds.includes(recipeId)) col.recipeIds.push(recipeId);
  await kv.set(key, col);
  return c.json({ collection: col });
});

// Feedback (anyone)
app.post(`${P}/feedback`, async (c) => {
  const user = await getUser(c);
  const { rating, message } = await c.req.json();
  const id = crypto.randomUUID();
  await kv.set(`feedback:${id}`, {
    id, userId: user?.id ?? null, rating: rating ?? null, message: message ?? "",
    createdAt: new Date().toISOString(),
  });
  return c.json({ ok: true });
});

Deno.serve(app.fetch);
