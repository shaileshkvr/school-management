# Stage 1: Build React Application
FROM node:20-alpine AS build

# Install pnpm
RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from Stage 1 to Nginx public directory
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose port 9090 (matching docker-compose client port)
EXPOSE 9090

# Custom Nginx configuration to support SPA routing (React Router redirections)
RUN echo 'server { \
    listen 9090; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
