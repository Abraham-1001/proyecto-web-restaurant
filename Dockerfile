# Base image – LTS ligera y estable
FROM node:18-alpine

# Seguridad: no correr como root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /usr/src/app

# Copy package manifests and install dependencies first (cache layer)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy source files
COPY . .

# Cambiar a usuario no-root
USER appuser

# Expose application port
EXPOSE 3000

# Default environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the app
CMD ["npm", "start"]
