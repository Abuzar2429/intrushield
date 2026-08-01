# =========================================================
# IntruShield NIDS Backend Container build
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests & install dependencies
COPY package*.json ./
RUN npm ci

# Copy source & compile TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# =========================================================
# Production Runtime Stage
# =========================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests & install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

# Expose HTTP/WS server port
EXPOSE 5000

# Health check using node http request
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "dist/server.js"]
