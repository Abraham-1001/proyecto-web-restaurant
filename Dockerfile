# Base image
FROM node:24-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package manifests and install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source files
COPY . .

# Expose application port
EXPOSE 3000

# Default environment variables
ENV PORT=3000

# Start the app
CMD ["npm", "start"]
