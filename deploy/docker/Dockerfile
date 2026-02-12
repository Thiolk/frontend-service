# build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# runtime stage
FROM nginx:1.27-alpine
COPY --from=build /app/build /usr/share/nginx/html

COPY deploy/docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]