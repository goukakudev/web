"use client";

import { useEffect, useState } from "react";

const DEFAULT_DURATION_SECONDS = 90 * 60;

function format(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function ExamTimer({
  startedAt,
  onTimeout,
  durationSeconds = DEFAULT_DURATION_SECONDS,
  variant = "default",
}: {
  startedAt: number;
  onTimeout: () => void;
  durationSeconds?: number;
  variant?: "default" | "denki";
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = Math.floor((now - startedAt) / 1000);
  const remaining = Math.max(0, durationSeconds - elapsed);

  useEffect(() => {
    if (remaining === 0) onTimeout();
  }, [remaining, onTimeout]);

  const warn = remaining <= 300;
  const cls =
    variant === "denki"
      ? `inline-flex min-h-9 items-center rounded-lg border border-[#191815]/20 bg-[#fffdf6] px-3 text-[13px] tabular-nums font-black ${warn ? "text-[#c7372f]" : "text-[#191815]"}`
      : `tabular-nums font-extrabold ${warn ? "text-red-600" : "text-goukaku-ink"}`
  return (
    <span className={cls}>
      {format(remaining)}
    </span>
  );
}
