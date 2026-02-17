FROM node:18-alpine AS base

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Build the application (needed for NestJS)
RUN npm run build

# Expose port
EXPOSE 8080

# Update PORT environment variable
ENV PORT=8080

# Start the application
CMD ["node", "dist/main.js"]