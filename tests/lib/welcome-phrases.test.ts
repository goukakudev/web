import { describe, it, expect } from "vitest"
import { PHRASES, randomPhrase } from "@/lib/welcome-phrases"

describe("welcome phrases", () => {
  it("has at least 50 phrases", () => {
    expect(PHRASES.length).toBeGreaterThanOrEqual(50)
  })

  it("randomPhrase returns one of PHRASES", () => {
    for (let i = 0; i < 20; i++) {
      expect(PHRASES).toContain(randomPhrase())
    }
  })
})
