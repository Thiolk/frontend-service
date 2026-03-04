#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="deploy/docker/docker-compose.yml"
ENV_EXAMPLE="deploy/docker/.env.example"
ENV_FILE="deploy/docker/.env"

# Ensure env file exists
[ -f "$ENV_FILE" ] || cp "$ENV_EXAMPLE" "$ENV_FILE"

# Fresh run
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v || true
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build frontend

# Wait a bit for nginx
for i in $(seq 1 30); do
  if curl -fsS "http://localhost:${FRONTEND_PORT:-8080}/env.js" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "Checking /env.js contains injected URLs..."
curl -fsS "http://localhost:${FRONTEND_PORT:-8080}/env.js" | grep -q "PRODUCT_API_URL"
curl -fsS "http://localhost:${FRONTEND_PORT:-8080}/env.js" | grep -q "ORDER_API_URL"

echo "OK: frontend smoke test passed."