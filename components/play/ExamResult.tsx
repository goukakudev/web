"use client";

export interface ExamResultProps {
  correct: number;
  total: number;
  elapsedSeconds: number;
  onRetry: () => void;
}

export function ExamResult({
  correct,
  total,
  elapsedSeconds,
  onRetry,
}: ExamResultProps) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  return (
    <div className="bg-goukaku-surface rounded-[22px] p-6 border border-goukaku-divider text-center">
      <div className="text-[12px] tracking-[1.5px] font-extrabold text-goukaku-ink/55 uppercase">
        Result
      </div>
      <div className="mt-2 text-[40px] font-black tabular-nums">
        {pct}
        <span className="text-[20px] font-extrabold ml-0.5">%</span>
      </div>
      <div className="mt-1 text-[13px] text-goukaku-ink/60">
        {correct} / {total} 問正解 · {m}:{s.toString().padStart(2, "0")}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-goukaku-ink-fixed text-goukaku-lime rounded-full font-extrabold text-[13px]"
      >
        もう一度
      </button>
    </div>
  );
}
