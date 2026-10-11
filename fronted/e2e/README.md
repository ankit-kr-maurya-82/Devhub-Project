# DevHub browser E2E suite

The suite uses Playwright with system Google Chrome. It has no `webServer` hook and never starts a frontend, backend, or database listener. Point it at an already-running isolated deployment. The suite is opt-in and refuses targets outside loopback/`.localhost` and the reserved `.test` host suffix. Browser page requests are restricted to the configured frontend and API origins.

## Required environment

Set these values only in a private shell environment or a permission-restricted environment file outside the repository. Do not put credentials in this README, source files, command arguments saved in shell history, or Git. Use dedicated accounts with unique test-only passwords.

| Variable | Value |
| --- | --- |
| `DEVHUB_E2E` | `1` to enable the suite; omit/unset to leave all workflows skipped. |
| `DEVHUB_E2E_CONFIRM_ISOLATED_DISPOSABLE_DB` | Must equal `YES`. Set it only after confirming the backend is connected to a disposable test database. |
| `E2E_BASE_URL` | Frontend origin, such as `http://127.0.0.1:5173` or `https://devhub.frontend.test`. Must have no path, query, fragment, or URL credentials. |
| `E2E_API_URL` | Backend API origin, such as `http://127.0.0.1:4000` or `https://devhub.api.test`. Must have no path, query, fragment, or URL credentials. |
| `E2E_USER_EMAIL`, `E2E_USER_PASSWORD` | Active, dedicated ordinary account. |
| `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` | Active, separate dedicated administrator account. Its email must differ from the ordinary account. |
| `E2E_PROBLEM_SLUG` | Slug of an already-published test problem. |
| `CHROME_BIN` | Optional override for the Chrome executable; defaults to `/usr/bin/google-chrome`. |

The frontend must already be configured to call this same test API. For a local Vite frontend, set `VITE_API_URL` to the test API origin in the frontend process (the checked-in Vite proxy targets `http://localhost:4000` when that variable is omitted). For a dedicated deployment, configure its build or same-origin API proxy to the test backend. The runner blocks browser requests to any other origin, but that cannot identify a backend hidden behind a reverse proxy; inspect the deployment's proxy and backend database configuration yourself.

The hostname allowlist is only a guardrail; it does not prove which database a backend uses. Before enabling the suite, verify the backend's effective `MONGODB_URI`/`MONGO_URI` points to a disposable database reserved for E2E, and that it contains only dedicated test accounts and fixtures. Do not load a production `.env`, reuse production credentials, or enable E2E against a development database with valuable/shared data. The backend requires `MONGODB_URI` or `MONGO_URI` and `JWT_SECRET`; production-mode deployments also require explicit `CLIENT_ORIGIN`. Keep these settings in the private deployment environment and never print them.

## Disposable test database setup and provisioning

Before running the suite, an isolated MongoDB instance, a backend process, and a frontend process must be running.

### 1. Prerequisites
- **MongoDB**: A running MongoDB instance on `127.0.0.1:27017` (e.g. `docker run -d --rm --name devhub-e2e-mongo -p 127.0.0.1:27017:27017 mongo:7` or local service).
- **Dedicated Database**: Target database name MUST contain `test` or `disposable` (e.g. `mongodb://127.0.0.1:27017/devhub_e2e_disposable`).
- **Browser Binary**: System Google Chrome (`/usr/bin/google-chrome`) or set `CHROME_BIN` to an installed Chromium-compatible executable.

### 2. Configure private test environment
Create a private env file outside the repository (for example under `~/.config/devhub-e2e.env`) and restrict permissions (`chmod 600 ~/.config/devhub-e2e.env`):

```sh
export DEVHUB_E2E=1
export DEVHUB_E2E_CONFIRM_ISOLATED_DISPOSABLE_DB=YES
export TEST_MONGODB_URI=mongodb://127.0.0.1:27017/devhub_e2e_disposable
export MONGODB_URI=mongodb://127.0.0.1:27017/devhub_e2e_disposable
export JWT_SECRET=disposable_test_jwt_secret_at_least_32_characters_long
export E2E_BASE_URL=http://127.0.0.1:5173
export E2E_API_URL=http://127.0.0.1:4000
export E2E_USER_EMAIL=test-user@devhub.test
export E2E_USER_PASSWORD=test-password-1234
export E2E_ADMIN_EMAIL=test-admin@devhub.test
export E2E_ADMIN_PASSWORD=admin-password-1234
export E2E_PROBLEM_SLUG=two-sum-fixture
```

### 3. Seed test fixtures
From `backend/`, source the environment file and run the automated seeder:

```sh
set -a
. "$HOME/.config/devhub-e2e.env"
set +a
npm run seed:e2e
```

The script verifies that `TEST_MONGODB_URI` points to a loopback host with a database name containing `test` or `disposable`, upserts dedicated ordinary and admin test accounts with properly hashed passwords, and provisions a published coding challenge fixture.

To clean up seeded fixtures without dropping the database: `node scripts/seed-e2e.js --clean`
To completely drop the disposable database: `node scripts/seed-e2e.js --teardown`

### 4. Start backend and frontend test processes
In separate terminal sessions:

```sh
# Terminal 1 - Backend (port 4000)
set -a && . "$HOME/.config/devhub-e2e.env" && set +a
npm start

# Terminal 2 - Frontend (port 5173)
set -a && . "$HOME/.config/devhub-e2e.env" && set +a
npm run dev
```

### 5. Run the E2E suite
From `fronted/`:

```sh
set -a
. "$HOME/.config/devhub-e2e.env"
set +a
npm run test:e2e
```

Do not run this command until the values and disposable database have been checked. Without `DEVHUB_E2E=1`, the suite reports all workflows skipped and performs no browser or API requests. When enabled, configuration fails closed if any required value is missing, the accounts are not distinct, the problem slug is malformed, the confirmation is absent, or either origin is outside the test-host rules.

## Test data and cleanup

- The question test captures the ID returned by its own create request, captures its comment ID, removes that comment as its author, and deletes only that question. A second dedicated account votes because the application forbids authors from voting on their own questions. The test toggles that vote off before deleting the question. The generated vote notification may remain until the disposable database is discarded.
- Blog and coding-problem cleanup runs only after the corresponding create request succeeded, and targets the generated slug for that run. Blog cleanup reauthenticates as its dedicated author. The admin test attempts every cleanup action even if one fails and fails visibly if it cannot restore the ordinary account's active status.
- The application has no deletion API for submissions, reports, moderation audit actions, or vote notifications. Coding submission and report workflows create these rows; admin actions also write audit rows. Preserve the test result if diagnosing a failure, then discard/recreate the disposable E2E database after the run. Do not point the suite at any database whose contents must be retained.
- Registration is validation-only; the suite uses pre-provisioned accounts so it does not create accounts that it cannot safely remove.

The current UI supports question creation, voting, and comment create/edit/delete; it does not expose question edit/delete controls. The submission API stores code but reports that no judge is configured, so the suite checks “Not executed” and does not claim a verdict.
