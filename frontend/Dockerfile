# Use official Node LTS image
FROM node:20-alpine

ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    else npm install; fi

# Copy source
COPY . .

EXPOSE 3000

# Default to dev server for quick start; can be overridden to `next start` after build
CMD ["npm", "run", "dev"]
