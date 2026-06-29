# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-slim AS builder
WORKDIR /app

# Install deps from the lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Build the standalone Next.js server (next.config.ts: output: 'standalone').
# SSG pages fetch the exam API at build time, so API_BASE/API_KEY must be present
# during `next build`. Inject them via a BuildKit secret mount so they are NOT
# baked into the image (build with: --secret id=apienv,src=.env.local).
COPY . .
RUN --mount=type=secret,id=apienv \
    if [ -f /run/secrets/apienv ]; then set -a && . /run/secrets/apienv && set +a; fi && \
    npm run build

# ---- Runtime stage ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Cloudflare Containers / NextContainer.defaultPort expects :8080.
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Standalone output bundles server.js + the minimal traced node_modules.
COPY --from=builder /app/.next/standalone ./
# static/ and public/ are intentionally excluded from standalone — copy them in
# so server.js serves them directly (no separate CDN wired up).
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080
CMD ["node", "server.js"]
