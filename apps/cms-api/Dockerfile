# Multi-stage build for NestJS backend
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application (needed for NestJS)
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /usr/src/app/dist ./dist



# Expose port
EXPOSE 8080

# Update PORT environment variable
ENV PORT=8080

# Start the application
CMD ["node", "dist/main.js"]