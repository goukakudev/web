import { questionPageResponse } from "@/lib/seo/question-page-response"

export const revalidate = 86400

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params
  return questionPageResponse("fe", slug)
}
