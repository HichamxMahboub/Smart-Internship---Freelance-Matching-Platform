# Lessons

## Persistence must back any completeness/gate check (2026-06-03)
**Symptom:** Candidate re-onboarded on every sign-in.
**Root cause:** Mobile `OnboardingGate` keyed completeness on `headline` (+skills+cvUrl), but backend `CandidateProfile` model/DTO had no `headline` field → the value was silently dropped on PUT → GET never returned it → gate stayed incomplete forever.
**Rule:** When adding a UI field that any gate, filter, or score depends on, wire it end-to-end the same change: model → request DTO → response DTO → service mapping. Don't rely on "ride-along" fields persisting; backends drop unknown JSON props.
**Check:** Grep the backend model + both DTO records for every field a completeness/gate function reads.
