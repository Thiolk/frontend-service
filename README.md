
# Ecommerce Frontend (React)

React-based web UI for the e-commerce microservices project.

This frontend supports **runtime configuration** of backend API URLs via an `env.js` file (injected when the container starts). This avoids rebuilding the image when API endpoints change.

---

# Release

- Current release: 2.1.0
- Docker Hub namespace: `thiolengkiat413/frontend`

---

# Tech Stack

- React 18
- react-scripts 5.0.1
- Jest + React Testing Library
- ESLint + Prettier
- SonarQube (static analysis)
- Docker (multi-stage build)
- Kubernetes (environment deployments)
- Docker Scout (CVE scanning)

---

# Architecture Overview

This frontend is part of a **microservices-based e-commerce system** consisting of:

- **frontend** – React UI served by Nginx (this repository)
- **product-service** – Product management API
- **order-service** – Order management API
- **database** – PostgreSQL database

The frontend communicates with backend APIs via **runtime-configured URLs** injected into `env.js` at container startup.

---

# Runtime Configuration

The frontend reads API URLs from `window.__ENV__`, which is generated when the container starts.

Environment variables:

- `FRONTEND_PORT`
- `PRODUCT_API_URL`
- `ORDER_API_URL`

Example:

```
FRONTEND_PORT=8080
PRODUCT_API_URL=http://product-dev.local
ORDER_API_URL=http://order-dev.local
```

This allows the **same container image to run in dev, staging, and production environments without rebuilding**.

---

# Local Development

## Prerequisites

- Docker + Docker Compose (recommended)
- Node.js (LTS) + npm (optional)
- npm

---

# Important: TypeScript Compatibility (Required Fix)

This project uses `react-scripts@5.0.1`, which is compatible with TypeScript `^3.2.1 || ^4`.

If TypeScript 5.x installs automatically, you may see:

- `npm ci` failing due to lockfile mismatch
- `npm ls typescript` showing `invalid`

### Fix (pin TypeScript to v4.9.5)

Run:

```
npm install -D typescript@4.9.5
rm -rf node_modules package-lock.json
npm install
```

---

# Run Development Server

```
npm start
```

Default URL:

```
http://localhost:3000
```

---

# Lint

```
npm run lint
```

---

# Format Check

```
npm run format:check
```

Auto-fix formatting:

```
npm run format
```

---

# Unit Tests (with Coverage)

```
CI=true npm test -- --watchAll=false --coverage
```

Coverage output:

```
coverage/lcov.info
```

---

# Run with Docker Compose

## 1. Create Environment File

```
cp deploy/docker/.env.example deploy/docker/.env
```

Edit values if required.

## 2. Build and Run

```
docker compose -f deploy/docker/docker-compose.yml   --env-file deploy/docker/.env up -d --build
```

Access:

```
http://localhost:8080
```

## 3. Stop

```
docker compose -f deploy/docker/docker-compose.yml   --env-file deploy/docker/.env down
```

---

# Kubernetes Deployment

The frontend is deployed to Kubernetes across **three isolated environments**:

| Environment | Namespace |
|--------------|-----------|
| Development | dev |
| Staging | staging |
| Production | prod |

Kubernetes manifests are structured using **Kustomize**:

```
k8s/frontend/
  base/
    deployment.yaml
    service.yaml
    ingress.yaml
    configmap.yaml
    kustomization.yaml
  overlays/
    dev/
    staging/
    prod/
```

## Deployment Strategy

The frontend uses a **RollingUpdate deployment strategy**.

Example configuration:

```
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

### How Rolling Updates Work

1. Kubernetes creates a **new pod with the updated container image**
2. The new pod must pass **readiness checks**
3. Traffic shifts to the new pod
4. The old pod is terminated

This ensures **zero downtime deployments**.

---

# Kubernetes Service and Ingress

The frontend service runs as a **ClusterIP service** and is exposed externally via **NGINX Ingress**.

Example hosts:

| Environment | URL |
|-------------|-----|
| dev | frontend-dev.local |
| staging | frontend-staging.local |
| prod | frontend-prod.local |

Ingress routing allows browser traffic to reach the frontend while backend services remain internal.

---

# CI/CD Pipeline

This repository uses a **multi-environment Jenkins pipeline**.

| Branch Type | Environment | Behavior |
|--------------|-------------|----------|
| feature/* | build | lint, test, sonar, build image |
| develop | dev | build, push image, deploy |
| main | staging | build, push image, deploy |
| Git tag | prod | build, push version tag + latest, approval gate |

Pipeline stages include:

1. Linting and formatting checks
2. Unit tests
3. SonarQube analysis
4. Docker image build
5. Security scanning
6. Image push to Docker Hub
7. Kubernetes deployment
8. Ingress smoke testing

---

# Image Tagging Strategy

| Environment | Tag Format |
|-------------|-----------|
| build | `<BUILD_NUMBER>` |
| dev | `dev-<BUILD_NUMBER>` |
| staging | `staging-<BUILD_NUMBER>` |
| prod | `<TAG>` + `latest` |

---

# Static Analysis (SonarQube)

- Sources: `src/`
- Tests: `src/**/__tests__`
- Coverage: `coverage/lcov.info`

The **Quality Gate blocks the pipeline if analysis fails**.

---

# Security Scanning (Docker Scout)

We scan the built frontend container image for known CVEs using Docker Scout.

From the repo root:

## Scan

```
docker scout quickview --local ecommerce-frontend:local
docker scout cves --local ecommerce-frontend:local
```

## Policy / Rationale

The frontend runtime image is based on the official nginx image.
Vulnerabilities reported in system packages (e.g., openssl, libxml2, curl) are inherited from the upstream base image.

We mitigate this by:

- using an appropriate official base image tag and updating it when patches are released
- keeping the runtime image minimal (static React build served by Nginx)

---

# Summary

The frontend service provides the **user-facing interface** for the e-commerce system.

Key design principles:

- Runtime configuration (no rebuild required for endpoint changes)
- Environment isolation via Kubernetes namespaces
- Zero-downtime deployments via RollingUpdate
- CI/CD automation via Jenkins
- Container security scanning using Docker Scout
