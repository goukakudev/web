"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/client-events"

export function AnalyticsEvents() {
  useEffect(() => {
    function sendEvent(
      name: string,
      props?: Record<string, string | number | boolean>,
    ) {
      trackEvent(name, props)
    }

    function onClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      const el = target.closest<HTMLElement>("[data-analytics-event]")
      if (!el) return
      const name = el.dataset.analyticsEvent
      if (!name) return
      let props: Record<string, string | number | boolean> | undefined
      const raw = el.dataset.analyticsProps
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Record<string, string | number | boolean>
          props = parsed
        } catch {
          props = { parse_error: true }
        }
      }
      sendEvent(name, props)
    }

    document.addEventListener("click", onClick)

    const seenAdSlots = new WeakSet<Element>()
    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting || seenAdSlots.has(entry.target)) continue
              seenAdSlots.add(entry.target)
              const el = entry.target as HTMLElement
              sendEvent("ad_slot_view", {
                slot: el.dataset.adSlot ?? "unknown",
                source: el.dataset.adSource ?? "page",
              })
            }
          }, { threshold: 0.5 })
        : null

    if (observer) {
      document.querySelectorAll("[data-ad-slot]").forEach((el) => observer.observe(el))
    }

    return () => {
      document.removeEventListener("click", onClick)
      observer?.disconnect()
    }
  }, [])

  return null
}
