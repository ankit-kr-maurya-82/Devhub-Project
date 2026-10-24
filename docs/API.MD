# DevHub API Specification

## Status
This is a planning template. The live routes and schemas must be verified against the current backend before treating any endpoint below as implemented.

## API conventions
- Use a consistent base path, preferably `/api/v1`, if compatible with the existing application.
- Return JSON for API responses.
- Use standard HTTP status codes.
- Validate and normalize all client-supplied input.
- Do not expose password hashes, reset tokens, session secrets, or internal stack traces.
- Paginated endpoints should use a documented, bounded page size.
- Keep error response shapes consistent across routes.

## Suggested response shapes
Success:
```json
{
  "success": true,
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request could not be validated."
  }
}
```

These are examples, not a claim about the current implementation.

## Implemented notifications API

All notification routes require authentication and scope reads and mutations to the authenticated recipient.

| Method | Path | Behavior |
|---|---|---|
| `GET` | `/api/v1/notifications?page=1&limit=20&unread=true` | Return a recipient-scoped page, pagination metadata, and the recipient's unread total. `limit` is capped at 50; `unread` accepts `true` or `false`. |
| `GET` | `/api/v1/notifications/unread-count` | Return the authenticated recipient's unread count. |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all of the authenticated recipient's unread notifications as read. |
| `PATCH` | `/api/v1/notifications/{notificationId}/read` | Mark one of the authenticated recipient's notifications as read. |
| `DELETE` | `/api/v1/notifications/{notificationId}` | Delete one of the authenticated recipient's notifications. |

Newly persisted notifications are sent to the authenticated recipient over the existing Socket.IO connection as `notificationCreated`. The server derives the recipient room from the authenticated socket identity; clients cannot subscribe to another user's notification room. Community messages create a generic notification for each other room member; message content is not copied into notifications.

## Resource areas to document
- Authentication: registration, login, logout, current user, password recovery.
- Users: profile read/update and account status.
- Blogs: create, list published posts, read by slug or ID, update own post, delete own post.
- Search and tags: query validation, filtering, sorting, pagination.
- Future modules: questions/answers, comments, notifications, messaging, and reputation, only when implemented.

## Endpoint inventory template
For each real endpoint, document:
- Method and path.
- Authentication requirements.
- Required role and resource ownership rules.
- Path/query/body schema and limits.
- Success status and response schema.
- Error statuses.
- Rate limits and security notes.
- Tests covering the contract.

## HTTP status guidance
- `200` — successful read or update.
- `201` — resource created.
- `204` — successful operation with no response body.
- `400` — malformed or invalid request.
- `401` — authentication required or invalid credentials.
- `403` — authenticated but not allowed.
- `404` — resource not found or intentionally concealed by policy.
- `409` — conflict, such as duplicate unique value.
- `422` — semantically invalid input, if used consistently.
- `429` — rate limit exceeded.
- `500` — unexpected server error without sensitive details.

## Security checklist
- Authentication and authorization checked on every protected route.
- Ownership verified server-side for mutations.
- Login and recovery endpoints rate-limited.
- CORS and CSRF protections configured for the chosen auth mechanism.
- Input size, file type, and pagination limits enforced.
- No secrets or personal data written to logs.
