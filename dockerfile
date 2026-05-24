FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/start.mjs ./start.mjs
COPY --from=build /app/node_modules/miniflare ./node_modules/miniflare
COPY --from=build /app/node_modules/workerd ./node_modules/workerd
COPY --from=build /app/node_modules/@cloudflare ./node_modules/@cloudflare

EXPOSE 3000

CMD ["node", "start.mjs"]
