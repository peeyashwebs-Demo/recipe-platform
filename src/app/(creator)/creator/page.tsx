"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, Eye, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores";

export default function CreatorDashboard() {
  const { profile } = useAuthStore();
  const [drafts, setDrafts] = useState<Array<{ id: string; title: string; updated_at: string }>>([]);
  const [published, setPublished] = useState<Array<{ id: string; title: string; rating_average: number; rating_count: number }>>([]);
  const [stats, setStats] = useState({ published: 0, drafts: 0 });

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!profile) return;
      const supabase = createClient();

      const { data } = await supabase
        .from("recipes")
        .select("id, title, status, updated_at, rating_average, rating_count")
        .eq("author_id", profile.id)
        .order("updated_at", { ascending: false });

      if (data) {
        setDrafts(data.filter((r) => r.status === "draft"));
        setPublished(data.filter((r) => r.status === "published"));
        setStats({
          published: data.filter((r) => r.status === "published").length,
          drafts: data.filter((r) => r.status === "draft").length,
        });
      }
    };

    fetchRecipes();
  }, [profile]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-[var(--text-h2)] font-bold text-[var(--fg-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Creator Studio
          </h1>
          <p className="text-sm text-[var(--fg-secondary)] mt-1">
            Manage your recipes and track performance
          </p>
        </div>
        <Link href="/creator/new">
          <Button icon={<Plus className="w-4 h-4" />}>New Recipe</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="interactive" className="text-center">
          <p className="text-2xl font-bold text-[var(--accent-primary)] tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>{stats.published}</p>
          <p className="text-sm text-[var(--fg-secondary)] mt-1">Published</p>
        </Card>
        <Card variant="interactive" className="text-center">
          <p className="text-2xl font-bold text-[var(--state-warning)] tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>{stats.drafts}</p>
          <p className="text-sm text-[var(--fg-secondary)] mt-1">Drafts</p>
        </Card>
        <Card variant="interactive" className="text-center">
          <p className="text-2xl font-bold text-[var(--state-success)] tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>{published.reduce((sum, r) => sum + r.rating_count, 0)}</p>
          <p className="text-sm text-[var(--fg-secondary)] mt-1">Total Ratings</p>
        </Card>
      </div>

      {/* Drafts */}
      <section>
        <h2
          className="text-[var(--text-h3)] font-semibold text-[var(--fg-primary)] mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Drafts
        </h2>
        <div className="space-y-3">
          {drafts.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-[var(--fg-muted)]">No drafts yet. Start creating!</p>
            </Card>
          ) : (
            drafts.map((draft) => (
              <Card key={draft.id} variant="interactive" className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[var(--fg-muted)]" />
                  <div>
                    <p className="font-medium text-[var(--fg-primary)]">{draft.title}</p>
                    <p className="text-xs text-[var(--fg-muted)]">
                      Last edited {new Date(draft.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Link href={`/creator/${draft.id}`} className="text-sm text-[var(--accent-primary)] hover:underline">
                  Edit
                </Link>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Published */}
      <section>
        <h2
          className="text-[var(--text-h3)] font-semibold text-[var(--fg-primary)] mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Published
        </h2>
        <div className="space-y-3">
          {published.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-[var(--fg-muted)]">No published recipes yet.</p>
            </Card>
          ) : (
            published.map((recipe) => (
              <Card key={recipe.id} variant="interactive" className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-[var(--fg-muted)]" />
                  <div>
                    <p className="font-medium text-[var(--fg-primary)]">{recipe.title}</p>
                    <div className="flex items-center gap-3 text-xs text-[var(--fg-muted)] mt-0.5">
                      <span>{recipe.rating_count} ratings</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {recipe.rating_average}
                      </span>
                    </div>
                  </div>
                </div>
                <Link href={`/recipes/${recipe.id}`} className="text-sm text-[var(--accent-primary)] hover:underline">
                  View
                </Link>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
