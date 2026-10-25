# Production deployment

## Architecture

DevHub has two independently built services. `fronted/` is a Vite and React single-page application; `backend/` is an Express API with Socket.IO. MongoDB stores application data. The backend also serves the existing Pug pages and API documentation, but it does not serve the React build. For the selected staging topology, deploy `fronted/` from the Vercel project root as a static site and `backend/` from the Render service root as a long-running Node web service with WebSocket support. The browser sends API and Socket.IO traffic directly to the Render backend hostname.

Use Node.js 22.13+ within the 22.x line, or 24.x for both frontend builds and the backend. The lockfiles resolve Vite 8.3.5, which requires `^20.19.0 || >=22.12.0`, and Mongoose 9.11.4, which requires `>=20.19.0`; both documented choices satisfy those engines. CI selects the Node 22 major line. Pin a compatible Node major in each hosting project rather than relying on a provider's changing default.

## Environment variables

Configure each variable in the environment identified below. Backend runtime variables belong in the Render service environment; `VITE_API_URL` belongs in the Vercel build environment. Copy variable names and safe local defaults from the example files; never copy actual credentials into the repository.

| Variable | Required in staging | Secret? | Purpose | Application validation |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | Yes | No | Run the API in production mode, including Secure auth cookies and production origin rules. | Must be `development`, `test`, or `production`; staging should use `production`. |
| `PORT` | Platform provided | No | HTTP listener port; defaults to `4000` locally. | Must be a decimal integer from 1 to 65535. |
| `MONGODB_URI` or `MONGO_URI` | Yes | Yes | MongoDB connection string. Set one name only; it contains credentials. | URI shape is checked at startup, then a real connection must succeed before listening. Conflicting values are rejected. |
| `JWT_SECRET` | Yes | Yes | Signs authentication tokens. | Required; in production it must be non-placeholder and at least 32 characters. |
| `CLIENT_ORIGIN` | Yes | No | Comma-separated exact browser frontend origins, without paths. | Production requires at least one explicit HTTPS origin; wildcard, credentials, paths, and non-HTTPS origins are rejected. |
| `RESEND_API_KEY` | Required to test password recovery | Yes | Restricted, server-side Resend sending API key. | The reset flow checks the key format; this does not validate it with Resend. Missing/invalid configuration fails closed with HTTP 503 for reset requests. |
| `PASSWORD_RESET_FROM` | Required to test password recovery | No | Sender address at a domain verified in Resend. | Sender syntax is checked; domain verification and provider acceptance are not checked by the application. |
| `VITE_API_URL` | Yes for a production frontend build | No; public build-time value | For the selected Vercel + Render topology, the absolute HTTPS Render API root ending in `/api/v1`, for example `https://api-staging.example.com/api/v1`. | Production build checks the URL format. It also accepts `/api/v1` for a same-origin proxy, but no such proxy is configured or included in this topology. |

The following variables are for isolated tests or local test tooling only. Do not configure them as Vercel or Render runtime variables: `TEST_MONGODB_URI` and `TEST_MONGODB_ISOLATED` (index checks and isolated database tests); `DEVHUB_E2E`, `DEVHUB_E2E_CONFIRM_ISOLATED_DISPOSABLE_DB`, `E2E_BASE_URL`, `E2E_API_URL`, `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_PROBLEM_SLUG`, and `CHROME_BIN` (opt-in browser tests); `JWT_TOKEN` and `SOCKET_TEST_ROOM_ID` (manual Socket.IO test). E2E account credentials belong only in a private, disposable test-runner environment. `TEST_MONGODB_URI` is a test database credential, not the staging application's `MONGODB_URI`.

### Staging configuration checklist

Use this initial topology: one static frontend deployment, one persistent Node.js backend instance, and one managed MongoDB database dedicated to staging. The backend and frontend have separate environments; only `VITE_API_URL` is embedded in the public frontend bundle. Never expose MongoDB credentials, `JWT_SECRET`, `RESEND_API_KEY`, or other backend secrets through a `VITE_*` variable, frontend build argument, or static-host setting.

