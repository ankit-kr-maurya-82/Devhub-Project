# Authentication and Security

## Status
Security requirements and review checklist. Confirm actual implementation in code and tests.

## Authentication lifecycle
- Registration validates and normalizes allowed fields.
- Passwords are hashed with a modern password-hashing algorithm; never store plaintext passwords.
- Login returns a generic failure message that does not reveal whether an account exists.
- Logout invalidates the relevant session/token according to the selected auth strategy.
- Password recovery uses short-lived, single-use, cryptographically random tokens.
- Email verification, if enabled, uses expiring tokens and safe resend limits.
- Session cookies, if used, should be `HttpOnly`, `Secure` in production, and have an appropriate `SameSite` policy.
- Token storage and rotation must follow the actual authentication design; do not mix cookie and bearer-token patterns without a documented reason.

## Authorization
- Check permissions on every protected API request.
- Verify resource ownership server-side before edits/deletes.
- Apply role-based access only where roles are explicitly defined.
- Do not trust user IDs, roles, or ownership claims supplied in request bodies.
- Consider whether `404` is preferable to `403` when revealing resource existence would be sensitive.

## Input and output
- Validate type, length, format, and allowed values.
- Use allowlists for fields that may be updated.
- Prevent mass assignment.
- Escape or safely render user-generated content to prevent XSS.
- Protect against NoSQL injection or SQL injection according to the data layer.
- Set request-body and upload size limits.

## Web security
- Configure CORS for known origins.
- Apply CSRF protection when cookie-based authentication and the deployment model require it.
- Use security headers and a restrictive Content Security Policy where practical.
- Rate-limit login, registration, password recovery, and other abuse-prone operations.
- Enforce HTTPS in production.
- Avoid detailed stack traces in public responses.

## Secrets and privacy
- Keep `.env` files out of version control; commit only safe examples.
- Rotate any credential that has been exposed.
- Redact secrets and sensitive personal information from logs.
- Collect only data needed for the feature and define retention/deletion behavior.
- Do not log passwords, session cookies, reset tokens, or authorization headers.

## Security verification
- Test unauthenticated access, invalid credentials, privilege escalation, ownership violations, malformed inputs, rate limits, and expired/replayed recovery tokens.
- Never disable security controls solely to make a test pass.
- Record any untested controls as limitations.
