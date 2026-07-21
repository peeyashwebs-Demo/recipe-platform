"use client";

import { User, Settings, BookOpen, Star, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { useAuthStore } from "@/lib/stores";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const { profile } = useAuthStore();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
      <h1
        className="text-[var(--text-h2)] font-bold text-[var(--fg-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Profile
      </h1>

      <Card className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-[var(--accent-primary)]" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--fg-primary)]" style={{ fontFamily: "var(--font-display)" }}>
            {profile?.display_name || "User"}
          </h2>
          <p className="text-sm text-[var(--fg-secondary)]">{profile?.email}</p>
          <p className="text-xs text-[var(--fg-muted)] mt-1">
            {profile?.role === "admin" ? "Administrator" : profile?.role === "creator" ? "Creator" : "Member"} &middot; Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="interactive" className="text-center">
          <p className="text-2xl font-bold text-[var(--accent-primary)] tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>0</p>
          <p className="text-sm text-[var(--fg-secondary)] mt-1">Saved Recipes</p>
        </Card>
        <Card variant="interactive" className="text-center">
          <p className="text-2xl font-bold text-[var(--accent-primary)] tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>0</p>
          <p className="text-sm text-[var(--fg-secondary)] mt-1">Collections</p>
        </Card>
        <Card variant="interactive" className="text-center">
          <p className="text-2xl font-bold text-[var(--accent-primary)] tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>{profile?.unit_preference === "imperial" ? "imperial" : "metric"}</p>
          <p className="text-sm text-[var(--fg-secondary)] mt-1">Unit System</p>
        </Card>
      </div>

      <div className="space-y-2">
        <Card variant="interactive" className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-[var(--fg-secondary)]" />
          <span className="text-sm text-[var(--fg-primary)]">Account Settings</span>
        </Card>
        <Card variant="interactive" className="flex items-center gap-3" onClick={() => router.push("/collections")}>
          <BookOpen className="w-5 h-5 text-[var(--fg-secondary)]" />
          <span className="text-sm text-[var(--fg-primary)]">My Cookbook</span>
        </Card>
        <Card variant="interactive" className="flex items-center gap-3">
          <Star className="w-5 h-5 text-[var(--fg-secondary)]" />
          <span className="text-sm text-[var(--fg-primary)]">My Reviews</span>
        </Card>
        <Card variant="interactive" className="flex items-center gap-3 text-[var(--state-danger)]" onClick={handleSignOut}>
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sign Out</span>
        </Card>
      </div>
    </div>
  );
}
