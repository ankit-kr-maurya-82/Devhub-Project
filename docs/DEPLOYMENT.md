# Production deployment

## Architecture

DevHub has two independently built services. `fronted/` is a Vite and React single-page application; `backend/` is an Express API with Socket.IO. MongoDB stores application data. The backend also serves the existing Pug pages and API documentation, but it does not serve the React build. Deploy the frontend as a static site and the backend as a long-running Node web service with WebSocket support.

Use Node.js 22.12 or newer for both frontend builds and the backend. This satisfies the current Vite and Mongoose runtime requirements and matches the Node 22 CI configuration.

## Environment variables

Set these in the backend service environment. Copy names and safe local defaults from `backend/.env.example`; never copy actual credentials into the repository.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes | Must be `production` on the deployed API. |
| `PORT` | Platform provided | HTTP listener port; defaults to `4000` locally. |
| `MONGODB_URI` or `MONGO_URI` | Yes | MongoDB connection string. Set one name only. |
| `JWT_SECRET` | Yes | Signing key, at least 32 characters in production. |
| `CLIENT_ORIGIN` | Yes in production | Comma-separated exact HTTPS frontend origins, with no path. |
| `RESEND_API_KEY` | Required for password recovery | Restricted, server-side Resend sending API key. |
| `PASSWORD_RESET_FROM` | Required for password recovery | Sender address at a domain verified in Resend. |

Set `VITE_API_URL` in the frontend build environment to either the absolute HTTPS API root ending in `/api/v1`, such as `https://api.example.com/api/v1`, or `/api/v1` when the frontend host proxies both `/api/v1` and `/socket.io` to the backend. This value is embedded in the built frontend and is not a secret. Production builds fail if it is absent or uses an insecure absolute HTTP URL. The Socket.IO client uses the API origin for an absolute URL and the frontend origin for `/api/v1`.

Password reset email uses Node.js's built-in `fetch` to call the [Resend Email API](https://resend.com/docs/api-reference/emails/send-email); no additional package is required. Configure `RESEND_API_KEY` and `PASSWORD_RESET_FROM` on the backend only, and configure `CLIENT_ORIGIN` with the exact frontend origin used to build the reset link. The API key must have sending-only permissions where available. Create it in Resend's dashboard, verify a domain you control using the DNS records Resend provides, and use a sender address at that verified domain. Store the key in the backend platform's secret manager; never put it in source control, a frontend variable, a build argument, or a `VITE_*` setting.

The service validates the key shape, sender address, and exact frontend origin before looking up an account. Missing or invalid configuration leaves password recovery unavailable and returns HTTP 503 without creating a reset token. Provider rejection, HTTP errors, timeouts, and network failures are handled without logging credentials, reset tokens, or reset URLs. Failed delivery clears only the matching pending token; pending tokens have no expiry and remain unusable even if cleanup itself fails. On success, the token is activated for one hour only after Resend accepts the request. The API response is account-agnostic and does not claim a delivery occurred.

For a controlled real-delivery verification, configure credentials only in a non-production backend environment, then use a dedicated disposable DevHub account and a recipient mailbox you control that is eligible under the provider's account setup. Request the reset, verify that the email arrives and its link works once, then verify expiry/replay behavior and inspect backend logs for sensitive-data absence. After recording sanitized results, remove the temporary account, mailbox, and test data using the environment's approved cleanup process. Automated tests mock provider responses and prove request construction and failure handling only; they do not prove provider acceptance by a real account, mailbox delivery, or production readiness. Recovery must remain a release blocker until this controlled verification succeeds. Upload routes are not implemented; the Cloudinary and Multer dependencies are not currently used by an upload flow. Configure no upload credentials until that feature is implemented.

## URLs, cookies, CORS, and Socket.IO

Use HTTPS for both services and put them on the same site, for example `app.example.com` and `api.example.com`. Authentication uses an HttpOnly, Secure, `SameSite=Lax` cookie. A cross-site frontend/API pair on unrelated provider domains will not reliably send this cookie; use a shared custom domain or a same-origin reverse proxy.

