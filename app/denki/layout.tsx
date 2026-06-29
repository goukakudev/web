import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "第二種電気工事士 過去問演習",
    template: "%s | 第二種電気工事士 | 合格.dev",
  },
  description:
    "第二種電気工事士 学科試験の過去問演習。図入り問題を含む39回分・1,950問を、順番・ランダム・模試で解けます。",
}

export default function DenkiLayout({ children }: { children: React.ReactNode }) {
  return <div className="denki-root">{children}</div>
}
