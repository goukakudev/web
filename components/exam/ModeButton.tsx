import Link from "next/link"

export interface ModeButtonProps {
  href: string
  icon: string
  label: string
  subtitle?: string
  emphasized?: boolean
  variant?: "default" | "denki"
}

export function ModeButton({
  href,
  icon,
  label,
  subtitle,
  emphasized,
  variant = "default",
}: ModeButtonProps) {
  if (variant === "denki") {
    return (
      <Link
        href={href}
        className={[
          "flex min-h-[76px] items-center gap-3.5 rounded-lg border-2 p-4 transition hover:-translate-y-0.5",
          emphasized
            ? "border-[#191815] bg-[#ffe25a] shadow-[4px_4px_0_#191815]"
            : "border-[#d8d1bc] bg-[#fffdf6] hover:border-[#191815] hover:shadow-[4px_4px_0_#191815]",
        ].join(" ")}
      >
        <div
          className={[
            "grid size-11 shrink-0 place-items-center rounded-lg border border-[#191815]/20 text-[17px]",
            emphasized ? "bg-[#191815] text-[#ffe25a]" : "bg-[#b8f3f2]",
          ].join(" ")}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-black">{label}</div>
          {subtitle && <div className="mt-0.5 text-[11px] font-bold text-[#6c6252]">{subtitle}</div>}
        </div>
        <span className="text-[13px] font-black">→</span>
      </Link>
    )
  }

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
