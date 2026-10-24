# Debugging Guide

## First response
1. Capture the exact error message, stack trace, command, and reproduction steps.
2. Check `git status` and recent changes before editing.
3. Identify whether the failure is in the frontend, API, database, configuration, or external integration.
4. Reproduce with the smallest reliable test.
5. Fix the root cause rather than hiding the symptom.

## Common checks
- Dependencies: use the lockfile and the package manager expected by the repository.
- Environment: compare required variables with `.env.example`; never paste secrets into logs or chat.
- API: verify route registration, request method, content type, payload validation, status code, and server logs.
- Database: verify connection configuration, service availability, schema/index state, and test database isolation.
- Frontend: inspect browser console and network requests, including response status and payload shape.
- Tests: distinguish a failing assertion from a test environment or port-binding limitation.
- Integrations: verify credentials are present without printing them, endpoints are correct, and timeouts/errors are handled.

## Useful commands
```bash
git status --short --branch
git diff --check
npm test
npm run lint
npm run build
```
Run only commands that exist in the relevant package. In a monorepo, run them from the correct package directory.

## Safe debugging rules
- Do not disable authentication, validation, TLS, or authorization to bypass a failure.
- Do not delete a database or reset migrations as a first troubleshooting step.
- Do not commit temporary debug logs containing sensitive data.
- Preserve user changes and unrelated working-tree modifications.
- If a check is blocked by the environment, report it as blocked—not passed.

## Bug report template
- Expected behavior:
- Actual behavior:
- Reproduction steps:
- Exact error:
- Relevant files:
- Checks run:
- Suspected cause:
- Fix and regression test:
