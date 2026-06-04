const APP_STORE_BADGE_SRC = "/app-store-badge-ja.svg"

export type QuizExamKey = "fe" | "ip" | "ap" | "sg" | "tk"

const IOS_APP_URLS: Record<QuizExamKey, string | null> = {
  fe: "https://apps.apple.com/jp/app/基本情報技術者-過去問/id6770801070",
  ip: "https://apps.apple.com/jp/app/goukaku-itパスポート-過去問/id6774202965",
  tk: "https://apps.apple.com/jp/app/宅建過去問/id6772390931",
  ap: null,
  sg: "https://apps.apple.com/app/goukaku-情報セキュリティマネジメント-過去問/id6776073219",
}

const EXAM_LABELS: Record<QuizExamKey, string> = {
  fe: "基本情報技術者試験",
  ip: "ITパスポート試験",
  tk: "宅建 (宅地建物取引士試験)",
  ap: "応用情報技術者試験",
  sg: "情報セキュリティマネジメント試験",
}

interface Props {
  examKey: QuizExamKey
  variant?: "default" | "takken"
}

export function QuizBottomActions({ examKey, variant = "default" }: Props) {
  const iosUrl = IOS_APP_URLS[examKey]
  if (!iosUrl) return null

  const examLabel = EXAM_LABELS[examKey]
  const isTakken = variant === "takken"

  const containerCls = isTakken
    ? "mx-auto mt-8 max-w-3xl rounded-xl border border-tk-line bg-tk-card/40 px-4 py-5"
    : "mt-8 rounded-xl border border-goukaku-divider bg-goukaku-surface px-4 py-5"

  const titleCls = isTakken
    ? "text-[12px] font-bold text-tk-ink-2"
    : "text-[12px] font-bold text-goukaku-ink/80"

  const subCls = isTakken
    ? "text-[11px] leading-relaxed text-tk-ink-3"
    : "text-[11px] leading-relaxed text-goukaku-ink/60"

  return (
    <section
      aria-label={`${examLabel} の iOS アプリ版`}
      className={containerCls}
      data-testid={`quiz-bottom-actions-${examKey}`}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <p className={titleCls}>{examLabel} の iOS アプリ版</p>
        <p className={subCls}>
          アプリ版なら、よりスムーズに動作し、
          <br />
          スワイプで問題遷移ができます。
        </p>
        <a
          href={iosUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block"
          aria-label={`${examLabel} の iOS アプリを App Store で開く`}
          data-testid={`quiz-bottom-actions-${examKey}-ios`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={APP_STORE_BADGE_SRC}
            alt={`${examLabel} 合格.dev を App Store でダウンロード`}
            width={109}
            height={40}
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
    </section>
  )
}
