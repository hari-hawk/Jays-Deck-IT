FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --production=false

# Generate Prisma client
RUN npx prisma generate

# Copy source
COPY . .

# Expose port
EXPOSE 4000

# Start server
CMD ["npx", "tsx", "src/index.ts"]
