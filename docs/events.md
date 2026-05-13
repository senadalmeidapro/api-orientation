# Event Contracts (Draft)

## Conventions

- Event name: noun.verb (e.g., assessment.completed)
- Payload must include: eventId, occurredAt (ISO), version, source, data
- No PII in events.

## Core Events

1. session.started
   - data: { sessionId, testVersionId }

2. assessment.started
   - data: { assessmentId, sessionId, type, depth }

3. assessment.completed
   - data: { assessmentId, sessionId, type, completionPercentage }

4. assessment.abandoned
   - data: { assessmentId, sessionId, reason? }

5. result.computed
   - data: { assessmentId, phase1Code?, phase2Code? }

6. recommendation.generated
   - data: { resultId, topCareerIds, algorithmVersion }

7. feedback.recorded
   - data: { assessmentId, recommendationId?, type, value }

8. interaction.recorded
   - data: { assessmentId, entityType, entityId, type, value? }

9. outcome.recorded
   - data: { assessmentId, careerId, status }

## Example Envelope

{
"eventId": "uuid",
"occurredAt": "2026-04-03T12:00:00Z",
"version": 1,
"source": "assessment-service",
"data": {}
}
