# Ecommerce Frontend (React)
React-based web UI for the e-commerce microservices project.

This frontend supports **runtime configuration** of backend API URLs via an `env.js` file (injected when the container starts). This avoids rebuilding the image when API endpoints change.

## Release
- Current release: 2.0.1
- Docker Hub namespace: `thiolengkiat413/frontend`

## Tech Stack

- React 18
- react-scripts 5.0.1
- Jest + React Testing Library
- ESLint + Prettier
- SonarQube (static analysis)
- Docker (multi-stage build)
- Docker Scout (CVE scanning)

------------------------------------------------------------------------

# Local Development

## Prerequisites

- Docker + Docker Compose (recommended)
- Node.js (LTS) + npm (optional for local dev)
- npm

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

## Run Development Server

``` bash
npm start
```

Default: http://localhost:3000

## Lint

``` bash
npm run lint
```

## Format Check

``` bash
npm run format:check
```

Auto-fix formatting:

``` bash
npm run format
```

## Unit Tests (with Coverage)

``` bash
CI=true npm test -- --watchAll=false --coverage
```

Coverage output is generated at:

    coverage/lcov.info

## Runtime Configuration

The frontend reads API URLs from `window.__ENV__`, which is generated at
container startup.

Environment variables (defined in `deploy/docker/.env`):

-   FRONTEND_PORT
-   PRODUCT_API_URL
-   ORDER_API_URL

Example:

    FRONTEND_PORT=8080
    PRODUCT_API_URL=http://localhost:5000
    ORDER_API_URL=http://localhost:5001


## Run with Docker Compose

### 1) Create Environment File

``` bash
cp deploy/docker/.env.example deploy/docker/.env
```

Edit values if needed.

### 2) Build and Run

``` bash
docker compose -f deploy/docker/docker-compose.yml   --env-file deploy/docker/.env up -d --build
```

Access the app:

http://localhost:8080


### 3) Stop

``` bash
docker compose -f deploy/docker/docker-compose.yml   --env-file deploy/docker/.env down
```

------------------------------------------------------------------------

# CI/CD Pipeline

This repository uses a 4-environment pipeline:

  ------------------------------------------------------------------------
  Branch Type                Environment              Behavior
  -------------------------- ------------------------ --------------------
  feature/\*                 build                    Lint, test, Sonar,
                                                      build image (no
                                                      push)

  develop                    dev                      Build, test, Sonar,
                                                      push image

  release/\*                 staging                  Build, test, Sonar,
                                                      push image

  Git tag on main            prod                     Build, test, Sonar,
                                                      push version tag +
                                                      latest, approval
                                                      gate
  ------------------------------------------------------------------------

  ------------------------------------------------------------------------

## Image Tagging Strategy

-   feature/build → :`<BUILD_NUMBER>`{=html}
-   develop → :`<BUILD_NUMBER>`{=html}
-   release → :`<BUILD_NUMBER>`{=html}
-   prod tag → :`<TAG>`{=html} + :latest

------------------------------------------------------------------------

# Static Analysis (SonarQube)

-   Sources: src/
-   Tests: src/\*\*/**tests**
-   Coverage: coverage/lcov.info

The Quality Gate blocks the pipeline if analysis fails.

------------------------------------------------------------------------

# Security Scanning (Docker Scout)

We scan the built frontend container image for known CVEs using Docker Scout.

From the repo root:

## Scan
```bash
docker scout quickview --local ecommerce-frontend:local
docker scout cves --local ecommerce-frontend:local
```

## Policy / Rationale

The frontend runtime image is based on the official nginx image.
Vulnerabilities reported in system packages (e.g., openssl, libxml2, curl) are inherited from the upstream base image.

We mitigate this by:
- using an appropriate official base image tag and updating it when patches are released
- keeping the runtime image minimal (static React build served by Nginx)

------------------------------------------------------------------------

# Deployment

Deployment stages are placeholders and will be implemented during the
Kubernetes phase.