# Feature Development Workflow

## Before implementation
- Read `AGENTS.MD`, `PRD.MD`, `ARCHITECURE.MD`, `API.MD`, and relevant module docs.
- Inspect existing routes, components, models, services, and tests.
- Confirm the desired behavior and acceptance criteria.
- Record the current Git status and preserve unrelated changes.
- Identify security, migration, compatibility, and rollout risks.

## Implementation sequence
1. Define acceptance criteria and edge cases.
2. Trace the existing end-to-end flow.
3. Make the smallest coherent change.
4. Add/update validation and authorization.
5. Add unit, integration, and UI tests as appropriate.
6. Update API and other docs.
7. Run relevant tests, lint, type checks, and build scripts that exist.
8. Review the diff and report the exact outcome.

## Definition of done
- Acceptance criteria are met.
- Tests cover expected behavior and important failure paths.
- No known authorization or data-validation regression is introduced.
- Existing behavior is preserved unless a change was requested.
- Documentation matches actual behavior.
- Build/lint/test results are reported honestly.
- Any blocked checks and remaining risks are explicit.

## Feature checklist
- [ ] Requirements and non-goals documented.
- [ ] Existing implementation audited.
- [ ] Server-side validation added.
- [ ] Authentication/authorization reviewed.
- [ ] Error and loading states handled.
- [ ] Tests added or updated.
- [ ] API docs updated.
- [ ] Relevant checks run.
- [ ] Diff reviewed.
- [ ] Completion report prepared.
