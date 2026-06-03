"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseClass =
  "inline-flex min-h-9 items-center rounded-full border border-line px-3.5 py-1.5 text-[12px] font-medium tracking-wide text-ink-3 transition hover:text-ink";

const currentClass =
  "border-charcoal/70 bg-charcoal text-white";

const links = [
  { href: "/", label: "TOP", match: (p: string) => p === "/" },
  { href: "/fe", label: "基本情報", match: (p: string) => p === "/fe" || p.startsWith("/fe/") },
  { href: "/ip", label: "ITパスポート", match: (p: string) => p === "/ip" || p.startsWith("/ip/") },
  { href: "/ap", label: "応用情報", match: (p: string) => p === "/ap" || p.startsWith("/ap/") },
  { href: "/sg", label: "情報セキュリティ", match: (p: string) => p === "/sg" || p.startsWith("/sg/") },
  { href: "/takken", label: "宅建", match: (p: string) => p === "/takken" || p.startsWith("/takken/") },
];

export function TakkenSectionNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav
      aria-label="セクション"
      className="flex flex-wrap justify-center gap-2"
    >
      {links.map((link) => {
        const isCurrent = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isCurrent ? "page" : undefined}
            className={`${baseClass} ${isCurrent ? currentClass : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
