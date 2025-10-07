# Dockerfile

# Stage 1: Install dependencies
# Use a specific version of Alpine for reproducibility
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Use 'npm ci' for clean, consistent installs
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .
# Run the Next.js build command
RUN npm run build
RUN mv public .next/standalone/

# Stage 3: Production image
# This stage creates the final, lean image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Ensure native deps for sharp are available at runtime
RUN apk add --no-cache libc6-compat

# Copy the optimized, standalone output from the builder stage
# This includes only what's necessary to run the app in production
COPY --from=builder /app/data ./data
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create writable directories for uploads/config and drop privileges
RUN mkdir -p /app/public/uploads /app/data \
  && chown -R node:node /app/public/uploads \
  && chown -R node:node /app/data

USER node

# The command to start the app
# This runs the optimized Next.js server
CMD ["node", "server.js"]