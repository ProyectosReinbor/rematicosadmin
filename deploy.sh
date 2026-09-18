#!/bin/bash
set -e

echo "=== Remáticos Deployment ==="
echo ""

# Check .env.production
if [ ! -f .env.production ]; then
  echo "ERROR: .env.production file not found."
  echo "Copy .env.production.example to .env.production and fill in the values."
  exit 1
fi

# Load env vars
export $(grep -v '^#' .env.production | xargs)

echo "1. Pulling latest code..."
git pull origin main

echo "2. Building and starting containers..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

echo "3. Waiting for API to be healthy..."
sleep 10

echo "4. Running Prisma migrations..."
docker compose -f docker-compose.prod.yml exec -T api npx prisma db push --schema=prisma/schema.prisma --accept-data-loss

echo "5. Restarting API..."
docker compose -f docker-compose.prod.yml restart api

echo ""
echo "=== Deployment complete ==="
echo "Storefront: https://rematicos.reinbor.cloud"
echo "Admin:      https://rematicosadmin.reinbor.cloud"
echo ""
echo "Run 'docker compose -f docker-compose.prod.yml logs -f' to watch logs."
