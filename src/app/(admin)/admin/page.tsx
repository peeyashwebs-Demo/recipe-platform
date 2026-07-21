"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  FileText,
  Flag,
  TrendingUp,
  Star,
  ArrowRight,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: "Total Recipes", value: "0", icon: FileText, color: "var(--accent-primary)" },
    { label: "Active Users", value: "0", icon: Users, color: "var(--state-success)" },
    { label: "Flagged Content", value: "0", icon: Flag, color: "var(--state-warning)" },
    { label: "Avg Rating", value: "0", icon: Star, color: "var(--state-warning)" },
  ]);
  const [flagCount, setFlagCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const [recipesRes, usersRes, flagsRes, ratingRes] = await Promise.all([
        supabase.from("recipes").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("flagged_content").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("recipes").select("rating_average").eq("status", "published"),
      ]);

      const avgRating = ratingRes.data?.length
        ? (ratingRes.data.reduce((sum, r) => sum + (r.rating_average || 0), 0) / ratingRes.data.length).toFixed(1)
        : "0";

      setFlagCount(flagsRes.count || 0);
      setStats([
        { label: "Total Recipes", value: (recipesRes.count || 0).toLocaleString(), icon: FileText, color: "var(--accent-primary)" },
        { label: "Active Users", value: (usersRes.count || 0).toLocaleString(), icon: Users, color: "var(--state-success)" },
        { label: "Flagged Content", value: (flagsRes.count || 0).toString(), icon: Flag, color: "var(--state-warning)" },
        { label: "Avg Rating", value: avgRating, icon: Star, color: "var(--state-warning)" },
      ]);
    };

    fetchData();
  }, []);

  const adminLinks = [
    { href: "/admin/moderation", label: "Moderation Queue", description: "Review flagged content", icon: Flag, badge: flagCount },
    { href: "/admin/users", label: "User Management", description: "Manage all users", icon: Users },
    { href: "/admin/featured", label: "Featured Content", description: "Curate the homepage", icon: Star },
    { href: "/admin/audit", label: "Audit Log", description: "Activity history", icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-[var(--accent-primary)]" />
        <div>
          <h1
            className="text-[var(--text-h2)] font-bold text-[var(--fg-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Admin Dashboard
          </h1>
          <p className="text-sm text-[var(--fg-secondary)] mt-0.5">
            Platform overview and management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} variant="interactive">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p
                  className="text-xl font-bold text-[var(--fg-primary)] tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--fg-muted)]">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card variant="interactive" className="flex items-center justify-between h-full">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center">
                  <link.icon className="w-5 h-5 text-[var(--fg-secondary)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--fg-primary)]">{link.label}</p>
                    {link.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-[var(--state-warning)] text-white rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--fg-muted)]">{link.description}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--fg-muted)]" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
