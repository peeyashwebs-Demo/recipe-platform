"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChefHat, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isWide, setIsWide] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const container = document.getElementById("hero-container");
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsWide(entry.contentRect.width > 640);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recipes?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (isWide) {
    return (
      <div
        id="hero-container"
        className="container-query relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[#a04020] text-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[420px]">
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="w-6 h-6" />
                <span className="text-sm font-medium opacity-80">
                  Your Digital Cookbook
                </span>
              </div>
              <h1
                className="text-[var(--text-display)] font-bold mb-4 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Cook with
                <br />
                Confidence
              </h1>
              <p className="text-lg opacity-90 mb-8 max-w-md">
                Discover, create, and share recipes. Smart scaling, hands-free
                cooking mode, and a beautiful cookbook experience.
              </p>

              <form onSubmit={handleSearch} className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fg-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Something with chicken and leftover rice..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/15 backdrop-blur-sm text-white placeholder:text-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                />
              </form>

              <div className="flex items-center gap-4 mt-6 text-sm opacity-75">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>1,200+ recipes</span>
                </div>
                <span>|</span>
                <span>500+ creators</span>
              </div>
            </motion.div>
          </div>

          <div className="hidden md:flex items-center justify-center p-8 relative">
            <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <ChefHat className="w-32 h-32 lg:w-40 lg:h-40 opacity-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="hero-container"
      className="container-query relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[#a04020] text-white"
    >
      <div className="relative min-h-[300px] flex items-end p-6">
        <div className="absolute inset-0 bg-black/30" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 w-full"
        >
          <h2
            className="text-[var(--text-h2)] font-bold mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Cook with Confidence
          </h2>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fg-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/95 text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </form>
        </motion.div>
      </div>
    </div>
  );
}
