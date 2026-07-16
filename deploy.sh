#!/bin/sh
set -e

echo "=== 7ice Platform Deploy ==="

# Check .env exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Copy .env.example to .env and configure it."
  exit 1
fi

# Build and start services
echo "Building and starting services..."
docker compose build
docker compose up -d database keycloak

echo "Waiting for database..."
docker compose exec -T database sh -c 'until pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; do sleep 1; done'

echo "Running migrations..."
docker compose run --rm migrate

echo "Starting Keycloak init..."
docker compose up -d keycloak-init
sleep 5

echo "Starting application..."
docker compose up -d application nginx

echo "=== Deploy complete ==="
echo "Application: http://localhost:${NGINX_PORT:-80}"
echo "Keycloak: http://localhost:8180"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"
