"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, Eye } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore, useToastStore } from "@/lib/stores";

interface Flag {
  id: string;
  recipe_id: string;
  reason: string;
  reported_by: string;
  status: string;
  created_at: string;
  recipes?: { title: string };
}

export default function ModerationPage() {
  const { profile } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("flagged_content")
        .select("*, recipes(title)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      setFlags(data || []);
      setIsLoading(false);
    };

    fetchFlags();
  }, []);

  const handleAction = async (flagId: string, action: "resolved" | "dismissed") => {
    const supabase = createClient();

    await supabase
      .from("flagged_content")
      .update({ status: action })
      .eq("id", flagId);

    if (action === "resolved") {
      const flag = flags.find((f) => f.id === flagId);
      if (flag) {
        await supabase
          .from("recipes")
          .update({ status: "archived" })
          .eq("id", flag.recipe_id);
      }
    }

    if (profile) {
      await supabase.from("audit_log").insert({
        admin_id: profile.id,
        action: action === "resolved" ? "Removed recipe" : "Dismissed flag",
        target_type: "recipe",
        target_id: flagId,
        details: { action },
      });
    }

    setFlags(flags.filter((f) => f.id !== flagId));
    addToast(action === "resolved" ? "Content removed" : "Flag dismissed", "success");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-[var(--accent-primary)]" />
        <div>
          <h1
            className="text-[var(--text-h3)] font-bold text-[var(--fg-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Moderation Queue
          </h1>
          <p className="text-sm text-[var(--fg-secondary)]">
            {isLoading ? "Loading..." : `${flags.length} items pending review`}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card className="text-center py-12">
            <p className="text-[var(--fg-muted)]">Loading flagged content...</p>
          </Card>
        ) : flags.length === 0 ? (
          <Card className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-[var(--state-success)] mx-auto mb-3" />
            <p className="text-lg font-medium text-[var(--fg-primary)]">All caught up!</p>
            <p className="text-sm text-[var(--fg-muted)] mt-1">No flagged content to review</p>
          </Card>
        ) : (
          flags.map((flag) => (
            <Card key={flag.id} variant="elevated">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--fg-primary)]">
                    {flag.recipes?.title || "Unknown Recipe"}
                  </h3>
                  <p className="text-sm text-[var(--fg-secondary)] mt-1">
                    <strong>Reason:</strong> {flag.reason}
                  </p>
                  <p className="text-xs text-[var(--fg-muted)] mt-1">
                    Reported {new Date(flag.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<XCircle className="w-4 h-4" />}
                    onClick={() => handleAction(flag.id, "resolved")}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => handleAction(flag.id, "dismissed")}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
