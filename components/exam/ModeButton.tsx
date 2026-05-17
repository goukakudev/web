import Link from "next/link"

export interface ModeButtonProps {
  href: string
  icon: string
  label: string
  subtitle?: string
  emphasized?: boolean
}

export function ModeButton({ href, icon, label, subtitle, emphasized }: ModeButtonProps) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3.5 p-4 rounded-[18px] bg-goukaku-surface border",
        emphasized ? "border-goukaku-lime border-[1.5px]" : "border-goukaku-divider",
      ].join(" ")}
    >
      <div
        className={[
          "w-10 h-10 rounded-full flex items-center justify-center text-[16px]",
          emphasized ? "bg-goukaku-lime" : "bg-goukaku-divider",
        ].join(" ")}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[14px] font-bold">{label}</div>
        {subtitle && <div className="text-[11px] text-goukaku-ink/55 mt-0.5">{subtitle}</div>}
      </div>
      <span className="text-[13px] font-bold">→</span>
    </Link>
  )
}
