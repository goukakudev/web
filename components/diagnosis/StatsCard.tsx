export interface StatsCardProps {
  title: string;
  answered: number;
  correct: number;
  total: number;
}

export function StatsCard({ title, answered, correct, total }: StatsCardProps) {
  const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="bg-goukaku-surface rounded-[20px] p-4 border border-goukaku-divider">
      <div className="text-[12px] font-extrabold text-goukaku-ink line-clamp-1">
        {title}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[24px] font-black tabular-nums">{pct}</span>
        <span className="text-[11px] text-goukaku-ink/55 font-extrabold">
          % 正答率
        </span>
      </div>
      <div className="mt-1 text-[11px] text-goukaku-ink/60">
        {answered} / {total} 問 解答済み ({progress}%)
      </div>
    </div>
  );
}
