import Image from "next/image"
import Link from "next/link"

export function HeroQuestCard({ subject = "fe" }: { subject?: "fe" | "ip" } = {}) {
  const href = subject === "ip" ? "/ip/play/random?count=20" : "/fe/play/random?count=20"
  return (
    <Link
      href={href}
      className="block bg-goukaku-lime rounded-[28px] p-5 relative mb-6 overflow-hidden"
    >
      <Image
        src="/goukaku-icon.png"
        alt=""
        width={249}
        height={249}
        aria-hidden
        sizes="180px"
        className="pointer-events-none absolute -right-6 top-1/2 size-44 -translate-y-1/2 opacity-25 z-0"
      />
      <div className="relative z-10">
        <div
          className="text-[22px] text-goukaku-ink-fixed"
          style={{ fontFamily: "var(--font-script)" }}
        >
          Today&apos;s quest
        </div>
        <div className="mt-1 text-[24px] font-black leading-tight text-goukaku-ink-fixed">
          全試験からランダム 20 問
        </div>
        <div className="h-[6px] bg-black/20 rounded-full my-3.5">
          <div className="h-full w-[38%] bg-goukaku-ink-fixed rounded-full" />
        </div>
        <div className="inline-flex gap-2 items-center px-4 py-2.5 bg-goukaku-ink-fixed text-goukaku-lime rounded-full font-extrabold text-[14px]">
          挑戦する →
        </div>
      </div>
      <span className="absolute top-3.5 right-4 text-goukaku-pink-script text-[20px] z-10">✦</span>
    </Link>
  )
}
