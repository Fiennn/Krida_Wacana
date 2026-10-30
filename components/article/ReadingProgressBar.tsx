"use client";

import { useEffect, useState } from "react";

/**
 * Batang indikator progres membaca artikel (fixed di bagian paling atas layar).
 */
export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const pct = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
      setProgress(pct);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-slate-200/20 backdrop-blur-sm"
    >
      <div
        className="h-full bg-gradient-to-r from-amber-400 via-amber-brand to-amber-300 transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(251,191,36,0.8)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
