FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV VITE_ALLOWED_HOSTS=true
ENV __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=prime.santos-games.com

COPY package.json package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "exec node ./node_modules/vite/bin/vite.js preview --host 0.0.0.0 --port ${PORT:-3000}"]