# Stage 1: Build the React/Vite Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json tsconfig.json vite.config.ts index.html ./
COPY src/ ./src/
RUN npm install
RUN npm run build

# Stage 2: Build the Express Backend Server
FROM node:20-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json server/tsconfig.json ./
RUN npm install
COPY server/src/ ./src/
COPY server/prisma/ ./prisma/
RUN npm run build
RUN npm prune --production

# Stage 3: Production Runtime
FROM node:20-alpine
WORKDIR /app

# Copy built server assets
COPY --from=backend-builder /app/server/dist /app/server/dist
COPY --from=backend-builder /app/server/node_modules /app/server/node_modules
COPY --from=backend-builder /app/server/package.json /app/server/package.json
COPY --from=backend-builder /app/server/prisma /app/server/prisma

# Copy built frontend assets to the server's public folder for static file serving
COPY --from=frontend-builder /app/dist/public /app/server/dist/public

EXPOSE 4000
WORKDIR /app/server

# Environment variables
ENV NODE_ENV=production
ENV PORT=4000

# The runtime command is overridden in docker-compose to handle migrations and seed on startup
CMD ["node", "dist/index.js"]
