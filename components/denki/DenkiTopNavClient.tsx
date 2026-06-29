"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/denki", label: "トップ" },
  { href: "/denki/guide", label: "ガイド" },
  { href: "/denki/faq", label: "FAQ" },
  { href: "/denki/bookmarks", label: "ブックマーク" },
  { href: "/denki/history", label: "履歴" },
]

const navItemClass =
  "inline-flex min-h-10 items-center rounded-lg border px-3 py-2 text-[12px] font-extrabold transition"

const linkClass =
  "border-[#191815]/20 bg-white hover:border-[#191815] hover:bg-[#fff8cf]"

const currentClass =
  "cursor-default border-[#191815] bg-[#ffe25a] text-[#191815] shadow-[2px_2px_0_#191815]"

export function DenkiTopNavClient() {
  const pathname = usePathname() ?? "/denki"

  return (
    <nav aria-label="第二種電気工事士メニュー" className="flex flex-wrap gap-2">
      {navItems.map((item) => {
        const isCurrent = pathname === item.href

        if (isCurrent) {
          return (
            <span
              key={item.href}
              aria-current="page"
              className={`${navItemClass} ${currentClass}`}
            >
              {item.label}
            </span>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${navItemClass} ${linkClass}`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
