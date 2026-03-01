FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies for the monorepo and this workspace.
COPY package.json package-lock.json ./
COPY packages/api/package*.json packages/api/
COPY packages/app/package*.json packages/app/
RUN npm ci --workspaces

# Copy the source and build the API.
COPY . .
RUN npm run build --workspace packages/api

EXPOSE 8080
CMD ["npm", "run", "start", "--workspace", "packages/api"]
