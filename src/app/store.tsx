import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Recipe, Review, Collection, User, RecipeStatus } from "./data/seed";
import { supabase, api } from "./lib/api";

export interface RatingSummary { average: number; count: number; }
type EnrichedRecipe = Recipe & { rating?: RatingSummary; creator?: { id: string; name: string; avatar: string } };

interface StoreValue {
  recipes: EnrichedRecipe[];
  reviews: Review[];
  profiles: User[];
  collections: Collection[];
  currentUser: User | null;
  savedIds: string[];
  ready: boolean;

  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;

  ratingFor: (recipeId: string) => RatingSummary;
  userById: (id: string) => User | undefined;
  reviewsFor: (recipeId: string) => Review[];

  toggleSave: (recipeId: string) => Promise<void>;
  isSaved: (recipeId: string) => boolean;
  createCollection: (name: string, emoji: string) => Promise<void>;
  addToCollection: (collectionId: string, recipeId: string) => Promise<void>;
  myCollections: () => Collection[];

  addReview: (recipeId: string, rating: number, comment: string) => Promise<void>;
  toggleReviewHidden: (recipeId: string, reviewId: string) => Promise<void>;

  addRecipe: (r: Omit<Recipe, "id" | "createdAt" | "creatorId" | "status" | "featured">) => Promise<string>;
  setRecipeStatus: (id: string, status: RecipeStatus) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<EnrichedRecipe[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ recipes: EnrichedRecipe[]; reviews: Review[]; profiles: User[] }>("/bootstrap");
      setRecipes(data.recipes ?? []);
      setReviews((prev) => {
        // keep admin's hidden reviews if we already have a superset
        return data.reviews ?? prev;
      });
      setProfiles(data.profiles ?? []);
    } catch (e) {
      console.error("Failed to load recipes:", (e as Error).message);
    }
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        setCurrentUser(null); setSavedIds([]); setCollections([]);
        return;
      }
      const me = await api<{ profile: User; saved: string[]; collections: Collection[]; allReviews?: Review[] }>("/me", { auth: true });
      setCurrentUser(me.profile);
      setSavedIds(me.saved ?? []);
      setCollections(me.collections ?? []);
      if (me.allReviews) setReviews(me.allReviews);
    } catch (e) {
      console.error("Failed to load account:", (e as Error).message);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
        await refreshMe();
      } catch (e) {
        console.error("Boot error:", (e as Error).message);
      } finally {
        setReady(true);
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { refreshMe(); });
    return () => sub.subscription.unsubscribe();
  }, [refresh, refreshMe]);

  // ---- auth ----
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Sign-in error:", error.message);
      return { ok: false, error: "That email and password don't match. Try again." };
    }
    await Promise.all([refresh(), refreshMe()]);
    return { ok: true };
  }, [refresh, refreshMe]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      await api("/signup", { method: "POST", body: { name, email, password } });
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "Account created, but sign-in failed. Try signing in." };
    await Promise.all([refresh(), refreshMe()]);
    return { ok: true };
  }, [refresh, refreshMe]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null); setSavedIds([]); setCollections([]);
    await refresh();
  }, [refresh]);

  // ---- derived ----
  const ratingMap = useMemo(() => {
    const m: Record<string, RatingSummary> = {};
    recipes.forEach((r) => { if (r.rating) m[r.id] = r.rating; });
    return m;
  }, [recipes]);

  const ratingFor = useCallback((recipeId: string) => ratingMap[recipeId] ?? { average: 0, count: 0 }, [ratingMap]);
  const userById = useCallback((id: string) => profiles.find((p) => p.id === id), [profiles]);
  const reviewsFor = useCallback((recipeId: string) => reviews.filter((r) => r.recipeId === recipeId), [reviews]);

  // ---- saves / collections ----
  const isSaved = useCallback((recipeId: string) => savedIds.includes(recipeId), [savedIds]);

  const toggleSave = useCallback(async (recipeId: string) => {
    const prev = savedIds;
    setSavedIds((s) => (s.includes(recipeId) ? s.filter((id) => id !== recipeId) : [...s, recipeId]));
    try {
      const res = await api<{ saved: string[] }>(`/saved/${recipeId}`, { method: "POST", auth: true });
      setSavedIds(res.saved);
    } catch (e) {
      console.error("Toggle save failed:", (e as Error).message);
      setSavedIds(prev);
    }
  }, [savedIds]);

  const createCollection = useCallback(async (name: string, emoji: string) => {
    await api("/collections", { method: "POST", body: { name, emoji }, auth: true });
    await refreshMe();
  }, [refreshMe]);

  const addToCollection = useCallback(async (collectionId: string, recipeId: string) => {
    await api(`/collections/${collectionId}/recipes/${recipeId}`, { method: "POST", auth: true });
    await refreshMe();
  }, [refreshMe]);

  const myCollections = useCallback(() => collections, [collections]);

  // ---- reviews ----
  const addReview = useCallback(async (recipeId: string, rating: number, comment: string) => {
    await api(`/recipes/${recipeId}/reviews`, { method: "POST", body: { rating, comment }, auth: true });
    await refresh();
    await refreshMe();
  }, [refresh, refreshMe]);

  const toggleReviewHidden = useCallback(async (recipeId: string, reviewId: string) => {
    await api(`/reviews/${recipeId}/${reviewId}/hidden`, { method: "PATCH", auth: true });
    await refresh();
    await refreshMe();
  }, [refresh, refreshMe]);

  // ---- recipes ----
  const addRecipe = useCallback<StoreValue["addRecipe"]>(async (r) => {
    const res = await api<{ recipe: Recipe }>("/recipes", { method: "POST", body: r, auth: true });
    await refresh();
    return res.recipe.id;
  }, [refresh]);

  const setRecipeStatus = useCallback(async (id: string, status: RecipeStatus) => {
    await api(`/recipes/${id}/status`, { method: "PATCH", body: { status }, auth: true });
    await refresh();
  }, [refresh]);

  const toggleFeatured = useCallback(async (id: string) => {
    await api(`/recipes/${id}/feature`, { method: "PATCH", auth: true });
    await refresh();
  }, [refresh]);

  const deleteRecipe = useCallback(async (id: string) => {
    await api(`/recipes/${id}`, { method: "DELETE", auth: true });
    await refresh();
  }, [refresh]);

  const value: StoreValue = {
    recipes, reviews, profiles, collections, currentUser, savedIds, ready,
    signIn, signUp, signOut,
    ratingFor, userById, reviewsFor,
    toggleSave, isSaved, createCollection, addToCollection, myCollections,
    addReview, toggleReviewHidden,
    addRecipe, setRecipeStatus, toggleFeatured, deleteRecipe,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

const noop = async () => {};
const fallbackStore: StoreValue = {
  recipes: [], reviews: [], profiles: [], collections: [], currentUser: null, savedIds: [], ready: false,
  signIn: async () => ({ ok: false }), signUp: async () => ({ ok: false }), signOut: noop,
  ratingFor: () => ({ average: 0, count: 0 }),
  userById: () => undefined,
  reviewsFor: () => [],
  toggleSave: noop, isSaved: () => false,
  createCollection: noop, addToCollection: noop, myCollections: () => [],
  addReview: noop, toggleReviewHidden: noop,
  addRecipe: async () => "", setRecipeStatus: noop, toggleFeatured: noop, deleteRecipe: noop,
};

export function useStore() {
  return useContext(StoreContext) ?? fallbackStore;
}
