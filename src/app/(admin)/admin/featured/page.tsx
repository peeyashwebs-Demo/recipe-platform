"use client";

import { useState, useEffect } from "react";
import { Shield, Star, GripVertical, Trash2, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/lib/stores";

export default function FeaturedPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [featured, setFeatured] = useState<Array<{ id: string; title: string; author: string; rating: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("recipes")
        .select("id, title, rating_average, author_id, profiles(display_name)")
        .eq("status", "published")
        .order("rating_average", { ascending: false })
        .limit(10);

      if (data) {
        setFeatured(
          data.map((r) => ({
            id: r.id,
            title: r.title,
            author: (r.profiles as { display_name?: string })?.display_name || "Unknown",
            rating: r.rating_average || 0,
          }))
        );
      }
      setIsLoading(false);
    };

    fetchFeatured();
  }, []);

  const remove = (id: string) => {
    setFeatured(featured.filter((f) => f.id !== id));
    addToast("Removed from featured", "success");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-[var(--accent-primary)]" />
        <h1
          className="text-[var(--text-h3)] font-bold text-[var(--fg-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Featured Content
        </h1>
      </div>

      <p className="text-sm text-[var(--fg-secondary)]">
        Manage the featured carousel on the homepage.
      </p>

      <div className="space-y-3">
        {isLoading ? (
          <Card className="text-center py-8">
            <p className="text-sm text-[var(--fg-muted)]">Loading featured recipes...</p>
          </Card>
        ) : featured.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm text-[var(--fg-muted)]">No featured recipes yet.</p>
          </Card>
        ) : (
          featured.map((item, index) => (
            <Card key={item.id} variant="interactive" className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-[var(--fg-muted)] cursor-grab flex-shrink-0" />
              <span className="w-7 h-7 rounded-full bg-[var(--accent-primary)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-[var(--fg-primary)]">{item.title}</p>
                <p className="text-xs text-[var(--fg-muted)]">
                  by {item.author} &middot;{" "}
                  <Star className="w-3 h-3 inline fill-[var(--state-warning)] text-[var(--state-warning)]" />{" "}
                  {item.rating.toFixed(1)}
                </p>
              </div>
              <button
                onClick={() => remove(item.id)}
                className="p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--state-danger)] hover:bg-[var(--state-danger)]/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
