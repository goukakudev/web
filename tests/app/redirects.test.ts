import { describe, expect, it } from "vitest"
import nextConfig from "@/next.config"

describe("redirects", () => {
  it("permanently canonicalizes legacy /dk URLs to /denki", async () => {
    const redirects = await nextConfig.redirects?.()

    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/dk/:path*",
          destination: "/denki/:path*",
          permanent: true,
        },
      ]),
    )
  })
})
