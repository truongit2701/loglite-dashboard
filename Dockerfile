# Stage 1: Build
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine
COPY --from=build-stage /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443
