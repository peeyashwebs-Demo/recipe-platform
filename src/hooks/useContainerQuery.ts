"use client";

import { useEffect, useRef, useState } from "react";

export function useContainerQuery(threshold = 640) {
  const ref = useRef<HTMLDivElement>(null);
  const [isWide, setIsWide] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsWide(entry.contentRect.width > threshold);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isWide };
}
