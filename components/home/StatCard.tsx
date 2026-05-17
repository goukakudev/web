export interface StatCardProps {
  label: string
  value: number | string
  unit?: string
  icon: string
}

export function StatCard({ label, value, unit, icon }: StatCardProps) {
  return (
    <div className="bg-goukaku-surface rounded-[20px] p-4">
      <div className="text-[18px]">{icon}</div>
      <div className="mt-2 text-[11px] text-goukaku-ink/55">{label}</div>
      <div className="mt-1">
        <span className="text-[24px] font-extrabold tabular-nums">{value}</span>
        {unit && <span className="ml-0.5 text-[11px] text-goukaku-ink/55">{unit}</span>}
      </div>
    </div>
  )
}
