import type { Metadata } from "next";
import Link from "next/link";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

const CONTACT_EMAIL = "contact@goukaku.dev";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "合格.dev へのお問い合わせはこちらから。メールまたはフォーム経由でご連絡いただけます。",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <MobileFrame>
      <Breadcrumbs items={[
        { name: "合格.dev", href: "/" },
        { name: "お問い合わせ", href: "/contact" },
      ]} />
      <h1 className="text-[24px] font-extrabold mb-4">お問い合わせ</h1>

      <section className="mb-6 text-[13px] leading-[1.8] text-goukaku-ink/85">
        <p>
          誤植のご指摘、解説の改善案、ご要望、その他なんでもお気軽にお寄せください。
        </p>
      </section>

      <section className="mb-8 text-[13px] leading-[1.8]">
        <h2 className="text-[16px] font-extrabold mb-2">メール</h2>
        <p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
              "お問い合わせ - 合格.dev",
            )}`}
            className="underline font-extrabold"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-[12px] text-goukaku-ink/60 mt-1">
          通常 1〜3 営業日以内に返信を心がけていますが、確約はできません。
        </p>
      </section>

      <section className="mb-8 text-[13px] leading-[1.8]">
        <h2 className="text-[16px] font-extrabold mb-3">フォーム</h2>
        <ContactForm />
      </section>

      <section className="text-[12px] text-goukaku-ink/60">
        個人情報の取扱については{" "}
        <Link href="/privacy" className="underline">
          プライバシーポリシー
        </Link>{" "}
        をご覧ください。
      </section>
    </MobileFrame>
  );
}
