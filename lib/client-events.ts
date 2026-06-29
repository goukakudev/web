export type ClientEventProps = Record<string, string | number | boolean>

export function trackEvent(name: string, props?: ClientEventProps): void {
  if (typeof window === "undefined") return

  const payload = JSON.stringify({
    name,
    props,
    path: window.location.pathname,
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/events",
      new Blob([payload], { type: "application/json" }),
    )
    return
  }

  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {})
}
