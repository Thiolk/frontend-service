# Ecommerce Frontend (React)

React-based web UI for the e-commerce microservices project.

---

## Prerequisites
- Docker (recommended)
- Node.js (LTS) + npm (optional for local dev)

---

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