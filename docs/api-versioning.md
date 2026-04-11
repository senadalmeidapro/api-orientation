# API Versioning Strategy

## Goals
- Keep backward compatibility for public clients.
- Enable controlled evolution between v1 and v2.

## Rules
1. Base path: /api/v1 for all public endpoints.
2. New breaking changes go to /api/v2.
3. DTO changes must be additive in v1.
4. Deprecation policy: announce >= 90 days before removal.

## Implementation Notes
- Use controller prefixes for v2 extraction.
- Track version in OpenAPI docs per release.
- Contract tests for v1 endpoints before releases.
