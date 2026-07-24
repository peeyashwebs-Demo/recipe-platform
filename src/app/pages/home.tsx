import { Link } from "react-router";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { ArrowRight, Clock, Sparkles, Star, TrendingUp, Utensils, ChefHat } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import heroFoodImg from "../../imports/images.jpg";
import { RecipeCard } from "../components/recipe-card";
import { RecipeCardSkeleton, Reveal, useLoading } from "../components/primitives";
import { Button } from "../components/ui/button";
import { useStore } from "../store";
import { useAuthUI } from "../components/auth-ui";
import { categories, img } from "../data/seed";

export function HomePage() {
  const { recipes, ratingFor, currentUser, ready } = useStore();
  const { openAuth } = useAuthUI();
  const loading = useLoading(900) || !ready;

  const { scrollY } = useScroll();
  // Scroll-driven 3D tilt — starts angled, straightens as user scrolls
  const rawRotateX = useTransform(scrollY, [0, 600], [12, 0]);
  const rawRotateY = useTransform(scrollY, [0, 600], [-16, 0]);
  const rawTranslateY = useTransform(scrollY, [0, 600], [0, -20]);
  // Spring-smooth the scroll values so motion feels physical
  const rotateX = useSpring(rawRotateX, { stiffness: 80, damping: 20 });
  const rotateY = useSpring(rawRotateY, { stiffness: 80, damping: 20 });
  const cardTranslateY = useSpring(rawTranslateY, { stiffness: 80, damping: 20 });

  const published = recipes.filter((r) => r.status === "published");
  const featured = published.filter((r) => r.featured).slice(0, 6);
  const trending = [...published]
    .sort((a, b) => ratingFor(b.id).average - ratingFor(a.id).average)
    .slice(0, 8);

  return (
    <div className="overflow-x-hidden">
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-16 md:pt-16 md:pb-28 grid gap-10 lg:gap-16 lg:grid-cols-[1fr_1.15fr] items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3.5 py-1.5"
              style={{ fontSize: "0.75rem", letterSpacing: "0.04em" }}
            >
              <Sparkles className="size-3.5" /> A HOME FOR RECIPES WORTH KEEPING
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
              className="font-display mt-5"
              style={{ fontSize: "clamp(2.6rem, 6vw, 4.6rem)", lineHeight: 1.02, letterSpacing: "-0.02em", fontWeight: 500 }}
            >
              Cook the recipes people <span className="italic text-primary">actually</span> make.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12 }}
              className="text-muted-foreground mt-5 max-w-lg"
              style={{ fontSize: "1.05rem", lineHeight: 1.6 }}
            >
              Discover, save and scale recipes from real home cooks. Clear ingredients,
              honest steps, and reviews you can trust — all beautifully easy to follow while you cook.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.19 }}
              className="flex flex-wrap items-center gap-3 mt-8"
            >
              <Button asChild className="rounded-full h-12 px-7">
                <Link to="/explore">Start exploring <ArrowRight className="size-4" /></Link>
              </Button>
              {!currentUser && (
                <Button variant="outline" className="rounded-full h-12 px-7" onClick={() => openAuth("signup")}>
                  Create free account
                </Button>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-2 mt-10 text-muted-foreground min-w-0"
              style={{ fontSize: "0.75rem" }}
            >
              <div className="flex items-center gap-1.5 whitespace-nowrap"><Utensils className="size-3.5 text-primary shrink-0" /> {published.length}+ recipes</div>
              <div className="hidden sm:block shrink-0 w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5 whitespace-nowrap"><Star className="size-3.5 text-primary fill-primary shrink-0" /> Rated by real cooks</div>
              <div className="hidden sm:block shrink-0 w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5 whitespace-nowrap"><Clock className="size-3.5 text-primary shrink-0" /> Weeknight-friendly</div>
            </motion.div>
          </div>

          {/* Hero screenshot — 3D scroll tilt */}
          <div style={{ perspective: "1400px", perspectiveOrigin: "50% 30%" }}>
            <motion.div
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ rotateX, rotateY, y: cardTranslateY, transformStyle: "preserve-3d" }}
              className="relative will-change-transform"
            >
              {/* Main screenshot card */}
              <div className="relative rounded-2xl overflow-hidden ring-1 ring-black/10 bg-card aspect-[4/3] w-full"
                style={{ boxShadow: "0 50px 120px -20px rgba(74,60,48,0.45), 0 20px 40px -10px rgba(74,60,48,0.2), 0 0 0 1px rgba(255,255,255,0.12)" }}
              >
                <ImageWithFallback
                  src={heroFoodImg}
                  alt="A spread of grilled meats, dips, and mezze dishes"
                  className="w-full h-full object-cover block"
                />
                {/* Gloss sheen that reinforces the 3D angle */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
              </div>

              {/* Floating badge — bottom right */}
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-4 -right-3 hidden sm:flex items-center gap-2 rounded-full bg-card border border-border shadow-xl px-3.5 py-2"
              >
                <Star className="size-4 text-primary fill-primary" />
                <span style={{ fontSize: "0.82rem" }}>4.9 · 2.3k made this</span>
              </motion.div>

              {/* Floating badge — top left */}
              <motion.div
                initial={{ opacity: 0, y: -14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -top-4 -left-3 hidden sm:flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-xl px-3.5 py-2"
              >
                <ChefHat className="size-4" />
                <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>Real home cooks</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-32 -right-32 size-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-40 size-[24rem] rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* ---- Categories ---- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display" style={{ fontSize: "2rem" }}>Browse by mood</h2>
            <p className="text-muted-foreground mt-1">Whatever you're in the mood to make.</p>
          </div>
          <Link to="/explore" className="text-primary hover:underline hidden sm:inline-flex items-center gap-1" style={{ fontSize: "0.9rem" }}>
            All recipes <ArrowRight className="size-4" />
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.04}>
              <Link to={`/explore?category=${c.id}`} className="group relative block rounded-2xl overflow-hidden aspect-[3/4]">
                <ImageWithFallback src={img(c.image, 400, 520)} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="font-display leading-tight" style={{ fontSize: "1.05rem" }}>{c.name}</div>
                  <div className="opacity-80" style={{ fontSize: "0.72rem" }}>{c.blurb}</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Featured ---- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
        <Reveal className="flex items-center gap-2 mb-6">
          <Sparkles className="size-5 text-primary" />
          <h2 className="font-display" style={{ fontSize: "2rem" }}>Curators' picks</h2>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)
            : featured.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} />)}
        </div>
      </section>

      {/* ---- Trending ---- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
        <Reveal className="flex items-center gap-2 mb-6">
          <TrendingUp className="size-5 text-primary" />
          <h2 className="font-display" style={{ fontSize: "2rem" }}>Trending this week</h2>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <RecipeCardSkeleton key={i} />)
            : trending.slice(0, 4).map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} />)}
        </div>
      </section>

      {/* ---- Creator CTA ---- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-accent text-accent-foreground p-8 md:p-14 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", lineHeight: 1.08 }}>
                Have a recipe worth sharing?
              </h2>
              <p className="mt-3 text-accent-foreground/85 max-w-md">
                Publish structured recipes with photos, timings and steps. Build a following of home cooks who love what you make.
              </p>
              <Button asChild variant="secondary" className="rounded-full h-12 px-7 mt-6">
                <Link to="/creator">Open the creator studio <ArrowRight className="size-4" /></Link>
              </Button>
            </div>
            <div className="relative h-56 md:h-72">
              <ImageWithFallback src={img("1592837613828-4b65deb44f15", 600, 500)} alt="Cook rolling dough" className="absolute right-0 top-0 w-3/4 h-full object-cover rounded-2xl rotate-2 shadow-xl" />
              <ImageWithFallback src={img("1518737003272-dac7c4760d5e", 400, 400)} alt="A finished dish" className="absolute left-0 bottom-0 w-1/2 aspect-square object-cover rounded-2xl -rotate-3 border-4 border-accent shadow-xl" />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
