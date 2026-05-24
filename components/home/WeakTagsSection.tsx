"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getDeviceId } from "@/lib/local-store"
import { fetchWeakTags, type WeakTag } from "@/lib/client-api"
import { tagToSlug } from "@/lib/tag-url"

export function WeakTagsSection({
  subject = "fe",
}: {
  subject?: "fe" | "ip"
}) {
  const [tags, setTags] = useState<WeakTag[] | null>(null)

  useEffect(() => {
    const deviceId = getDeviceId()
    if (!deviceId) {
      setTags([])
      return
    }
    fetchWeakTags(deviceId, 10).then(setTags)
  }, [])

  if (tags === null || tags.length === 0) return null

  const tagBase = subject === "ip" ? "/ip/tag" : "/fe/tag"

  return (
    <div className="mt-7">
      <div
        className="text-[22px] text-goukaku-pink-script"
        style={{ fontFamily: "var(--font-script)" }}
      >
        Weak tags
      </div>
      <div className="text-[18px] font-extrabold mb-3.5">苦手タグ</div>
      <div className="flex flex-col gap-2">
        {tags.map((t) => {
          const display = t.tag.replace(/^#/, "")
          return (
            <Link
              key={t.tag}
              href={`${tagBase}/${tagToSlug(t.tag)}`}
              className="flex items-center gap-3 rounded-[14px] bg-goukaku-surface px-3.5 py-2.5"
            >
              <span className="text-[13px] font-bold text-goukaku-ink">
                #{display}
              </span>
              <span className="flex-1 h-1 rounded-full bg-goukaku-ink/10 overflow-hidden">
                <span
                  className="block h-full rounded-full bg-goukaku-pink"
                  style={{ width: `${t.accuracy_percent}%` }}
                />
              </span>
              <span className="text-[11px] font-bold text-goukaku-ink/60 tabular-nums w-12 text-right">
                {t.accuracy_percent}%
              </span>
              <span className="text-[10px] text-goukaku-ink/45 tabular-nums w-8 text-right">
                {t.correct}/{t.answered}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
