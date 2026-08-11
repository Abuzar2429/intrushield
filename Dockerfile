# =========================================================
# IntruShield Unified Production Container (Node.js + React + Express)
# =========================================================
FROM node:20-alpine

WORKDIR /app

# Copy root and server package manifests & install dependencies
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci && npm --prefix server ci

# Copy full repository source code
COPY . .

# Build React frontend SPA and compile Express server TypeScript
RUN npm run build

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start unified Node server serving frontend SPA & backend REST API / WebSockets
CMD ["npm", "start"]
