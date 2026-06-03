"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const footerLinkClass =
  "inline-flex min-h-8 items-center rounded-full border border-goukaku-divider px-3 py-1.5 text-goukaku-ink/60 transition hover:bg-goukaku-surface hover:text-goukaku-ink/80";

const currentFooterLinkClass =
  "border-goukaku-lime/70 bg-goukaku-lime/35 text-goukaku-ink";

const sectionLinkClass =
  "inline-flex min-h-9 items-center rounded-full border border-goukaku-divider bg-goukaku-surface px-3.5 py-1.5 text-[12px] font-extrabold text-goukaku-ink/70 transition hover:text-goukaku-ink";

const currentSectionLinkClass =
  "border-goukaku-pink-script/70 bg-goukaku-pink-script/20 text-goukaku-ink";

const sectionLinks = [
  { href: "/", label: "TOP", match: (p: string) => p === "/" },
  { href: "/fe", label: "基本情報", match: (p: string) => p === "/fe" || p.startsWith("/fe/") },
  { href: "/ip", label: "ITパスポート", match: (p: string) => p === "/ip" || p.startsWith("/ip/") },
  { href: "/ap", label: "応用情報", match: (p: string) => p === "/ap" || p.startsWith("/ap/") },
  { href: "/sg", label: "情報セキュリティ", match: (p: string) => p === "/sg" || p.startsWith("/sg/") },
  { href: "/takken", label: "宅建", match: (p: string) => p === "/takken" || p.startsWith("/takken/") },
  { href: "/kango", label: "看護師", match: (p: string) => p === "/kango" || p.startsWith("/kango/") },
];

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" },
  { href: "/support", label: "サポート" },
  { href: "/contact", label: "お問い合わせ" },
];

export function SiteFooter() {
  const pathname = usePathname() ?? "/";

  return (
    <footer className="mt-10 mb-6 text-center text-[11px] text-goukaku-ink/55">
      <nav
        aria-label="セクション"
        className="mb-4 flex flex-wrap justify-center gap-2"
      >
        {sectionLinks.map((link) => {
          const isCurrent = link.match(pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent ? "page" : undefined}
              className={`${sectionLinkClass} ${isCurrent ? currentSectionLinkClass : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex justify-center mb-4">
        <ThemeToggle />
      </div>
      <nav className="mb-3 flex flex-wrap justify-center gap-2">
        {footerLinks.map((link) => {
          const isCurrent = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent ? "page" : undefined}
              className={`${footerLinkClass} ${isCurrent ? currentFooterLinkClass : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <p>© 合格.dev</p>
    </footer>
  );
}
