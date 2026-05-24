import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const footerLinkClass =
  "inline-flex min-h-8 items-center rounded-full border border-goukaku-divider px-3 py-1.5 text-goukaku-ink/60 transition hover:bg-goukaku-surface hover:text-goukaku-ink/80";

export function SiteFooter() {
  return (
    <footer className="mt-10 mb-6 text-center text-[11px] text-goukaku-ink/55">
      <div className="flex justify-center mb-4">
        <ThemeToggle />
      </div>
      <nav className="mb-3 flex flex-wrap justify-center gap-2">
        <Link href="/about" className={footerLinkClass}>
          About
        </Link>
        <Link href="/privacy" className={footerLinkClass}>
          プライバシーポリシー
        </Link>
        <Link href="/terms" className={footerLinkClass}>
          利用規約
        </Link>
        <Link href="/support" className={footerLinkClass}>
          サポート
        </Link>
        <Link href="/contact" className={footerLinkClass}>
          お問い合わせ
        </Link>
      </nav>
      <p>© 合格.dev</p>
    </footer>
  );
}
