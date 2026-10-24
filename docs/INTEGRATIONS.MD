# Integrations

## Purpose
Record the external services DevHub uses and the safe process for integrating new providers. Confirm actual integrations from source and environment configuration.

## Integration inventory template
For each provider, record:
- Provider and purpose.
- Owning module/service.
- Required environment variable names (never values).
- Authentication method and scopes.
- Timeout, retry, and rate-limit behavior.
- Data sent and received.
- Failure and fallback behavior.
- Test strategy and sandbox configuration.
- Data retention and privacy considerations.

## Potential integrations
These are optional examples, not confirmation of existing configuration:
- Email provider for verification and password recovery.
- Object storage or image CDN for profile/content media.
- Socket.IO or another real-time transport.
- Error monitoring and operational metrics.

## Integration rules
- Keep provider credentials in environment variables or a secrets manager.
- Use least-privilege credentials and separate development/test/production credentials.
- Validate provider responses and handle timeouts.
- Avoid logging tokens, complete email contents, or sensitive payloads.
- Use sandbox/test mode where available.
- Make retries bounded and safe; avoid duplicating payments, emails, or other side effects.
- Document webhook signature validation and replay protection if webhooks are added.
- Provide a graceful error message when an optional provider is unavailable.

## Before adding a provider
Audit existing dependencies and abstractions first. Avoid adding duplicate libraries or services without a clear reason.
