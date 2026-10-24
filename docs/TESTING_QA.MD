# Testing and Quality Assurance

## Goals
Catch regressions, verify security boundaries, and ensure documentation matches real behavior.

## Test layers
- Unit: pure utilities, validators, services, controller behavior.
- Integration: API routes, database operations, authentication, ownership checks.
- Frontend: components, forms, routing, loading/error states, accessibility.
- End-to-end: critical user journeys in a controlled test environment.
- Security: input abuse, privilege escalation, session lifecycle, rate limits, XSS/injection risks.
- Operational: startup configuration, health checks, shutdown, logging, deployment configuration.

## High-value scenarios
- Valid and invalid registration/login.
- Duplicate unique identifiers.
- Unauthenticated access to protected routes.
- Authenticated user attempting to modify another user's resource.
- Invalid, oversized, and unexpected request fields.
- Pagination boundaries and deterministic ordering.
- Empty result, not-found, conflict, and server-error states.
- Session expiry/logout and password recovery token expiry/replay, if implemented.
- Database or external-provider failure.
- Repeated submissions and safe retry behavior.

## Commands
Use only scripts present in the relevant package:
```bash
npm test
npm run lint
npm run build
```
Record the exact directory and command for each result.

## Test data
- Use isolated test databases and synthetic accounts.
- Do not use production credentials or real user records.
- Clean up test-created resources safely.
- Avoid tests that depend on unstable external services unless explicitly designed as integration tests.

## QA report template
| Check | Result | Evidence / notes |
|---|---|---|
| Unit tests | Not run | |
| Integration tests | Not run | |
| Frontend tests | Not run | |
| Lint | Not run | |
| Build | Not run | |
| Security checks | Not run | |
| Manual smoke test | Not run | |

Use only `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN` with evidence. A test that could not start is `BLOCKED`, not `PASS`.
