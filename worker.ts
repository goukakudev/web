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
  // Scale to zero: sleep the instance after idle so we stay within the
  // $5/mo Workers Paid allowance. Raise this if cold starts hurt UX.
  sleepAfter = "5m";

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Route all traffic to one shared container instance (low traffic ~7k/day).
    return getContainer(env.NEXT_CONTAINER).fetch(request);
  },
} satisfies ExportedHandler<Env>;
