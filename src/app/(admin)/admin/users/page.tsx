"use client";

import { useState, useEffect } from "react";
import { Shield, Search, MoreHorizontal } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

interface UserData {
  id: string;
  display_name: string;
  email: string;
  role: string;
  created_at: string;
}

const roleColors: Record<string, string> = {
  admin: "bg-[var(--state-danger)]/10 text-[var(--state-danger)]",
  creator: "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]",
  user: "bg-[var(--bg-surface)] text-[var(--fg-secondary)]",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, role, created_at");

      if (!profiles) { setIsLoading(false); return; }

      const { data: authUsers } = await supabase.auth.admin.listUsers();

      const merged = profiles.map((p) => {
        const authUser = authUsers?.users?.find((u) => u.id === p.id);
        return {
          id: p.id,
          display_name: p.display_name || "User",
          email: authUser?.email || "unknown@email.com",
          role: p.role || "user",
          created_at: p.created_at,
        };
      });

      setUsers(merged);
      setIsLoading(false);
    };

    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.display_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[var(--accent-primary)]" />
          <h1
            className="text-[var(--text-h3)] font-bold text-[var(--fg-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            User Management
          </h1>
        </div>
        <div className="w-64">
          <Input showSearch placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left px-5 py-3 font-medium text-[var(--fg-secondary)]">User</th>
                <th className="text-left px-5 py-3 font-medium text-[var(--fg-secondary)]">Role</th>
                <th className="text-left px-5 py-3 font-medium text-[var(--fg-secondary)]">Joined</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[var(--fg-muted)]">Loading users...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[var(--fg-muted)]">No users found</td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-surface)] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-[var(--fg-primary)]">{user.display_name}</p>
                        <p className="text-xs text-[var(--fg-muted)]">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${roleColors[user.role] || roleColors.user}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[var(--fg-muted)]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <button className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:bg-[var(--bg-surface)] cursor-pointer">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
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
