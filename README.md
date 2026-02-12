# Ecommerce Frontend (React)
React-based web UI for the e-commerce microservices project.

This frontend supports **runtime configuration** of backend API URLs via an `env.js` file (injected when the container starts). This avoids rebuilding the image when API endpoints change.

## Release
- Current release: 1.1.0

## Prerequisites
- Docker + Docker Compose (recommended)
- Node.js (LTS) + npm (optional for local dev)

## Important: TypeScript Compatibility (Required Fix)

This project uses `react-scripts@5.0.1`, which is compatible with TypeScript `^3.2.1 || ^4`.
If your install resolves TypeScript 5.x, you may see:
- `npm ci` failing due to lockfile mismatch
- `npm ls typescript` showing `invalid`

### Fix (pin TypeScript to v4.9.5)
Run in the repo root:

```bash
npm install -D typescript@4.9.5
rm -rf node_modules package-lock.json
npm install
```

## Docker
Docker-related files are located in: deploy/docker/

### 1) Create your local environment file

From the repo root:
```bash
cp deploy/docker/.env.example deploy/docker/.env
```
Edit deploy/docker/.env if needed.

### 2) Build and run
From the repo root:
```bash
docker compose -f deploy/docker/docker-compose.yml --env-file deploy/docker/.env up -d --build
docker ps
```

Open the app: http://localhost:8080 (or your FRONTEND_PORT value)

### 3) Stop
```bash
docker compose -f deploy/docker/docker-compose.yml --env-file deploy/docker/.env down
```

## Configuration
Runtime environment variables (set in deploy/docker/.env):
- FRONTEND_PORT (host port for the UI, default 8080)
- PRODUCT_API_URL (what the browser calls for product API)
- ORDER_API_URL (what the browser calls for order API)

Example .env values:
FRONTEND_PORT=8080
PRODUCT_API_URL=http://localhost:5000
ORDER_API_URL=http://localhost:5001

## Security Scanning (Docker Scout)

We scan the built frontend container image for known CVEs using Docker Scout.

From the repo root:

### Scan
```bash
docker scout quickview --local ecommerce-frontend:local
docker scout cves --local ecommerce-frontend:local
```

### Policy / Rationale

The frontend runtime image is based on the official nginx image.
Vulnerabilities reported in system packages (e.g., openssl, libxml2, curl) are inherited from the upstream base image.

We mitigate this by:
- using an appropriate official base image tag and updating it when patches are released
- keeping the runtime image minimal (static React build served by Nginx)