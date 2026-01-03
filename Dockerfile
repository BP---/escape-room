# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Generate Drizzle types and sync
RUN npm run db:generate

# Build the SvelteKit application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install sqlite3 CLI for migration management
RUN apk add --no-cache sqlite

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Copy schema files for drizzle-kit
COPY --from=builder /app/src/lib/server/db ./src/lib/server/db

# Copy other necessary files
COPY svelte.config.js ./
COPY vite.config.ts ./
COPY tsconfig.json ./

# Create directory for database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Create entrypoint script
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Check if this is a fresh database or migrating from push to migrate' >> /app/entrypoint.sh && \
    echo 'DB_PATH="${DATABASE_URL#file:}"' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'if [ -f "$DB_PATH" ]; then' >> /app/entrypoint.sh && \
    echo '  # Check if __drizzle_migrations table exists' >> /app/entrypoint.sh && \
    echo '  TABLE_EXISTS=$(sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='"'"'table'"'"' AND name='"'"'__drizzle_migrations'"'"';" 2>/dev/null || echo "")' >> /app/entrypoint.sh && \
    echo '  ' >> /app/entrypoint.sh && \
    echo '  if [ -z "$TABLE_EXISTS" ]; then' >> /app/entrypoint.sh && \
    echo '    echo "Migrating from push to migrate: creating migrations table..."' >> /app/entrypoint.sh && \
    echo '    # Create migrations table and mark existing migrations as applied' >> /app/entrypoint.sh && \
    echo '    sqlite3 "$DB_PATH" "CREATE TABLE IF NOT EXISTS __drizzle_migrations (id INTEGER PRIMARY KEY, hash TEXT NOT NULL, created_at INTEGER);"' >> /app/entrypoint.sh && \
    echo '    sqlite3 "$DB_PATH" "INSERT INTO __drizzle_migrations (hash, created_at) VALUES ('"'"'0000_misty_quasimodo'"'"', 1766257150922);"' >> /app/entrypoint.sh && \
    echo '    sqlite3 "$DB_PATH" "INSERT INTO __drizzle_migrations (hash, created_at) VALUES ('"'"'0001_redundant_tusk'"'"', 1766258980611);"' >> /app/entrypoint.sh && \
    echo '    sqlite3 "$DB_PATH" "INSERT INTO __drizzle_migrations (hash, created_at) VALUES ('"'"'0002_misty_komodo'"'"', 1766345325785);"' >> /app/entrypoint.sh && \
    echo '    echo "Marked existing migrations as applied."' >> /app/entrypoint.sh && \
    echo '  fi' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'echo "Running database migrations..."' >> /app/entrypoint.sh && \
    echo 'npx drizzle-kit migrate' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'echo "Starting application..."' >> /app/entrypoint.sh && \
    echo 'exec node build' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Use entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
