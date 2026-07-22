"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Mic,
  MicOff,
  X,
} from "lucide-react";
import type { Step } from "@/types";
import { useVoiceNav } from "@/hooks/useVoiceNav";

interface CookingModeProps {
  steps: Step[];
  recipeTitle: string;
  onClose: () => void;
}

export default function CookingMode({
  steps,
  recipeTitle,
  onClose,
}: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const speak = useCallback(
    (text: string) => {
      if (!isTtsEnabled || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    },
    [isTtsEnabled]
  );

  const goNext = useCallback(() => {
    if (!isLastStep) setCurrentStep((s) => s + 1);
  }, [isLastStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const repeatStep = useCallback(() => {
    if (step) speak(step.text);
  }, [step, speak]);

  const { isListening } = useVoiceNav({
    onNext: goNext,
    onPrevious: goPrev,
    onRepeat: repeatStep,
    enabled: isVoiceInputEnabled,
  });

  useEffect(() => {
    if (step?.timer_seconds) {
      setTimer(step.timer_seconds);
      setTimerRunning(false);
    } else {
      setTimer(null);
      setTimerRunning(false);
    }
  }, [currentStep, step]);

  useEffect(() => {
    if (!timerRunning || timer === null || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t !== null && t <= 1) {
          setTimerRunning(false);
          speak("Timer done!");
          return 0;
        }
        return t !== null ? t - 1 : null;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timer, speak]);

  useEffect(() => {
    if ("wakeLock" in navigator) {
      navigator.wakeLock
        .request("screen")
        .then((sentinel) => {
          wakeLockRef.current = sentinel;
        })
        .catch(() => {});
    }
    return () => {
      wakeLockRef.current?.release();
    };
  }, []);

  useEffect(() => {
    if (step) speak(`Step ${currentStep + 1}: ${step.text}`);
  }, [currentStep, step, speak]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[var(--bg-base)] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2
              className="text-sm font-semibold text-[var(--fg-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {recipeTitle}
            </h2>
            <p className="text-xs text-[var(--fg-muted)]">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            className="p-2 rounded-lg text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
            aria-label={isTtsEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
          >
            {isTtsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsVoiceInputEnabled(!isVoiceInputEnabled)}
            className={`p-2 rounded-lg hover:bg-[var(--bg-surface)] cursor-pointer ${
              isVoiceInputEnabled ? "text-[var(--state-success)]" : "text-[var(--fg-secondary)]"
            }`}
            aria-label={isVoiceInputEnabled ? "Disable voice input" : "Enable voice input"}
          >
            {isVoiceInputEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Voice input indicator */}
      {isVoiceInputEnabled && (
        <div className="flex items-center justify-center gap-2 py-1.5 bg-[var(--state-success)]/10 text-[var(--state-success)] text-xs">
          <Mic className="w-3 h-3" />
          {isListening ? "Listening... say 'next step', 'previous step', or 'repeat'" : "Voice input enabled"}
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1 bg-[var(--bg-surface)]">
        <motion.div
          className="h-full bg-[var(--accent-primary)]"
          initial={false}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-2xl w-full text-center"
          >
            <span className="text-[var(--text-display)] font-bold text-[var(--accent-primary)]/20" style={{ fontFamily: "var(--font-display)" }}>
              {currentStep + 1}
            </span>
            <p
              className="text-[var(--text-h2)] text-[var(--fg-primary)] leading-relaxed mt-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {step.text}
            </p>

            {step.media_url && (
              <div className="mt-8 rounded-xl overflow-hidden">
                <img src={step.media_url} alt={`Step ${currentStep + 1}`} className="w-full max-h-64 object-cover" />
              </div>
            )}

            {timer !== null && (
              <div className="mt-8 inline-flex flex-col items-center gap-3 p-6 bg-[var(--bg-surface)] rounded-xl">
                <span
                  className="text-4xl font-bold text-[var(--accent-primary)] tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatTime(timer)}
                </span>
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="p-3 rounded-full bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors cursor-pointer"
                >
                  {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-subtle)] safe-area-bottom">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[var(--bg-surface)] text-[var(--fg-primary)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2 h-2 rounded-full transition-all duration-[var(--duration-fast)] cursor-pointer
                ${i === currentStep ? "bg-[var(--accent-primary)] w-6" : "bg-[var(--border-default)]"}`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {isLastStep ? (
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[var(--accent-primary)] text-white cursor-pointer"
          >
            Done
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[var(--bg-surface)] text-[var(--fg-primary)] cursor-pointer"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