Set frontend `VITE_API_URL` to the API origin plus `/api/v1`. Both Community and Notifications derive their Socket.IO origin from this setting. For same-origin deployments, a relative `/api/v1` value keeps both sockets on the frontend origin; configure the host to proxy `/api/v1` and `/socket.io` to the backend. For separate frontend and API origins, use the absolute API URL and allow the exact frontend origin in `CLIENT_ORIGIN`. If more than one frontend origin is required, separate exact origins with commas. The API and Socket.IO server use this allowlist and credentialed requests. Do not use `*`. The backend must be reachable for WebSocket upgrades through any proxy or load balancer.

Authentication and password-reset rate limits currently use the process-local in-memory store and Express's default client IP. Behind a reverse proxy, verify that the platform preserves the correct client IP; do not enable broad proxy trust without restricting it to the known proxy hops or ranges. Multiple backend instances do not share counters, so configure a shared rate-limit store before relying on these limits across a scaled deployment. Socket.IO delivery and online presence are also process-local: the current server has no shared Socket.IO adapter, and presence uses an in-memory map. Start with one backend instance. Before running multiple instances, add and verify shared Socket.IO broadcasting and presence, a shared rate-limit store, and any session affinity required by the chosen transport and load balancer; otherwise cross-instance chat, notifications, presence, or rate limits may not behave consistently.

## MongoDB and indexes

Provision a production database and a least-privilege application user. Restrict network access to the backend where the provider supports it, and back up the database before releases. Mongoose models declare unique and query indexes, and automatic index creation is disabled in production. Before release, inspect a dedicated disposable/test database with the same schema and a read-only comparison:

```sh
cd backend
# Set TEST_MONGODB_URI privately, then set TEST_MONGODB_ISOLATED=true only after verifying
# the MongoDB instance is dedicated and the credentials cannot access application/production data.
npm run db:indexes:check
```

The checker requires both `TEST_MONGODB_URI` and the explicit `TEST_MONGODB_ISOLATED=true` acknowledgement. A test-like database name is only a secondary guard: independently verify the host/cluster and use credentials scoped to the dedicated disposable database. The checker also refuses production-like names and the same host/database target as `MONGODB_URI` or `MONGO_URI`, disables automatic index creation, and only calls Mongoose `diffIndexes()`. It reports indexes that would be created or dropped and never applies either operation. Review the production database's index state with the database administrator before release; the disposable database is a schema comparison, not proof of production state. If an index needs creation, use a reviewed, backed-up migration or database operation that only creates the specific missing indexes. Do not use `syncIndexes()` on production: it may drop indexes absent from the current schema. Unique indexes can fail when existing data contains duplicates.

## Local verification and production commands

From the repository root:

```sh
cd backend && npm ci
npm test
npm run test:unit
npm run test:legacy
npm run test:socket:integration # requires a verified isolated TEST_MONGODB_URI and TEST_MONGODB_ISOLATED=true
cd ../fronted && npm ci
npm run lint
VITE_API_URL=https://api.example.com/api/v1 npm run build
```

The frontend build is written to `fronted/dist/`; configure the static host to publish that directory and route unknown application paths to `index.html`. Start the API from `backend/` with `npm start`. The server binds to `0.0.0.0:$PORT` and waits for MongoDB before opening its listener. Configure `GET /healthz` as a readiness check: it returns HTTP 200 with `{ "status": "ok" }` only while Mongoose is connected, and HTTP 503 with `{ "status": "unavailable" }` otherwise. If the host requires a liveness probe that must stay healthy during database outages, configure a separate process-only probe.

CI runs backend API, unit/configuration, and legacy security tests plus frontend lint and production build. These checks use mocked persistence and no production credentials. The Socket.IO integration test requires a separately provisioned test MongoDB and is therefore skipped in ordinary CI; it must not point at production data.

## Smoke test after release