1. **Public frontend configuration**
   - Set the Vercel project root to `fronted/`. Set `VITE_API_URL` in its build environment to the absolute HTTPS Render API origin plus `/api/v1`, for example `https://api-staging.example.com/api/v1`.
   - Install with `npm ci`, build with `npm run build`, and publish `dist/`. The Vercel rewrite in `fronted/vercel.json` sends application routes to `index.html`; it excludes `/api` and `/socket.io` and does not proxy either path.
   - The browser sends API calls and Socket.IO connections directly to the Render backend hostname. The Vite proxy in `fronted/vite.config.js` is for local development only.
   - The built frontend contains no database, JWT, or email-provider credentials.
2. **Backend-only secrets and configuration**
   - Set `NODE_ENV=production`, the platform-provided `PORT`, `JWT_SECRET`, and `CLIENT_ORIGIN` on the backend service.
   - Configure `MONGODB_URI` (or its supported alias `MONGO_URI`) only on the backend. Store it and `JWT_SECRET` in the host's secret manager.
   - To exercise password recovery, also configure `RESEND_API_KEY` and `PASSWORD_RESET_FROM` on the backend. No email provider or mailbox has been contacted or verified as part of local preparation. Without valid values, password reset remains unavailable and fails closed.
3. **MongoDB database and access controls**
   - Provision a separate staging database and database-scoped least-privilege user; restrict network access to the backend where supported and enable provider backups.
   - Do not reuse production credentials or copy production data. Verify the selected host/cluster and user scope independently before any database test.
   - Production disables Mongoose automatic index creation. Review required indexes before controlled staging tests; the index checker is read-only and requires an independently verified disposable target. It was not run as part of this preparation.
4. **Password-reset email**
   - Use a sender domain verified with the email provider and a restricted sending-only key where available. Set `CLIENT_ORIGIN` to the exact HTTPS frontend origin so reset links point to staging.
   - The application validates configuration shape but cannot establish provider acceptance, domain verification, inbox delivery, or reset-link usability without a controlled live test.
5. **Hosting, health, and operations**
   - Use HTTPS on both services and custom subdomains under the same registrable domain (for example, `app.example.com` and `api.example.com`). The auth cookie is HttpOnly, Secure in production, and `SameSite=Lax`; unrelated frontend/API sites must not be assumed to share it.
   - Set `CLIENT_ORIGIN` to the exact frontend origin, including scheme and port if applicable, with no path. Credentialed CORS uses this allowlist; do not use `*`.
   - Keep one backend instance. Socket.IO presence/delivery and API rate-limit state are process-local and have not been verified for multi-instance operation.
   - Configure `GET /healthz` as a readiness check. It returns 200 only while Mongoose reports a connected database, and 503 otherwise. Startup waits for the initial MongoDB connection. This endpoint does not verify email delivery, Socket.IO reachability, or index correctness.
   - Set the Render service root to `backend/`, install with `npm ci`, and start with `npm start`. The Socket.IO client connects directly to the Render backend hostname at `/socket.io` with credentials. Confirm the selected Render service supports persistent WebSockets and Socket.IO polling; Vercel is not acting as a proxy in this topology.
   - The server logs startup and generic database connection status, handles `SIGINT`/`SIGTERM` by closing Socket.IO/HTTP and disconnecting Mongoose, and has a 10-second shutdown timeout. Verify the selected host allows sufficient graceful-shutdown time and review logs for errors without logging credentials or reset tokens.

### Staging smoke tests (manual, after deployment)

Use only dedicated staging accounts and the staging-only database. Do not use production accounts or user data.

