FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM oven/bun:alpine AS runner

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/start.mjs ./start.mjs
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "start.mjs"]
