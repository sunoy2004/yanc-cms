# Multi-stage build for React frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
#RUN npm ci --only=production
RUN npm install


# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine
# Install envsubst for runtime env var substitution and other small tools
RUN apk add --no-cache gettext

# Copy nginx configuration template (will substitute $PORT at container start)
COPY nginx.conf /etc/nginx/nginx.conf.template

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Default port (can be overridden by Cloud Run via PORT env)
ENV PORT=8080
EXPOSE 8080

# Substitute PORT into nginx.conf at container start and run nginx
CMD [ "sh", "-c", "envsubst '$$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'" ]

