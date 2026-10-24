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
| `CLIENT_ORIGIN` | Yes in production | Comma-separated exact frontend origins, including scheme and no path. |

Set `VITE_API_URL` in the frontend build environment to the absolute API root ending in `/api/v1`, such as `https://api.example.com/api/v1`. This value is embedded in the built frontend and is not a secret. Production builds fail if it is absent. The Socket.IO client uses the origin from this URL.

Password reset links are delivered to the backend log in development only. In every non-development environment, the request endpoint returns HTTP 503 without looking up the account or creating a reset token. There is no mail provider dependency, integration, or mail environment variable in this repository, so no environment-only setting enables production recovery.

Recommended provider approach: use the [Resend Email API](https://resend.com/docs/api-reference/emails/send-email) through Node.js's built-in `fetch`, which fits the documented Node 22.12+ runtime and adds no package dependency. Resend requires a sending API key and a [verified domain](https://resend.com/docs/dashboard/domains/introduction); a sending-only, domain-restricted API key is supported [where configured](https://resend.com/changelog/new-api-key-permissions). The proposed backend variables are `RESEND_API_KEY` (server-side sending key) and `PASSWORD_RESET_FROM` (sender identity at the verified domain). The existing `CLIENT_ORIGIN` supplies the frontend origin for the reset link. These proposed variables are not currently read by the application; setting them alone will not enable recovery. Keep the API key in the backend secret manager, never in a `VITE_*` variable or tracked file. Restrict the provider key to sending access where supported and add the provider's displayed DNS records to a domain you control before sending.

For a safe end-to-end check after implementation, configure the key and sender only in a non-production backend environment. Create a disposable DevHub user whose mailbox you control and whose address is allowed by the provider's test setup. Request a reset, confirm the email arrives and the API response remains generic, follow the link, set a new password, and confirm replaying the same link fails. Check backend logs for internal error handling without exposing the key, token, or full reset URL. Use mocked provider acceptance, rejection, and timeout responses for automated tests; a mocked acceptance does not prove delivery. Local development currently continues to log the reset link. Before enabling production delivery, ensure a failed send cannot leave a usable reset token. The UI should not be treated as a working account recovery channel until the real test succeeds. Upload routes are not implemented; the Cloudinary and Multer dependencies are not currently used by an upload flow. Configure no upload credentials until that feature is implemented.

## URLs, cookies, CORS, and Socket.IO

Use HTTPS for both services and put them on the same site, for example `app.example.com` and `api.example.com`. Authentication uses an HttpOnly, Secure, `SameSite=Lax` cookie. A cross-site frontend/API pair on unrelated provider domains will not reliably send this cookie; use a shared custom domain or a same-origin reverse proxy.

Set frontend `VITE_API_URL` to the API origin plus `/api/v1`. Both Community and Notifications derive their Socket.IO origin from this setting. For same-origin deployments, a relative `/api/v1` value keeps both sockets on the frontend origin; configure the host to proxy `/api/v1` and `/socket.io` to the backend. For separate frontend and API origins, use the absolute API URL and allow the exact frontend origin in `CLIENT_ORIGIN`. If more than one frontend origin is required, separate exact origins with commas. The API and Socket.IO server use this allowlist and credentialed requests. Do not use `*`. The backend must be reachable for WebSocket upgrades through any proxy or load balancer.

## MongoDB and indexes

Provision a production database and a least-privilege application user. Restrict network access to the backend where the provider supports it, and back up the database before releases. Mongoose models declare unique and query indexes, and automatic index creation is disabled in production. Before release, inspect a dedicated disposable/test database with the same schema and a read-only comparison:

```sh
cd backend
# Set TEST_MONGODB_URI privately to a dedicated database named with "test" or "disposable".
npm run db:indexes:check
```

The checker requires `TEST_MONGODB_URI`, refuses database names without `test` or `disposable`, refuses production-like names and the same host/database target as `MONGODB_URI` or `MONGO_URI`, disables automatic index creation, and only calls Mongoose `diffIndexes()`. It reports indexes that would be created or dropped and never applies either operation. Review the production database's index state with the database administrator before release; the disposable database is a schema comparison, not proof of production state. If an index needs creation, use a reviewed, backed-up migration or database operation that only creates the specific missing indexes. Do not use `syncIndexes()` on production: it may drop indexes absent from the current schema. Unique indexes can fail when existing data contains duplicates.

## Local verification and production commands

From the repository root:

```sh
cd backend && npm ci
npm test
npm run test:unit
npm run test:legacy
npm run test:socket:integration # requires TEST_MONGODB_URI for a separate database whose name includes "test"
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

The repository needs a static host with SPA fallback and a persistent Node service with WebSocket support, plus managed MongoDB. Suitable arrangements include Vercel or Netlify for `fronted/dist/`, Render or Railway for `backend/`, and MongoDB Atlas for MongoDB. Use custom subdomains under one registrable domain (for example `app.example.com` and `api.example.com`) to preserve the current `SameSite=Lax` cookie behavior. The repository does not identify an existing provider, so this is a provider-neutral recommendation; no deployment has been performed.
