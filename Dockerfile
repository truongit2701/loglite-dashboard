# Stage 1: Build React
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Chỉ giữ lại static files
FROM alpine:latest
WORKDIR /usr/share/caddy
COPY --from=build /app/dist .
# Container này chỉ cần tồn tại để Docker Compose có thể copy file qua volume
CMD ["sh", "-c", "echo 'Frontend files ready' && sleep infinity"]