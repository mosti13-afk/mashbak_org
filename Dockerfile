# Cloud Run image. Deployed by Cloud Build on every push to main (same setup as Match-Bak).
# Manual deploy: gcloud run deploy mashbak --source . --region europe-west4 --allow-unauthenticated
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public Supabase values (shipped to the browser anyway, protected by RLS). Override with --build-arg.
ARG NEXT_PUBLIC_SUPABASE_URL=https://ogwryyvvntoqhnzvgsds.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3J5eXZ2bnRvcWhuenZnc2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMjM4NDksImV4cCI6MjEwOTY5OTg0OX0.DvEybOcVEEiTtVZE06BWFveoUrgCbluZT18Gdy0k5BM
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 8080
CMD ["node", "server.js"]
