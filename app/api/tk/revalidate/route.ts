import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Tag-based revalidation. DB側で問題文/解説/法令データを更新した後に呼ぶ。
 * Auth は API_KEY (既存 EC2 API と同じ key) を流用。
 */
export async function POST(req: Request) {
  const key = req.headers.get("x-api-key");
  if (!key || key !== process.env.API_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  revalidateTag("takken");
  return NextResponse.json({ revalidated: true, ts: Date.now() });
}
