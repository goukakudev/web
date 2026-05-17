"use client"

import { useEffect } from "react"
import { flushPendingRequests } from "@/lib/client-api"

export function PendingFlusher() {
  useEffect(() => {
    void flushPendingRequests()
    const onlineHandler = () => void flushPendingRequests()
    const focusHandler = () => void flushPendingRequests()
    window.addEventListener("online", onlineHandler)
    window.addEventListener("focus", focusHandler)
    return () => {
      window.removeEventListener("online", onlineHandler)
      window.removeEventListener("focus", focusHandler)
    }
  }, [])

  return null
}
