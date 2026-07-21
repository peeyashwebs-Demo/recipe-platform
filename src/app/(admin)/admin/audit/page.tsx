"use client";

import { useState, useEffect } from "react";
import { Shield, Star } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

interface AuditEntry {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  created_at: string;
  profiles?: { display_name: string };
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("audit_log")
        .select("*, profiles(display_name)")
        .order("created_at", { ascending: false })
        .limit(50);

      setEntries(data || []);
      setIsLoading(false);
    };

    fetchAudit();
  }, []);

  const actionColors: Record<string, string> = {
    "Removed recipe": "text-[var(--state-danger)]",
    "Featured recipe": "text-[var(--state-success)]",
    "Suspended user": "text-[var(--state-warning)]",
    "Dismissed flag": "text-[var(--fg-secondary)]",
    "Updated user role": "text-[var(--accent-primary)]",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[var(--accent-primary)]" />
          <h1
            className="text-[var(--text-h3)] font-bold text-[var(--fg-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Audit Log
          </h1>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left px-5 py-3 font-medium text-[var(--fg-secondary)]">Action</th>
                <th className="text-left px-5 py-3 font-medium text-[var(--fg-secondary)]">Target</th>
                <th className="text-left px-5 py-3 font-medium text-[var(--fg-secondary)]">Admin</th>
                <th className="text-left px-5 py-3 font-medium text-[var(--fg-secondary)]">Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[var(--fg-muted)]">Loading audit log...</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[var(--fg-muted)]">No audit entries yet</td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-surface)] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className={`font-medium ${actionColors[entry.action] || "text-[var(--fg-primary)]"}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[var(--fg-primary)]">{entry.target_id.slice(0, 8)}...</td>
                    <td className="px-5 py-3 text-[var(--fg-secondary)]">{entry.profiles?.display_name || "Unknown"}</td>
                    <td className="px-5 py-3 text-[var(--fg-muted)] whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
