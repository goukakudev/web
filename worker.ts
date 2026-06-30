import { Container, getContainer } from "@cloudflare/containers";

export interface Env {
  NEXT_CONTAINER: DurableObjectNamespace<NextContainer>;
  // Runtime config forwarded into the container process. Locally these come
  // from .dev.vars; in production from wrangler vars/secrets. None are
  // NEXT_PUBLIC_*, so they are not needed at image build time.
  API_BASE?: string;
  API_KEY?: string;
  REVALIDATE_TOKEN?: string;
}

/**
 * Front-door Worker for the Next.js app running in a Cloudflare Container.
 *
 * The Next.js standalone server (Dockerfile) listens on :8080. This Worker is a
 * thin router that forwards every request to a single shared container instance
 * — there is no per-Worker bundle-size problem here (the large Next bundle
 * lives in the container image, not the Worker).
 */
export class NextContainer extends Container<Env> {
  // Must match the port the Next standalone server binds (Dockerfile: PORT=8080).
  defaultPort = 8080;
  // Scale to zero after idle to stay near the $5/mo Workers Paid allowance.
  // Prod traffic is ~7k req/day, so 30m keeps the instance warm across daytime
  // gaps — only deep-idle overnight stretches sleep (one cold start next morning).
  // Raise further (or add a cron keep-warm ping) if cold starts still hurt UX.
  sleepAfter = "30m";

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Pass the app's server-side runtime env into the container process.
    this.envVars = {
      API_BASE: env.API_BASE ?? "https://api.goukaku.dev",
      ...(env.API_KEY ? { API_KEY: env.API_KEY } : {}),
      ...(env.REVALIDATE_TOKEN
        ? { REVALIDATE_TOKEN: env.REVALIDATE_TOKEN }
        : {}),
    };
  }
}

// Edge cache TTL cap (seconds). The app sets a long s-maxage (up to 1y) on
// prerendered pages; we cap how long Cloudflare's edge holds a copy so ISR and
// on-demand revalidation still surface within this window. Raise for more
// offload at higher traffic (at the cost of slightly staler pages).
const EDGE_TTL_SECONDS = 60;

/**
 * Whether this request may be served from / stored in the edge cache.
 *
 * Only full-document GETs are cacheable. App Router responses carry
 * `Vary: rsc, next-router-*`, i.e. the SAME url returns a different body for
 * RSC/prefetch requests (a flight payload, not HTML). We therefore skip caching
 * whenever those request headers are present so a cached HTML doc can never be
 * served to a client expecting an RSC payload (or vice versa). /api/* and the
 * random-question routes are always dynamic (the latter is also no-store).
 */
function isCacheableRequest(request: Request): boolean {
  if (request.method !== "GET") return false;
  if (
    request.headers.has("rsc") ||
    request.headers.has("next-router-prefetch") ||
    request.headers.has("next-router-state-tree")
  ) {
    return false;
  }
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/api/")) return false;
  if (pathname.endsWith("/play/random")) return false;
  return true;
}

/** Respect the origin's intent: never cache no-store/private/no-cache responses. */
function isCacheableResponse(response: Response): boolean {
  if (!response.ok) return false;
  const cc = response.headers.get("Cache-Control") ?? "";
  return !/no-store|private|no-cache/i.test(cc);
}

async function handle(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const container = getContainer(env.NEXT_CONTAINER);
  if (!isCacheableRequest(request)) {
    return container.fetch(request);
  }

  const cache = caches.default;
  // Key by URL only (method GET) — request headers are intentionally excluded
  // since we already gate on RSC headers above.
  const cacheKey = new Request(new URL(request.url).toString(), { method: "GET" });

  const hit = await cache.match(cacheKey);
  if (hit) {
    const r = new Response(hit.body, hit);
    r.headers.set("x-edge-cache", "HIT");
    return r;
  }

  const response = await container.fetch(request);
  if (!isCacheableResponse(response)) {
    return response;
  }

  // Buffer once, then build a client response (original headers) plus a cache
  // copy whose Cache-Control is capped to EDGE_TTL_SECONDS.
  const buf = await response.arrayBuffer();
  const init = {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  };

  const cacheHeaders = new Headers(response.headers);
  cacheHeaders.set("Cache-Control", `public, s-maxage=${EDGE_TTL_SECONDS}`);
  ctx.waitUntil(
    cache.put(
      cacheKey,
      new Response(buf, { ...init, headers: cacheHeaders }),
    ),
  );

  const clientResp = new Response(buf, init);
  clientResp.headers.set("x-edge-cache", "MISS");
  return clientResp;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      return await handle(request, env, ctx);
    } catch {
      // The cache layer must never break the site: on any error fall back to a
      // direct, uncached container fetch (the original behavior).
      return getContainer(env.NEXT_CONTAINER).fetch(request);
    }
  },

  // Keep-warm. A cron trigger (wrangler.jsonc "triggers.crons") invokes this on a
  // schedule to ping the container directly — bypassing the edge cache so it
  // always resets the container's sleepAfter timer. Without it, idle gaps cause
  // 4.5-9.5s cold starts for the next visitor; with it the container stays warm
  // at the cost of ~always-on basic-tier compute (still under the EC2 it
  // replaced). Remove the cron to restore pure scale-to-zero.
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      getContainer(env.NEXT_CONTAINER)
        .fetch(new Request("https://goukaku.dev/"))
        .then(() => undefined)
        .catch(() => undefined),
    );
  },
} satisfies ExportedHandler<Env>;