1. Load the frontend over HTTPS, verify SPA deep links, and confirm API requests use the configured staging API.
2. Request `GET /healthz`; confirm it returns the connected-database readiness status. Confirm an unavailable database produces 503 only in an approved isolated staging exercise.
3. Register and log in with a dedicated test account. Confirm the auth cookie is HttpOnly, Secure, and `SameSite=Lax`; refresh the page and verify session restoration; log out and confirm protected access is denied.
4. Request password reset for a staging account and confirm the API response does not reveal whether an account exists. Confirm the configured provider accepts the request, receive the message in a controlled mailbox, and verify the link succeeds once, rejects replay, and expires. Inspect logs for absence of tokens, reset URLs, and credentials. Do not call this passed based only on mocked tests.
5. With two authorized test users, join a staging room and exchange messages. On all connected devices for one user, leave the room and confirm that user receives no subsequent room broadcasts, while the remaining member can continue using the room.
6. Verify leaving one room does not disrupt unrelated room subscriptions. Confirm unauthorized HTTP and Socket.IO room operations are rejected.
7. Confirm exact-origin restrictions and authentication/password-reset rate limits remain active. Do not broaden trusted proxy settings merely to change client-IP behavior.
8. Restart the backend using the host's normal restart flow, refresh the frontend, and verify expected authentication behavior and service recovery.

Record sanitized outcomes only. Local tests and mocked provider responses are not evidence of deployed behavior; do not report a smoke test as passed unless it was actually run against this isolated staging environment.

For the selected Vercel + Render topology, set `VITE_API_URL` to the absolute HTTPS Render API root ending in `/api/v1`, such as `https://api-staging.example.com/api/v1`. This public value is embedded in the frontend build. The API client uses that absolute base URL, and the Socket.IO client derives the Render origin from it and connects at `/socket.io`. Vercel's SPA rewrite is not an API or Socket.IO proxy. A relative `/api/v1` value would require a separately configured same-origin reverse proxy that forwards both `/api/v1` and `/socket.io`; that is an unimplemented alternative, and the Vite proxy applies only to local development.

Password reset email uses Node.js's built-in `fetch` to call the [Resend Email API](https://resend.com/docs/api-reference/emails/send-email); no additional package is required. Configure `RESEND_API_KEY` and `PASSWORD_RESET_FROM` on the backend only, and configure `CLIENT_ORIGIN` with the exact frontend origin used to build the reset link. The API key must have sending-only permissions where available. Create it in Resend's dashboard, verify a domain you control using the DNS records Resend provides, and use a sender address at that verified domain. Store the key in the backend platform's secret manager; never put it in source control, a frontend variable, a build argument, or a `VITE_*` setting.

The service validates the key shape, sender address, and exact frontend origin before looking up an account. Missing or invalid configuration leaves password recovery unavailable and returns HTTP 503 without creating a reset token. Provider rejection, HTTP errors, timeouts, and network failures are handled without logging credentials, reset tokens, or reset URLs. Failed delivery clears only the matching pending token; pending tokens have no expiry and remain unusable even if cleanup itself fails. On success, the token is activated for one hour only after Resend accepts the request. The API response is account-agnostic and does not claim a delivery occurred.

For a controlled real-delivery verification, configure credentials only in a non-production backend environment, then use a dedicated disposable DevHub account and a recipient mailbox you control that is eligible under the provider's account setup. Request the reset, verify that the email arrives and its link works once, then verify expiry/replay behavior and inspect backend logs for sensitive-data absence. After recording sanitized results, remove the temporary account, mailbox, and test data using the environment's approved cleanup process. Automated tests mock provider responses and prove request construction and failure handling only; they do not prove provider acceptance by a real account, mailbox delivery, or production readiness. Recovery must remain a release blocker until this controlled verification succeeds. Upload routes are not implemented; the Cloudinary and Multer dependencies are not currently used by an upload flow. Configure no upload credentials until that feature is implemented.

## URLs, cookies, CORS, and Socket.IO

