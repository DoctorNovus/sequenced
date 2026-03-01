# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/app/package*.json packages/app/
COPY packages/api/package*.json packages/api/
RUN npm ci --workspaces

COPY . .

# VITE_API_URL is injected at build time so the frontend knows where the API lives.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build --workspace packages/app

# Runtime stage - serve static assets with nginx
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/packages/app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
