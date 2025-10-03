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

# Stage 3: Production image
# This stage creates the final, lean image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the optimized, standalone output from the builder stage
# This includes only what's necessary to run the app in production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static


# The command to start the app
# This runs the optimized Next.js server
CMD ["node", "server.js"]