<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deployment

When a user asks for a production-facing change in this repository, complete the implementation, run the relevant tests plus `npm run build`, and deploy to production without asking for a separate confirmation unless the user explicitly says not to deploy.

Production runs on **Cloudflare Containers**: a Next.js standalone server (`Dockerfile`, `output: 'standalone'`) in a Docker image, fronted by a thin Worker router (`worker.ts`, which also adds an edge cache and a keep-warm cron) bound to the `goukaku.dev` apex. Deployment is fully automated — **pushing to `main` triggers `.github/workflows/deploy.yml`**, which builds the linux/amd64 image, pushes it to the Cloudflare managed registry under a per-commit tag, runs `wrangler deploy` (which rolls the container forward), and re-applies the runtime Worker secrets. So "deploy to production" = land the change on `main`; there is no manual server step. Container/Worker config is in `wrangler.jsonc`; the apex Workers Route is managed in the Cloudflare dashboard (the CI token lacks Zone>Workers Routes:Edit). Build/runtime secrets come from GitHub repo secrets (`API_BASE`, `API_KEY`, `REVALIDATE_TOKEN`, `CLOUDFLARE_API_TOKEN`). The legacy EC2 deploy (`GO-WEB` in the `go` AWS profile, served via Caddy + `goukaku-web.service`) is retired.
