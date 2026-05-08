# =========================
# Stage 1: Build React
# =========================
FROM node:22-alpine AS build

WORKDIR /app

# cache dependencies trước
COPY package*.json ./
RUN npm ci

# copy source
COPY . .

# build production
RUN npm run build


# =========================
# Stage 2: Caddy runtime
# =========================
FROM caddy:2-alpine

# copy static build
COPY --from=build /app/dist /usr/share/caddy

# copy caddy config
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]