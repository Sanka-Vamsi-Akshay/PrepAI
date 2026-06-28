# Stage 1: Build React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and lockfile
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy configuration and code files
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY .eslintrc.json ./
COPY .prettierrc ./
COPY index.html ./
COPY src ./src

# Build the application
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy built code to standard directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Modify Nginx directory permissions to run as non-root user 'nginx'
RUN chmod -R a+rwx /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chmod a+rwx /var/run/nginx.pid

# Run as non-root nginx user
USER nginx

# Expose non-privileged HTTP port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
