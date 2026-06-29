<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deployment

When a user asks for a production-facing change in this repository, complete the implementation, run the relevant tests plus `npm run build`, and deploy to production without asking for a separate confirmation unless the user explicitly says not to deploy.

Production runs on the EC2 instance tagged `GO-WEB` in the `go` AWS profile, not on Vercel. The app lives at `/opt/goukaku-web`, runs as `goukaku-web.service`, and is proxied by Caddy. Deploy by syncing a fresh release directory to the instance with `~/.ssh/go.pem`, copying the existing production `.env.local`, running `npm ci` and `npm run build` on the instance, then swapping it into `/opt/goukaku-web` and restarting `goukaku-web.service`.
