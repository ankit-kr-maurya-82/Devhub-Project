# DevHub browser E2E suite

This suite uses Playwright with the system Google Chrome binary. It has no `webServer` hook and never starts a frontend, backend, or database listener. Start the frontend and backend through an approved test environment before running it.

The runner refuses targets outside `localhost`, `*.localhost`, and `*.test`; browser requests are blocked unless they go to the configured frontend or API origin. The backend must use a disposable database containing only dedicated E2E users and fixtures. No production URL or credential may be used. Set `DEVHUB_E2E_CONFIRM_ISOLATED_DISPOSABLE_DB=YES` only after confirming the test deployment/database is disposable.

Required environment values:

- `DEVHUB_E2E=1`
- `DEVHUB_E2E_CONFIRM_ISOLATED_DISPOSABLE_DB=YES`
- `E2E_BASE_URL` and `E2E_API_URL` on a permitted test hostname
- `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` for a dedicated ordinary user
- `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` for a dedicated administrator
- `E2E_PROBLEM_SLUG` for a published problem in the disposable database

Run from `fronted/` with `npm run test:e2e`. Without `DEVHUB_E2E=1`, all browser workflows are explicitly skipped. The coding submission and moderation report create rows in the disposable database because the app has no submission/report-delete API; discard that database after the run. Question, blog, and coding-problem cleanup targets only IDs/slugs created by the current test.

The current UI supports question creation, voting, and comment create/edit/delete; it does not expose question edit/delete controls. The submission API stores code but explicitly reports that no judge is configured, so these tests assert “Not executed” and do not claim a verdict.
