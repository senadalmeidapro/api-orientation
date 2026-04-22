# Microservices Preparation (POPI 2.0)

## Goals

- Define bounded contexts for v2 microservices.
- Establish data ownership boundaries.
- Prepare event-driven contracts and API versioning.

## Target Services (v2)

1. identity-service
    - Ownership: users, roles, auth, refresh tokens.
    - Data: User, Role, UserRole, RefreshToken.
    - APIs: /auth/_, /users/_

2. assessment-service
    - Ownership: sessions, assessments, questions, responses, scoring, results, treasure maps.
    - Data: Session, Assessment, Phase1/2Question, Phase1/2Response, AssessmentResult, TreasureMap.
    - APIs: /sessions, /questions, /responses, /results, /treasure-map

3. recommendation-service
    - Ownership: recommendations, feedback signals, ranking logic.
    - Data: AssessmentCareerRecommendation, AssessmentFeedback (or analytics integration).
    - APIs: /careers/recommendations

4. content-service
    - Ownership: careers, training centers, training paths, resources, links.
    - Data: Career, TrainingInstitution, TrainingPath, Resource, LinkCategory, Link.
    - APIs: /careers, /training-centers, /training-paths, /resources, /links

5. analytics-service
    - Ownership: interactions, feedback, outcomes, aggregates.
    - Data: AssessmentInteraction, AssessmentFeedback, AssessmentOutcome.
    - APIs: /analytics/\*

6. ai-service
    - Ownership: AI prompts, inference orchestration.
    - Data: no PII storage. Uses read-only projections.
    - APIs: /ai/\*

## Cross-cutting

- API Gateway or BFF to aggregate and enforce auth.
- Shared libraries for DTOs and error handling (versioned).
- Observability: request IDs propagated in all services.

## Data Ownership Rules

- Each service owns its tables.
- Foreign keys across services replaced by IDs + eventual consistency events.
- Read models can be built via event consumers or cache.

## Migration Strategy

1. Freeze current schema (v1).
2. Introduce event publishing in monolith.
3. Extract one service at a time (content-service first).
4. Replace direct DB access with service calls.
