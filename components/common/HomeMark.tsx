import Image from "next/image"

export function HomeMark() {
  return (
    <div className="flex justify-center pt-6 pb-4">
      <Image
        src="/goukaku-icon.png"
        alt=""
        width={249}
        height={249}
        aria-hidden
        sizes="112px"
        priority
        className="h-28 w-28"
      />
    </div>
  )
}
