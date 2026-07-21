"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, Search, BookOpen, User, PlusSquare, LogOut, Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import CommandPalette from "./CommandPalette";
import { useAuthStore } from "@/lib/stores";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/recipes", label: "Recipes", icon: Search },
  { href: "/creator", label: "Create", icon: PlusSquare },
  { href: "/collections", label: "My Book", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Desktop Top Nav */}
      <nav className="sticky top-0 z-40 hidden md:block bg-[var(--surface-1)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-xl font-bold text-[var(--accent-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Moxn
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? "bg-[var(--bg-surface)] text-[var(--accent-primary)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
            {!isLoading && profile?.role === "admin" && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname.startsWith("/admin") ? "bg-[var(--bg-surface)] text-[var(--accent-primary)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"}`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <CommandPalette />
            <ThemeToggle />
            {!isLoading && profile && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--state-danger)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--surface-1)]/90 backdrop-blur-md border-t border-[var(--border-subtle)] safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-[56px]
                  ${isActive ? "text-[var(--accent-primary)]" : "text-[var(--fg-muted)]"}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[var(--accent-primary)]" : ""}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