1. Confirm the backend deployment reports healthy at `/healthz`.
2. Load the frontend over HTTPS and verify its API requests target the configured API host.
3. Register or sign in with a designated test account; verify the browser stores an HttpOnly, Secure auth cookie and `/api/v1/auth/me` succeeds.
4. Verify an origin outside `CLIENT_ORIGIN` is rejected and the configured frontend origin receives credentialed CORS headers.
5. Open Community, join a test room in two sessions, send a message, and confirm both delivery and persisted history.
6. Confirm Notifications update and an administrator can load the Admin Dashboard with an admin account.
7. Review backend logs for startup, database, and Socket.IO errors without logging credentials or tokens.

## Rollback and troubleshooting

Keep the previous frontend artifact and backend release available. If a release fails smoke checks, restore the previous frontend artifact and roll the API back to the prior compatible release. Avoid schema or index changes that cannot be reversed until the rollback window closes.

- Startup rejects configuration: check that `NODE_ENV`, MongoDB URI, `JWT_SECRET`, and exact production `CLIENT_ORIGIN` are set. Error messages name missing settings but never print values.
- Database startup fails: check the URI, database user permissions, network allowlist, and provider availability.
- Sign-in works but later API calls are unauthenticated: confirm HTTPS, same-site frontend/API domains, `credentials: include`, and browser cookie policy.
- Browser reports CORS errors: compare the browser's exact frontend origin with `CLIENT_ORIGIN`; include scheme and port, omit paths.
- Community does not connect: check `VITE_API_URL`, WebSocket proxy support, `CLIENT_ORIGIN`, and that both releases use compatible code.
- Frontend deep links return 404: enable static-host SPA fallback to `index.html`.
- MongoDB index creation fails: inspect existing duplicates and resolve them through a reviewed data migration before creating the unique index.

## Hosting options

The repository has no root `package.json` or deployment manifest. Build and start each app from its own directory using the scripts above: publish `fronted/dist/` as a static single-page app with an `index.html` fallback, and run `npm start` from `backend/` as a persistent Node.js service. The backend serves the API and Socket.IO on the same HTTP server; it does not serve the React build. Do not deploy this backend as a serverless request handler unless a separately supported persistent Socket.IO service and compatible routing are provided.

| Topology | Fit and trade-offs |
| --- | --- |
| Separate static frontend, persistent Node service, and managed MongoDB | Recommended initial topology. It uses the existing frontend build and backend start command and allows each service to be operated independently. Configure exact frontend origins, credentialed CORS, cookie-compatible custom domains, and `/socket.io` WebSocket proxying. Candidate services already considered for this pattern include Vercel or Netlify for static files, Render or Railway for the Node service, and MongoDB Atlas for the database; confirm the selected plan's current runtime, WebSocket, custom-domain, health-check, backup, and network-access capabilities before choosing. |
| One VM/container or platform service with a reverse proxy plus managed MongoDB | Can keep the frontend and API same-origin and simplify browser CORS/cookie behavior, but requires operating a TLS-terminating proxy that serves the static build with SPA fallback and forwards `/api/v1` and `/socket.io` (including WebSocket upgrades) to the Node process. The repository does not include a container or proxy configuration. |
| Serverless API plus static frontend | Not a fit for the current combined Express/Socket.IO server and process-local presence/rate-limit state. Consider only after designing and verifying a separate realtime service and revisiting these process-local assumptions. |

Use a managed MongoDB deployment for routine operations support, with database-scoped least-privilege credentials, network restrictions to the backend where available, and verified backups/restore procedures. A self-managed database avoids a managed-service dependency but transfers patching, availability, access control, backup, and recovery operations to the team. The application requires a reachable MongoDB URI and exits startup readiness until its initial connection succeeds.

These are architecture-based candidates, not provider certifications. Current provider pricing, free-tier availability, and plan-specific features have not been verified; confirm them directly with the selected providers. Do not assume a hosting plan supports persistent WebSockets, graceful process termination, or the required health checks based only on its product name. Use custom subdomains under one registrable domain (for example `app.example.com` and `api.example.com`) to preserve the current `SameSite=Lax` cookie behavior. No provider has been selected and no deployment has been performed.
