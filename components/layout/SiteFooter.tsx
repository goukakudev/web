import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteFooter() {
  return (
    <footer className="mt-10 mb-6 text-center text-[11px] text-goukaku-ink/55">
      <div className="flex justify-center mb-4">
        <ThemeToggle />
      </div>
      <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-2">
        <Link href="/about" className="underline">
          About
        </Link>
        <span>·</span>
        <Link href="/privacy" className="underline">
          プライバシーポリシー
        </Link>
        <span>·</span>
        <Link href="/terms" className="underline">
          利用規約
        </Link>
        <span>·</span>
        <Link href="/support" className="underline">
          サポート
        </Link>
        <span>·</span>
        <Link href="/contact" className="underline">
          お問い合わせ
        </Link>
      </nav>
      <p>© goukaku.dev</p>
    </footer>
  );
}
