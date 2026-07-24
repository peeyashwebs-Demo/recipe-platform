import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { ChefHat, Search, Menu, X, BookMarked, Shield, LogOut, PenLine, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useStore } from "../store";
import { useAuthUI } from "./auth-ui";
import { toast } from "sonner";

const nav = [
  { to: "/explore", label: "Explore" },
  { to: "/collections", label: "Collections" },
  { to: "/creator", label: "For Cooks" },
];

export function SiteHeader() {
  const { currentUser, signOut } = useStore();
  const { openAuth } = useAuthUI();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarOverride, setAvatarOverride] = useState<string | null>(() =>
    localStorage.getItem("larder-avatar")
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem("larder-avatar", dataUrl);
      setAvatarOverride(dataUrl);
      toast("Profile photo updated");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid place-items-center size-9 rounded-full bg-primary text-primary-foreground">
            <ChefHat className="size-5" />
          </span>
          <span className="font-display" style={{ fontSize: "1.35rem", letterSpacing: "-0.01em" }}>Larder</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-2">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-full transition-colors ${
                  isActive ? "text-primary" : "text-foreground/75 hover:text-foreground"
                }`
              }
              style={{ fontSize: "0.9rem" }}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden lg:flex items-center gap-2 ml-auto rounded-full bg-input-background border border-border px-3.5 h-9 w-64 focus-within:ring-2 focus-within:ring-primary/40 transition-shadow">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search recipes, cuisines…"
            className="bg-transparent outline-none w-full placeholder:text-muted-foreground"
            style={{ fontSize: "0.85rem" }}
          />
        </form>

        <div className="flex items-center gap-2 lg:ml-0 ml-auto">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1 pr-3 h-10 hover:bg-secondary transition-colors">
                  <img src={avatarOverride ?? currentUser.avatar} alt={currentUser.name} className="size-8 rounded-full object-cover" />
                  <span className="hidden sm:block max-w-[110px] truncate" style={{ fontSize: "0.85rem" }}>{currentUser.name.split(" ")[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{currentUser.name}</span>
                  <span className="text-muted-foreground font-normal" style={{ fontSize: "0.75rem" }}>{currentUser.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Camera className="size-4" /> Change photo
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/collections")}><BookMarked className="size-4" /> Saved & collections</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/creator")}><PenLine className="size-4" /> Creator studio</DropdownMenuItem>
                {currentUser.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}><Shield className="size-4" /> Curation desk</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { signOut(); toast("Signed out"); navigate("/"); }}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex rounded-full" onClick={() => openAuth("signin")}>Sign in</Button>
              <Button className="rounded-full" onClick={() => openAuth("signup")}>Join free</Button>
            </>
          )}
          <button className="md:hidden grid place-items-center size-9 rounded-full hover:bg-secondary" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="px-4 py-4 space-y-1">
              <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full bg-input-background border border-border px-3.5 h-10 mb-2">
                <Search className="size-4 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recipes…" className="bg-transparent outline-none w-full" style={{ fontSize: "0.9rem" }} />
              </form>
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-secondary">
                  {n.label}
                </Link>
              ))}
              {currentUser?.role === "admin" && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-secondary">Curation desk</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />
    </header>
  );
}