Use HTTPS for both services and put them on the same site, for example `app-staging.example.com` and `api-staging.example.com`. Authentication uses an HttpOnly, Secure, `SameSite=Lax` cookie. A cross-site frontend/API pair on unrelated provider domains will not reliably send this cookie. The selected Vercel + Render topology relies on same-site custom subdomains; it does not use a same-origin reverse proxy.

Set frontend `VITE_API_URL` to the absolute Render API origin plus `/api/v1`. Both Community and Notifications derive their Socket.IO origin from this setting, so API and Socket.IO traffic goes directly to the backend hostname. Set `CLIENT_ORIGIN` to the exact Vercel frontend origin. If more than one frontend origin is required, separate exact origins with commas. The API and Socket.IO server use this allowlist and credentialed requests. Do not use `*`. Vercel's SPA rewrite does not forward backend traffic. A same-origin proxy with relative `/api/v1` would be a separate, unimplemented deployment alternative; the Vite development proxy is not part of a Vercel production build.

Authentication and password-reset rate limits currently use the process-local in-memory store and Express's default client IP. Behind a reverse proxy, verify that the platform preserves the correct client IP; do not enable broad proxy trust without restricting it to the known proxy hops or ranges. Multiple backend instances do not share counters, so configure a shared rate-limit store before relying on these limits across a scaled deployment. Socket.IO delivery and online presence are also process-local: the current server has no shared Socket.IO adapter, and presence uses an in-memory map. Start with one backend instance. Before running multiple instances, add and verify shared Socket.IO broadcasting and presence, a shared rate-limit store, and any session affinity required by the chosen transport and load balancer; otherwise cross-instance chat, notifications, presence, or rate limits may not behave consistently.

## MongoDB and indexes

Provision a database dedicated to staging, separate from production, and a least-privilege application user scoped to that database. Restrict network access to the backend where the provider supports it, and confirm a staging backup and restore path before test data is added. Mongoose models declare unique and query indexes, and automatic index creation is disabled in production. Before release, inspect a dedicated disposable/test database with the same schema and a read-only comparison:

```sh
cd backend
# Set TEST_MONGODB_URI privately, then set TEST_MONGODB_ISOLATED=true only after verifying
# the MongoDB instance is dedicated and the credentials cannot access application/production data.
npm run db:indexes:check
```

The checker requires both `TEST_MONGODB_URI` and the explicit `TEST_MONGODB_ISOLATED=true` acknowledgement. Before any connection, identify the staging project, cluster, database name, and database user in the Atlas console; verify that the Render secret is intended for that same staging target and that the user is scoped to the staging database. If a local target check is needed, parse the URI privately and display only the host and database name; do not echo, log, or paste the URI. The checker parses the test URI internally, prints only its database name, and refuses production-like names and a target matching the configured application URI by host, port, and database name. A test-like name is only a secondary guard: independently verify the host/cluster and use credentials scoped to the dedicated disposable database. The checker disables automatic index creation and only calls Mongoose `diffIndexes()`. It reports indexes that would be created or dropped and never applies either operation. It intentionally refuses a matching application target, so it does not initialize or verify the staging application's indexes.

### Reviewed staging index initialization

The production-mode backend used for staging disables Mongoose automatic index creation. After the database and collections are provisioned, but before feature smoke tests:

