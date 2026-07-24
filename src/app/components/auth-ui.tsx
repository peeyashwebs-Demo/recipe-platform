import { createContext, useContext, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useStore } from "../store";
import { toast } from "sonner";
import { ChefHat, Sparkles } from "lucide-react";
import { img } from "../data/seed";

interface AuthUI {
  /** Runs `action` if signed in, otherwise opens the auth dialog with a reason. */
  requireAuth: (action: () => void, reason?: string) => void;
  openAuth: (mode?: "signin" | "signup", reason?: string) => void;
}

const AuthUIContext = createContext<AuthUI | null>(null);

export function AuthUIProvider({ children }: { children: ReactNode }) {
  const { currentUser, signIn, signUp } = useStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [reason, setReason] = useState<string | undefined>();
  const [pending, setPending] = useState<(() => void) | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();

  const openAuth = (m: "signin" | "signup" = "signup", r?: string) => {
    setMode(m);
    setReason(r);
    setError(undefined);
    setOpen(true);
  };

  const requireAuth = (action: () => void, r?: string) => {
    if (currentUser) {
      action();
      return;
    }
    setPending(() => action);
    openAuth("signup", r);
  };

  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(undefined);
    setBusy(true);
    const res =
      mode === "signin" ? await signIn(email, password) : await signUp(name, email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOpen(false);
    toast.success(mode === "signin" ? "Welcome back to Larder" : "Your seat at the table is ready", {
      description: mode === "signin" ? "Pick up right where you left off." : "Start saving and reviewing recipes.",
    });
    const p = pending;
    setPending(null);
    setName(""); setEmail(""); setPassword("");
    if (p) setTimeout(p, 120);
  };

  return (
    <AuthUIContext.Provider value={{ requireAuth, openAuth }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden border-none max-w-[860px] sm:rounded-2xl gap-0 md:grid md:grid-cols-2 bg-card">
          {/* Photo panel */}
          <div className="relative hidden md:block">
            <img
              src={img("1528712306091-ed0763094c98", 700, 900)}
              alt="A cook at work in a warm kitchen"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
            <div className="relative h-full flex flex-col justify-between p-8 text-white">
              <div className="flex items-center gap-2 font-display" style={{ fontSize: "1.25rem" }}>
                <ChefHat className="size-6" /> Larder
              </div>
              <div>
                <p className="font-display" style={{ fontSize: "1.9rem", lineHeight: 1.15 }}>
                  Cook from the recipes people actually make.
                </p>
                <p className="mt-3 text-white/80" style={{ fontSize: "0.9rem" }}>
                  Save, scale and review — join a table of home cooks.
                </p>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="p-7 sm:p-9">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 mb-4" style={{ fontSize: "0.7rem", letterSpacing: "0.04em" }}>
              <Sparkles className="size-3.5" /> {mode === "signin" ? "WELCOME BACK" : "JOIN LARDER"}
            </div>
            <h2 className="font-display" style={{ fontSize: "1.6rem", lineHeight: 1.2 }}>
              {mode === "signin" ? "Sign in to keep cooking" : "Create your free account"}
            </h2>
            {reason && (
              <p className="text-muted-foreground mt-2" style={{ fontSize: "0.875rem" }}>
                {reason}
              </p>
            )}

            <div className="mt-6 space-y-4">
              <AnimatePresence initial={false} mode="popLayout">
                {mode === "signup" && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label htmlFor="au-name">Name</Label>
                    <Input id="au-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amara Okafor" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-2">
                <Label htmlFor="au-email">Email</Label>
                <Input id="au-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@table.co" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="au-pass">Password</Label>
                <Input id="au-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && submit()} />
              </div>
              {error && <p className="text-destructive" style={{ fontSize: "0.85rem" }}>{error}</p>}

              <Button className="w-full h-11 rounded-full" onClick={submit} disabled={busy}>
                {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
              </Button>

              <p className="text-center text-muted-foreground" style={{ fontSize: "0.85rem" }}>
                {mode === "signin" ? "New to Larder? " : "Already have an account? "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(undefined); }}
                >
                  {mode === "signin" ? "Create one" : "Sign in"}
                </button>
              </p>
              <p className="text-center text-muted-foreground/70" style={{ fontSize: "0.72rem" }}>
                Demo accounts: amara@table.co, leo@table.co, or curators@table.co (password: larderdemo).
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AuthUIContext.Provider>
  );
}

const fallbackAuthUI: AuthUI = {
  requireAuth: (action) => action(),
  openAuth: () => {},
};

export function useAuthUI() {
  return useContext(AuthUIContext) ?? fallbackAuthUI;
}
