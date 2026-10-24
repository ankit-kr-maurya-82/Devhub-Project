# Database Design

## Status
This document is a design and review guide. The actual database, schemas, indexes, and migrations must be verified from repository configuration and source.

## Data-model principles
- Give each entity a stable primary identifier.
- Enforce uniqueness in the database for fields that must be unique, such as normalized usernames or email addresses.
- Store password hashes only; never store plaintext passwords.
- Add timestamps where they support auditing and product behavior.
- Define required fields, lengths, enums, defaults, and relationships explicitly.
- Use references for related records and document deletion behavior.
- Avoid storing derived values unless there is a clear performance or audit reason.

## Potential entities
These are candidates, not confirmation that all exist:
- User: identity, credentials, profile, account status, timestamps.
- Blog/Post: author, title, slug, body, tags, publication state, timestamps.
- Comment: author, parent resource, content, moderation state, timestamps.
- Question/Answer: author, content, accepted-answer state, timestamps.
- Notification: recipient, type, payload/reference, read state, timestamps.

Implement only the entities required by the current product requirements.

## Indexing
- Add unique indexes for normalized unique identifiers.
- Add indexes for frequently queried ownership and status fields.
- Consider compound indexes for published-content feeds and tag/date queries based on observed query patterns.
- Add text/search indexes only after checking the database engine and search requirements.
- Validate index creation in a safe environment before production rollout.

## Data integrity
- Validate data at both API and database layers where practical.
- Use transactions for multi-record changes when supported and needed.
- Define soft-delete versus hard-delete behavior.
- Ensure pagination uses deterministic sorting.
- Plan migration/backfill/rollback steps for schema changes.
- Never run destructive migrations against production without a verified backup and explicit approval.

## Review checklist
- Schema/model files match this document.
- Required indexes are defined and tested.
- Sensitive fields are excluded from normal API serialization.
- Ownership and relationship rules are enforced.
- Migration and seed behavior is safe and repeatable.
