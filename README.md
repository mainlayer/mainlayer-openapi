# Mainlayer OpenAPI Specification

Official OpenAPI 3.1 spec and Postman collection for the [Mainlayer](https://mainlayer.fr) API — payment infrastructure for AI agents.

## Files

| File | Description |
|------|-------------|
| `openapi.yaml` | Complete OpenAPI 3.1 specification |
| `schemas/resource.yaml` | Resource schema |
| `schemas/payment.yaml` | Payment schema |
| `schemas/entitlement.yaml` | Entitlement schema |
| `schemas/error.yaml` | Error response schema |
| `postman/mainlayer.postman_collection.json` | Postman collection with tests |
| `scripts/validate.js` | Node.js validation script |

## Quick Start

### Install dependencies

```bash
npm install
```

### Validate the spec

```bash
npm run validate
```

### Preview interactive docs (Redoc)

```bash
npm run preview
```

Opens a live-reloading Redoc UI at `http://localhost:8080`.

### Lint with Redocly

```bash
npm run lint
```

### Bundle into a single file

```bash
npm run bundle        # outputs dist/openapi.bundled.yaml
npm run bundle:json   # outputs dist/openapi.bundled.json
```

## Using the Postman Collection

1. Open Postman and click **Import**.
2. Select `postman/mainlayer.postman_collection.json`.
3. Click the collection, open **Variables**, and set:
   - `baseUrl` — `https://api.mainlayer.fr` (default)
   - `apiKey` — your Mainlayer API key
4. Run **Auth / Login** first — the test script automatically saves the returned token to `apiKey` for subsequent requests.
5. Run any other request or use the **Collection Runner** to execute the full suite.

## Authentication

All endpoints except `POST /auth/register` and `POST /auth/login` require a Bearer token:

```
Authorization: Bearer ml_live_sk_...
```

Create API keys via `POST /api-keys` or the [Mainlayer dashboard](https://app.mainlayer.fr).

## Base URL

```
https://api.mainlayer.fr
```

## Endpoints at a Glance

| Tag | Endpoints |
|-----|-----------|
| auth | `POST /auth/register`, `POST /auth/login` |
| vendor | `GET /vendor` |
| resources | `POST /resources`, `GET /resources`, `GET /resources/{id}`, `PUT /resources/{id}`, `DELETE /resources/{id}` |
| payments | `POST /pay`, `GET /payments` |
| entitlements | `GET /entitlements`, `GET /entitlements/check` |
| discovery | `GET /discover` |
| analytics | `GET /analytics/revenue` |
| subscriptions | `GET /subscriptions`, `POST /subscriptions/{id}/cancel` |
| api-keys | `GET /api-keys`, `POST /api-keys`, `DELETE /api-keys/{id}` |
| invoices | `GET /invoices`, `GET /invoices/{id}` |
| coupons | `POST /coupons` |
| webhooks | `GET /webhooks`, `POST /webhooks` |

## CI

A GitHub Actions workflow at `.github/workflows/ci.yml` runs on every push and pull request that touches this directory. It:

1. Validates the spec with `@apidevtools/swagger-parser`.
2. Lints with `@redocly/cli`.
3. Bundles the spec and uploads it as an artifact.
4. Validates the Postman collection JSON structure.

## Links

- API reference: https://docs.mainlayer.fr
- Dashboard: https://app.mainlayer.fr
- Support: support@mainlayer.fr
