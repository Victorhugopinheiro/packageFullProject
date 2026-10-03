FROM node:22.16.0-slim

# Install OpenSSL for Prisma engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache dependency layer
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code and compile
COPY . .
RUN npm run build

# Optional: Remove devDependencies to save disk space


EXPOSE 5000

# Run node directly for proper Linux signal forwarding
CMD ["node", "dist/server.js"]