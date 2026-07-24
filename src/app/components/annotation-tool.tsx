import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquarePlus, X, Copy, Trash2, Check, PenLine, ChevronRight } from "lucide-react";

interface Annotation {
  id: string;
  x: number; // % of page width
  y: number; // px from page top
  text: string;
  createdAt: number;
}

function useAnnotations() {
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    try { return JSON.parse(localStorage.getItem("larder-annotations") ?? "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("larder-annotations", JSON.stringify(annotations));
  }, [annotations]);

  const add = (a: Annotation) => setAnnotations(prev => [...prev, a]);
  const remove = (id: string) => setAnnotations(prev => prev.filter(a => a.id !== id));
  const clear = () => setAnnotations([]);

  return { annotations, add, remove, clear };
}

interface PinProps {
  annotation: Annotation;
  index: number;
  onRemove: () => void;
}

function Pin({ annotation, index, onRemove }: PinProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="absolute z-[9998]"
      style={{ left: `${annotation.x}%`, top: annotation.y }}
    >
      {/* Pin dot */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-2 ring-white/80 hover:scale-110 transition-transform -translate-x-1/2 -translate-y-1/2 font-semibold"
        style={{ fontSize: "0.7rem" }}
      >
        {index + 1}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
            className="absolute left-4 top-0 z-[9999] w-60 rounded-xl bg-card border border-border shadow-2xl p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm leading-snug flex-1" style={{ color: "var(--foreground)" }}>
                {annotation.text}
              </p>
              <button
                onClick={onRemove}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors mt-0.5"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="text-muted-foreground mt-1.5" style={{ fontSize: "0.7rem" }}>
              #{index + 1} · {new Date(annotation.createdAt).toLocaleTimeString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CommentInputProps {
  x: number;
  y: number;
  onSave: (text: string) => void;
  onCancel: () => void;
}

function CommentInput({ x, y, onSave, onCancel }: CommentInputProps) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => { if (text.trim()) onSave(text.trim()); };

  // Keep dialog within viewport horizontally
  const leftPct = Math.min(Math.max(x, 5), 65);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.18 }}
      onClick={e => e.stopPropagation()}
      className="absolute z-[9999] w-72 rounded-2xl bg-card border border-border shadow-2xl p-4"
      style={{ left: `${leftPct}%`, top: y + 12 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <PenLine className="size-4 text-primary" />
        <span className="font-medium text-sm">Add a note</span>
      </div>
      <textarea
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Describe what you'd like changed…"
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        rows={3}
      />
      <div className="flex items-center justify-end gap-2 mt-3">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="px-3 py-1.5 rounded-lg text-sm bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Pin note
        </button>
      </div>
    </motion.div>
  );
}

export function AnnotationTool() {
  const { annotations, add, remove, clear } = useAnnotations();
  const [active, setActive] = useState(false);
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pageHeight, setPageHeight] = useState(3000);

  useEffect(() => {
    const update = () => setPageHeight(document.body.scrollHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (pending) return; // already placing one
    const scrollY = window.scrollY;
    const xPct = (e.clientX / window.innerWidth) * 100;
    const yAbs = e.clientY + scrollY;
    setPending({ x: xPct, y: yAbs });
  }, [pending]);

  const handleSave = (text: string) => {
    if (!pending) return;
    add({ id: crypto.randomUUID(), x: pending.x, y: pending.y, text, createdAt: Date.now() });
    setPending(null);
  };

  const copyAll = () => {
    const lines = annotations.map((a, i) =>
      `[Note #${i + 1}] (position ~${Math.round(a.x)}% from left, ${Math.round(a.y)}px from top)\n${a.text}`
    ).join("\n\n");
    const full = `=== Larder Feedback Notes ===\n\n${lines}\n\n=== End of notes ===`;
    const el = document.createElement("textarea");
    el.value = full;
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close annotation mode on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setPending(null); if (active) setActive(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active]);

  return (
    <>
      {/* Invisible click-capture overlay when active */}
      {active && (
        <div
          className="fixed inset-0 z-[9990]"
          style={{ cursor: "crosshair" }}
          onClick={handleOverlayClick}
        />
      )}

      {/* Rendered pins (above overlay so they're clickable) */}
      <div className="pointer-events-none fixed inset-0 z-[9997]" style={{ pointerEvents: "none" }}>
        <div className="relative w-full" style={{ height: pageHeight }}>
          {annotations.map((a, i) => (
            <div key={a.id} style={{ pointerEvents: "auto" }}>
              <Pin annotation={a} index={i} onRemove={() => remove(a.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* Pending comment input */}
      <AnimatePresence>
        {pending && (
          <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: "none" }}>
            <div style={{ pointerEvents: "auto", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
              <CommentInput
                x={pending.x}
                y={pending.y - window.scrollY}
                onSave={handleSave}
                onCancel={() => setPending(null)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating controls */}
      <div className="fixed bottom-6 left-6 z-[9996] flex flex-col items-start gap-2">

        {/* Notes panel */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-80 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-sm">Your notes ({annotations.length})</span>
                <div className="flex items-center gap-2">
                  {annotations.length > 0 && (
                    <>
                      <button
                        onClick={copyAll}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                        {copied ? "Copied!" : "Copy for Claude"}
                      </button>
                      <button onClick={clear} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="size-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {annotations.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No notes yet. Click <strong>Annotate</strong> then click anywhere on the page.
                  </div>
                ) : (
                  annotations.map((a, i) => (
                    <div key={a.id} className="flex items-start gap-3 px-4 py-3 border-b border-border/60 last:border-0">
                      <span className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5 font-semibold" style={{ fontSize: "0.65rem" }}>
                        {i + 1}
                      </span>
                      <p className="text-sm flex-1 leading-snug">{a.text}</p>
                      <button onClick={() => remove(a.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              {annotations.length > 0 && (
                <div className="px-4 py-3 bg-muted/50 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Click <strong>"Copy for Claude"</strong> then paste into the chat — I'll work through each note.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle row */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => { setActive(a => !a); if (!active) setPanelOpen(false); }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg transition-colors ${
              active
                ? "bg-primary text-primary-foreground ring-4 ring-primary/30"
                : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
          >
            <MessageSquarePlus className="size-4" />
            {active ? "Click anywhere…" : "Annotate"}
          </motion.button>

          {annotations.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setPanelOpen(o => !o)}
              className="flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-2.5 text-sm font-medium shadow-lg hover:bg-muted transition-colors"
            >
              <span className="size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center" style={{ fontSize: "0.6rem" }}>
                {annotations.length}
              </span>
              Notes
              <ChevronRight className={`size-3.5 transition-transform ${panelOpen ? "rotate-90" : ""}`} />
            </motion.button>
          )}
        </div>
      </div>
    </>
  );
}
