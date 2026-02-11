# Ecommerce Frontend (React)
React-based web UI for the e-commerce microservices project.

## Release
- Current release: 1.0.1

## Prerequisites
- Docker (recommended)
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
## Configuration
cp .env.example .env
Example variables (Create React App requires the REACT_APP_ prefix):
REACT_APP_PRODUCT_API_URL=http://localhost:5000
REACT_APP_ORDER_API_URL=http://localhost:5001

## Build and Run with Docker
```bash
docker build -t frontend:local -f deploy/docker/Dockerfile .
docker run --rm -p 8080:80 frontend:local
```