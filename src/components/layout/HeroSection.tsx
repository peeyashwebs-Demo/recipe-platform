"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isWide, setIsWide] = useState(true);
  const router = useRouter();
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 400], [0, 50]);

  useEffect(() => {
    const container = document.getElementById("hero-container");
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsWide(entry.contentRect.width > 720);
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

  return (
    <div
      id="hero-container"
      className="container-query relative overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)]"
    >
      <div
        className={`relative grid ${
          isWide ? "md:grid-cols-[1.1fr_1fr]" : "grid-cols-1"
        } min-h-[500px] md:min-h-[560px]`}
      >
        {/* Left — editorial masthead */}
        <div className="relative flex flex-col justify-center px-6 py-14 md:px-14 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-lg"
          >
            <div className="flex items-center gap-3 mb-7">
              <span className="h-px w-8 bg-[var(--accent-primary)]" />
              <span
                className="text-xs tracking-[0.2em] uppercase text-[var(--fg-secondary)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                The Digital Cookbook
              </span>
            </div>

            <h1
              className="text-[var(--text-display)] font-normal text-[var(--fg-primary)] mb-6 leading-[1.08]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Cook with
              <br />
              <span className="italic text-[var(--accent-primary)]">
                confidence
              </span>
              <span className="text-[var(--fg-primary)]">.</span>
            </h1>

            <p className="text-base md:text-lg text-[var(--fg-secondary)] mb-9 leading-relaxed">
              A considered collection of recipes worth returning to — with
              smart scaling, a hands-free cooking mode, and the quiet
              confidence of a well-worn cookbook.
            </p>

            <form onSubmit={handleSearch} className="relative max-w-md">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Something with chicken and leftover rice…"
                className="w-full pl-7 pr-3 py-3 bg-transparent border-b-[1.5px] border-[var(--border-default)] text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--accent-primary)] text-sm transition-colors duration-[var(--duration-base)]"
              />
            </form>

            <div className="flex items-center gap-5 mt-9 text-sm text-[var(--fg-muted)]">
              <span
                className="font-semibold text-[var(--fg-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                1,200+
              </span>
              <span>recipes catalogued</span>
              <span className="w-1 h-1 rounded-full bg-[var(--border-default)]" />
              <span
                className="font-semibold text-[var(--fg-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                500+
              </span>
              <span>creators</span>
            </div>
          </motion.div>

          {/* scroll cue — subtle, classic touch */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 6, 0] }}
            transition={{
              opacity: { delay: 1.1, duration: 0.5 },
              y: { delay: 1.1, duration: 1.8, repeat: Infinity, ease: "easeInOut" },
            }}
            className="hidden md:flex absolute bottom-8 left-14 lg:left-20 items-center gap-2 text-[var(--fg-muted)] text-xs tracking-wide uppercase"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            Explore the collection
          </motion.div>
        </div>

        {/* Right — restrained photography frame, not full-bleed */}
        {isWide && (
          <motion.div
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
            className="relative m-3 md:m-4 rounded-md overflow-hidden"
          >
            <motion.div
              aria-hidden
              style={{ y: imageY }}
              className="absolute inset-0 -top-6 -bottom-6"
            >
              <img
                src={HERO_IMAGE}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
