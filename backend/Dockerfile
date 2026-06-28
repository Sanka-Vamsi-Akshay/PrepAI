# Stage 1: Build TypeScript backend
FROM node:20-bookworm AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies for tsc)
RUN npm ci --legacy-peer-deps

# Copy code and configuration files
COPY tsconfig.json ./
COPY eslint.config.js ./
COPY .prettierrc ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Stage 2: Run production environment
FROM node:20-alpine AS runner

WORKDIR /app

# Set ownership of the directory to node user
RUN chown -R node:node /app

# Switch to non-root node user
USER node

# Copy package.json and package-lock.json with correct ownership
COPY --chown=node:node package*.json ./

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy generated prisma client and schema with correct ownership
COPY --chown=node:node --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=node:node --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --chown=node:node --from=builder /app/prisma ./prisma

# Copy built code with correct ownership
COPY --chown=node:node --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start app
CMD ["node", "dist/index.js"]
