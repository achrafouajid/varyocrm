FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY server/package.json ./
RUN npm install --omit=dev

COPY server/server.js ./server.js
COPY --from=build /app/dist/app/browser ./dist

EXPOSE 4000

CMD ["node", "server.js"]
