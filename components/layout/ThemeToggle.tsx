"use client";

import { useEffect, useState } from "react";

type Pref = "auto" | "light" | "dark";

const STORAGE_KEY = "goukaku.theme";

function resolveDark(pref: Pref): boolean {
  if (pref === "dark") return true;
  if (pref === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle() {
  const [pref, setPref] = useState<Pref>("auto");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Pref | null) ?? "auto";
    setPref(stored);
    setMounted(true);
  }, []);

  function apply(next: Pref) {
    setPref(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute(
      "data-theme",
      resolveDark(next) ? "dark" : "light",
    );
  }

  // SSR/hydration 中は inert に (data-theme は inline script が既に設定済み)
  const active = mounted ? pref : "auto";

  const options: { value: Pref; label: string }[] = [
    { value: "auto", label: "自動" },
    { value: "light", label: "ライト" },
    { value: "dark", label: "ダーク" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="テーマ"
      className="inline-flex p-1 rounded-full border border-goukaku-divider bg-goukaku-surface"
    >
      {options.map((opt) => {
        const isActive = opt.value === active;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => apply(opt.value)}
            className={
              isActive
                ? "px-3.5 py-1.5 rounded-full text-[12px] font-extrabold bg-goukaku-ink-fixed text-goukaku-lime"
                : "px-3.5 py-1.5 rounded-full text-[12px] font-extrabold text-goukaku-ink/60"
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
