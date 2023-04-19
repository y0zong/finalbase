FROM alpine AS base
RUN apk add --update nodejs npm

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache python3 make g++
WORKDIR /deps

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  # if [ -f package-lock.json ]; then npm ci; \
  if [ -f package-lock.json ]; then npm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /builder
COPY --from=deps /deps/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /dashboard

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /builder/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /builder/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /builder/.next/static ./.next/static
# !bug is not fix https://github.com/vercel/next.js/issues/48077
# COPY --from=builder --chown=nextjs:nodejs /builder/node_modules/next/dist/compiled/jest-worker ./node_modules/next/dist/compiled/jest-worker

USER nextjs

EXPOSE 8443

ENV PORT 8443

CMD ["node", "server.js"]