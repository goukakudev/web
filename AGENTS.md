<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deployment

When a user asks for a production-facing change in this repository, complete the implementation, run the relevant tests plus `npm run build`, and deploy to production without asking for a separate confirmation unless the user explicitly says not to deploy.

Production runs on the EC2 instance tagged **`GO-WEB`** (`i-0902c68e9d7a1e6bc`, AWS profile `go`, region `ap-northeast-3`, EIP `15.168.222.228`; back on EC2 since 2026-07-05). `goukaku.dev` DNS is Cloudflare-proxied straight to this origin (no Workers Route). On the box, Caddy terminates TLS (Cloudflare origin cert; also 301s `www` → apex) and reverse-proxies to the app, which is an `output: "standalone"` build run by `goukaku-web.service` (`node /opt/goukaku-web/.next/standalone/server.js`, `PORT=3000`, env via `EnvironmentFile=/opt/goukaku-web/.env.local` — do NOT switch the unit back to `next start`; it refuses to run with standalone output).

Deploy = build on the instance, then swap:

1. `rsync -az --delete -e "ssh -i ~/.ssh/go.pem" --exclude .git --exclude node_modules --exclude .next --exclude .env.local ./ ec2-user@15.168.222.228:release-<sha>/`
2. On the box, inside the release dir: copy `/opt/goukaku-web/.env.local` in, `npm ci`, `NODE_OPTIONS=--max-old-space-size=1536 npm run build` (t4g.small has 2GB RAM + 4GB swap), then copy the standalone runtime assets: `cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && cp .env.local .next/standalone/`
3. Swap + restart: `sudo systemctl stop goukaku-web`, move `/opt/goukaku-web` aside (keep as rollback), move the release dir to `/opt/goukaku-web`, `sudo chown -R goukaku:goukaku /opt/goukaku-web`, `sudo systemctl restart goukaku-web`, then verify `curl 127.0.0.1:3000` on the box and `https://goukaku.dev` (responses served by EC2 carry `via: 1.1 Caddy`).

Gotcha: `api.goukaku.dev` must resolve via public DNS from the box. An old `/etc/hosts` override pinning it to a private VPC IP made every build-time and runtime API call 502 (empty prerenders) — it is commented out; keep it that way.

The Cloudflare Containers stack (`Dockerfile`, `worker.ts`, `wrangler.jsonc`, `.github/workflows/deploy.yml`) is kept as a **dormant fallback**: no route bound, keep-warm cron removed, workflow is `workflow_dispatch`-only. Emergency switch-back = run that workflow, then add the `goukaku.dev/*` route in the Cloudflare dashboard (dashboard-managed; the CI token lacks Zone>Workers Routes:Edit).
