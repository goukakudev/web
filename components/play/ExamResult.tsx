"use client";

export interface ExamResultProps {
  correct: number;
  total: number;
  elapsedSeconds: number;
  onRetry: () => void;
  variant?: "default" | "denki";
}

export function ExamResult({
  correct,
  total,
  elapsedSeconds,
  onRetry,
  variant = "default",
}: ExamResultProps) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  const containerCls =
    variant === "denki"
      ? "bg-[#fffdf6] rounded-lg p-6 border-2 border-[#191815] text-center shadow-[5px_5px_0_#191815]"
      : "bg-goukaku-surface rounded-[22px] p-6 border border-goukaku-divider text-center"
  const labelCls =
    variant === "denki"
      ? "text-[12px] tracking-[1.5px] font-black text-[#007c83] uppercase"
      : "text-[12px] tracking-[1.5px] font-extrabold text-goukaku-ink/55 uppercase"
  const metaCls =
    variant === "denki"
      ? "mt-1 text-[13px] text-[#6c6252]"
      : "mt-1 text-[13px] text-goukaku-ink/60"
  const buttonCls =
    variant === "denki"
      ? "mt-5 inline-flex items-center gap-2 rounded-lg border-2 border-[#191815] bg-[#ffe25a] px-5 py-2.5 text-[13px] font-black text-[#191815] shadow-[3px_3px_0_#191815]"
      : "mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-goukaku-ink-fixed text-goukaku-lime rounded-full font-extrabold text-[13px]"

  return (
    <div className={containerCls}>
      <div className={labelCls}>
        Result
      </div>
      <div className="mt-2 text-[40px] font-black tabular-nums">
        {pct}
        <span className="text-[20px] font-extrabold ml-0.5">%</span>
      </div>
      <div className={metaCls}>
        {correct} / {total} 問正解 · {m}:{s.toString().padStart(2, "0")}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={buttonCls}
      >
        もう一度
      </button>
    </div>
  );
}
