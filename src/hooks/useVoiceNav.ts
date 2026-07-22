"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Minimal ambient types for the Web Speech API — not included in
// TypeScript's default DOM lib, and only partially supported across browsers.
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface UseVoiceNavOptions {
  onNext: () => void;
  onPrevious: () => void;
  onRepeat?: () => void;
  enabled?: boolean;
}

export function useVoiceNav({
  onNext,
  onPrevious,
  onRepeat,
  enabled = false,
}: UseVoiceNavOptions) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      return;
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (!lastResult.isFinal) return;

      const transcript = lastResult[0].transcript.toLowerCase().trim();

      if (transcript.includes("next step") || transcript.includes("next")) {
        onNext();
      } else if (
        transcript.includes("previous step") ||
        transcript.includes("previous") ||
        transcript.includes("go back")
      ) {
        onPrevious();
      } else if (
        transcript.includes("repeat") &&
        onRepeat
      ) {
        onRepeat();
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [onNext, onPrevious, onRepeat]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [enabled, startListening, stopListening]);

  return { isListening, startListening, stopListening };
}
