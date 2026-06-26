FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Generate Prisma Client
RUN pnpm exec prisma generate

# Compile TypeScript to JavaScript
RUN pnpm exec tsc

# Expose the server port
EXPOSE 9091

# Start the server
CMD ["node", "src/app.js"]
