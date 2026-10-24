# Setup and Initialisation

## Before starting
Check the repository README, package manifests, lockfiles, environment examples, and scripts. This guide intentionally avoids guessing exact commands for a repository whose current configuration has not been inspected.

## Local setup checklist
1. Install the required runtime versions listed in the project.
2. Install dependencies from the relevant package directory using its lockfile.
3. Copy the example environment file to a local, ignored environment file if one exists.
4. Configure the database URL and required secrets locally.
5. Start the database or use the documented test database.
6. Run migrations/index setup only as documented and against the intended environment.
7. Start backend and frontend processes using existing scripts.
8. Verify the health endpoint or a known read-only API request.
9. Run tests and build/lint checks.

## Environment variable template
Document variable names and safe descriptions here after auditing the source. Never place real values in this file.

| Variable | Purpose | Required | Example |
|---|---|---|---|
| `NODE_ENV` | Runtime mode | Usually | `development` |
| `PORT` | API listening port | If configurable | `4000` |
| `DATABASE_URL` | Database connection string | If used | `mongodb://127.0.0.1:27017/devhub_dev` |
| `SESSION_SECRET` | Session signing secret, if used | If applicable | Use a long random local-only secret |

The examples above are illustrative; use the actual database and variable names supported by the code.

## Troubleshooting
- Dependency install fails: check runtime version, lockfile, and package manager.
- Database connection fails: verify service status, URL, credentials, and network access.
- Port bind fails: check whether another process owns the port; do not terminate unrelated processes without checking.
- Environment validation fails: compare variable names with the code and `.env.example`.
- Tests fail due to environment restrictions: report the test as blocked, not passed.

## Cleanup
Stop only processes started for this project. Never reset or delete a database without confirming its target and taking a backup where needed.
