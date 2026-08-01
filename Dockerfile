# =========================================================
# Stage 1: Build React Production Distribution Assets
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests & install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and configuration files
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY index.html ./
COPY public ./public
COPY src ./src

# Build production bundle
RUN npm run build

# =========================================================
# Stage 2: Serve Bundle via Nginx Reverse Proxy
# =========================================================
FROM nginx:1.25-alpine AS runner

# Remove default Nginx site static files
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static site output from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