1. Take or verify a restorable staging snapshot. Use only staging data and credentials; never copy production data into staging.
2. Run `db:indexes:check` only against a separately verified disposable database with the same checked-out schema. Save the reported comparison as review input; it is not a check of the staging database.
3. Have a reviewer compare the staging collections' existing indexes with the model declarations in `backend/src/models/`. Inspect indexes read-only first. Do not run `syncIndexes()` or apply every reported difference blindly.
4. Before proposing a unique index, run read-only aggregation checks in the staging database: group `User` documents by `username` and by `email`, `Blog` and `CodingProblem` documents by `slug`, and `Vote` documents by the compound key `(user, targetType, targetId)`; filter for groups with a count greater than one. Check null/missing values and normalization/case behavior against the model declarations too. Resolve conflicts only through a separately reviewed staging data change, before index creation.
5. Prepare and review a one-time staging-only migration that creates only specifically approved missing indexes with their declared keys and options. It must not drop or alter existing indexes. Use an operator identity scoped to the staging database with only the index and read privileges needed; keep it separate from the application secret where possible.
6. Apply that migration only after approval, then inspect the resulting indexes read-only and run focused staging smoke tests. Record the migration and rollback considerations. Do not execute this procedure from the app startup command.

No index migration is currently provided by the repository, and this procedure was not run. Do not use `syncIndexes()` on production: it may drop indexes absent from the current schema. Unique indexes can fail when existing data contains duplicates.

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
- Community does not connect: check `VITE_API_URL`, direct WebSocket and polling reachability at the Render backend, `CLIENT_ORIGIN`, and that both releases use compatible code.
- Frontend deep links return 404: enable static-host SPA fallback to `index.html`.
- MongoDB index creation fails: inspect existing duplicates and resolve them through a reviewed data migration before creating the unique index.

## Hosting options

The repository has no root `package.json` or deployment manifest. Build and start each app from its own directory using the scripts above: publish `fronted/dist/` as a static single-page app with an `index.html` fallback, and run `npm start` from `backend/` as a persistent Node.js service. The backend serves the API and Socket.IO on the same HTTP server; it does not serve the React build. Do not deploy this backend as a serverless request handler unless a separately supported persistent Socket.IO service and compatible routing are provided.

| Topology | Fit and trade-offs |
| --- | --- |
| Vercel static frontend, Render persistent Node service, and MongoDB Atlas | Selected staging topology. Set Vercel's root to `fronted/` and Render's root to `backend/`. Configure the absolute Render API URL in `VITE_API_URL`, exact Vercel origin in `CLIENT_ORIGIN`, cookie-compatible HTTPS custom subdomains, and direct `/socket.io` access to Render. Vercel's rewrite only provides the SPA fallback; it does not proxy API or Socket.IO traffic. Confirm the selected plans' current runtime, WebSocket, custom-domain, health-check, backup, and network-access capabilities before setup. |
| One VM/container or platform service with a reverse proxy plus managed MongoDB | Unimplemented alternative. It can keep the frontend and API same-origin, but requires a separately configured TLS-terminating proxy that serves the static build with SPA fallback and forwards `/api/v1` and `/socket.io` (including WebSocket upgrades) to the Node process. The repository does not include a container or proxy configuration. |
| Serverless API plus static frontend | Not a fit for the current combined Express/Socket.IO server and process-local presence/rate-limit state. Consider only after designing and verifying a separate realtime service and revisiting these process-local assumptions. |

Use a managed MongoDB deployment for routine operations support, with database-scoped least-privilege credentials, network restrictions to the backend where available, and verified backups/restore procedures. A self-managed database avoids a managed-service dependency but transfers patching, availability, access control, backup, and recovery operations to the team. The application requires a reachable MongoDB URI and exits startup readiness until its initial connection succeeds.

Vercel, Render, and MongoDB Atlas are the selected staging providers, but deployment has not been performed. Before selecting plans, the operator must confirm persistent Node Web Service support; Socket.IO polling and WebSocket upgrades; HTTPS custom domains; environment-variable and secret management; `/healthz` checks that treat HTTP 503 as unhealthy; Render-to-Atlas network access; and a one-instance setting for the initial backend. Current provider pricing, free-tier availability, and these plan-specific capabilities have not been verified. Do not assume a hosting plan supports them based only on its product name. Use custom subdomains under one registrable domain (for example `app-staging.example.com` and `api-staging.example.com`) to preserve the current `SameSite=Lax` cookie behavior.
