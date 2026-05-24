"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const footerLinkClass =
  "inline-flex min-h-8 items-center rounded-full border border-goukaku-divider px-3 py-1.5 text-goukaku-ink/60 transition hover:bg-goukaku-surface hover:text-goukaku-ink/80";

const currentFooterLinkClass =
  "border-goukaku-lime/70 bg-goukaku-lime/35 text-goukaku-ink";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" },
  { href: "/support", label: "サポート" },
  { href: "/contact", label: "お問い合わせ" },
];

export function SiteFooter() {
  const pathname = usePathname();

  return (
    <footer className="mt-10 mb-6 text-center text-[11px] text-goukaku-ink/55">
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
