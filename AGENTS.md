<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deployment

When a user asks for a production-facing change in this repository, complete the implementation, run the relevant tests plus `npm run build`, and deploy to production without asking for a separate confirmation unless the user explicitly says not to deploy.

### Current production: Cloudflare Containers

Read-only inspection on **2026-10-10** confirmed that `goukaku.dev/*` and `www.goukaku.dev/*` are active routes for Worker **`goukaku-web`**. Its `NEXT_CONTAINER` Durable Object binding runs the Next.js standalone application on port 8080. The container application is `goukaku-web-nextcontainer`.

The July EC2 cutover notes and the “dormant fallback” comments still present in `wrangler.jsonc` and `.github/workflows/deploy.yml` describe a previous configuration. They do not describe the currently active routes. Keep the existing hosting and routing; this is not an EC2 migration.

Use the existing **GitHub Actions `workflow_dispatch`** deployment in `goukakudev/web`, file `.github/workflows/deploy.yml`. A push to `main` does not automatically run it. The workflow builds a linux/amd64 image, runs `npm run build` inside the Docker build with BuildKit secrets, pushes a commit-tagged image to Cloudflare Registry, deploys `worker.ts`, and synchronizes runtime secrets. Do not deploy the checked-in `:ci` placeholder image directly.

Before publication:

1. Inspect `git status` and preserve unrelated work. Read the installed Next.js guides above before changing app code.
2. Use Node.js 22, `npm ci`, relevant `npm test` coverage, `npm run typecheck`, and `npm run lint`. Run `npm run build` with valid server-side API configuration. If local build credentials are unavailable, the existing CI Docker build must complete successfully before the deployment can be considered built and published; report that distinction.
3. Commit/push the reviewed change to the intended ref. Run `gh workflow run deploy.yml --repo goukakudev/web --ref main` for a normal production release. Check that the selected run uses the intended commit and finishes successfully.
4. Verify the active Worker version, container image tag, public HTTP responses, and the changed behavior. Container rollout continues after the deploy command returns; command success alone is not a full application check. Respect session-specific browser restrictions.

Required GitHub secret names: `API_BASE`, `API_KEY`, `REVALIDATE_TOKEN`, `CLOUDFLARE_API_TOKEN`. The Worker also has `API_KEY` and `REVALIDATE_TOKEN` secrets and an `API_BASE` variable. Do not print secret values, copy them into source files, or expose them through `NEXT_PUBLIC_*`. Existing local Wrangler OAuth can perform permitted inspection/deployment without copying tokens into shell arguments.

Preserve `goukaku-api`, its eight D1 bindings, API authentication, all study routes and localStorage formats, and the `r2.goukaku.dev` figure pass-through. A presentation change does not require a database migration or secret/DNS/route replacement. Routes are dashboard-managed; do not add them merely because they are absent from `wrangler.jsonc`.

Before each deployment record the current source commit, Worker version and container image. For a full app rollback, rerun the existing workflow from a branch/tag pointing at the previous known-good commit. Worker-version rollback alone must not be treated as proof that the container application image or external resources were restored. Check both after rollback. The pre-refresh baseline and commands are in `README.md`; retain its image until a new release is verified.

### Historical EC2 configuration

The earlier origin was `GO-WEB` (`i-0902c68e9d7a1e6bc`, region `ap-northeast-3`, EIP `15.168.222.228`, AWS profile `go`). It used Caddy and `goukaku-web.service`, with `/opt/goukaku-web/.next/standalone/server.js`, port 3000, and `/opt/goukaku-web/.env.local`. This is historical recovery context, not the current deploy target. Do not switch production back or change its services as part of routine web edits. A future EC2 restoration must reverify the instance, credentials, routes and public API DNS; the old private-IP `/etc/hosts` override for `api.goukaku.dev` must remain disabled.
