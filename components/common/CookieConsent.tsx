"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "goukaku.cookieConsent.v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
      } catch {
        // ignore localStorage errors (SSR / privacy modes)
      }
    });
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie 利用について"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 pointer-events-none"
    >
      <div className="mx-auto max-w-[640px] rounded-2xl border border-goukaku-ink/15 bg-goukaku-surface shadow-lg pointer-events-auto p-4">
        <p className="text-[12px] leading-[1.6] text-goukaku-ink/85">
          当サイトは、学習履歴の保存のため localStorage を利用します。トラッキング目的の Cookie は使用しません。詳しくは{" "}
          <Link href="/privacy" className="underline">
            プライバシーポリシー
          </Link>{" "}
          および{" "}
          <Link href="/terms" className="underline">
            利用規約
          </Link>{" "}
          をご確認ください。
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <Link
            href="/privacy"
            className="text-[12px] px-3 py-1.5 rounded-full border border-goukaku-ink/20"
          >
            詳細
          </Link>
          <button
            onClick={accept}
            className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-goukaku-ink text-goukaku-surface"
          >
            同意する
          </button>
        </div>
      </div>
    </div>
  );
}
