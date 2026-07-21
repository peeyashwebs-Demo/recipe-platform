"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: CommandItem[] = [
    {
      id: "search-recipes",
      label: "Search Recipes",
      description: "Browse all recipes",
      icon: <Search className="w-4 h-4" />,
      action: () => {
        router.push("/recipes");
        setIsOpen(false);
      },
    },
    {
      id: "new-recipe",
      label: "Create New Recipe",
      description: "Open the recipe builder",
      icon: <ArrowRight className="w-4 h-4" />,
      action: () => {
        router.push("/creator/new");
        setIsOpen(false);
      },
    },
    {
      id: "my-collections",
      label: "My Collections",
      description: "View saved recipes",
      icon: <ArrowRight className="w-4 h-4" />,
      action: () => {
        router.push("/collections");
        setIsOpen(false);
      },
    },
    {
      id: "cooking-mode",
      label: "Start Cooking Mode",
      description: "Hands-free step-by-step",
      icon: <ArrowRight className="w-4 h-4" />,
      action: () => setIsOpen(false),
    },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--fg-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--border-default)] transition-colors cursor-pointer"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-[var(--overlay)] p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-lg bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl shadow-[var(--shadow-lg)] overflow-hidden backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 border-b border-[var(--border-subtle)]">
                <Search className="w-4 h-4 text-[var(--fg-muted)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyNavigation}
                  placeholder="Type a command or search..."
                  className="flex-1 py-3 bg-transparent text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] outline-none"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <p className="text-center text-sm text-[var(--fg-muted)] py-8">
                    No results found.
                  </p>
                ) : (
                  filtered.map((cmd, index) => (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer
                        ${index === selectedIndex ? "bg-[var(--bg-surface)]" : "hover:bg-[var(--bg-surface)]"}`}
                    >
                      <span className="text-[var(--fg-muted)]">{cmd.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--fg-primary)]">
                          {cmd.label}
                        </p>
                        {cmd.description && (
                          <p className="text-xs text-[var(--fg-muted)]">
                            {cmd.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
