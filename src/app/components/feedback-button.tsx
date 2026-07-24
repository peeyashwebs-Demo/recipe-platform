import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircleHeart, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Stars } from "./primitives";
import { toast } from "sonner";
import { api } from "../lib/api";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const send = async () => {
    try {
      await api("/feedback", { method: "POST", body: { rating, message: text }, auth: true });
    } catch (e) {
      console.error("Feedback submit failed:", (e as Error).message);
    }
    toast.success("Thank you for the feedback!", {
      description: "The Larder team reads every note.",
    });
    setText("");
    setRating(0);
    setOpen(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 grid place-items-center size-14 rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_-8px_rgba(181,69,43,0.7)]"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Give feedback"
      >
        <motion.span
          className="absolute inset-0 rounded-full bg-primary"
          animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircleHeart className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
            className="fixed bottom-24 right-5 z-40 w-[min(92vw,360px)] rounded-2xl bg-card border border-border shadow-[0_24px_60px_-20px_rgba(74,60,48,0.5)] p-5"
          >
            <h3 className="font-display" style={{ fontSize: "1.25rem" }}>Enjoying Larder?</h3>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "0.85rem" }}>
              Tell us what's working — and what isn't.
            </p>
            <div className="mt-4">
              <Stars value={rating} size={26} onChange={setRating} />
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Your thoughts, ideas, or bugs you spotted…"
              className="mt-3 min-h-[96px] resize-none bg-input-background"
            />
            <Button className="w-full mt-3 rounded-full" onClick={send} disabled={!rating && !text.trim()}>
              <Send className="size-4" /> Send feedback
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
