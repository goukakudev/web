import Link from "next/link"

export function HeroQuestCard({ subject = "fe" }: { subject?: "fe" | "ip" | "ap" | "sg" | "sc" } = {}) {
  const href = `/${subject}/play/random?count=20`
  return (
    <Link
      href={href}
      className="block bg-goukaku-lime rounded-[28px] p-5 relative mb-6"
    >
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
      <span className="absolute top-3.5 right-4 text-goukaku-pink-script text-[20px]">✦</span>
    </Link>
  )
}
