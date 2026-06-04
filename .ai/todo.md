# Interlance — Mobile UI Enhancement + OpenRouter Swap

(Prior redesign pass complete — see git history. This pass adds match-level UI, LinkedIn-style profile, mandatory onboarding, recruiter candidate views, and OpenRouter swap.)

## Phase 0 — Foundations
- [x] types: extend CandidateProfile (photo, headline, bio, projects, experiences, educations, socials) + new interfaces
- [x] theme/colors: match ramp tokens
- [x] utils/match.ts: computeMatch
- [x] components: MatchBadge, MatchRing, ProgressBar, PhotoPicker, ProjectCard, TimelineItem, SocialRow

## Phase 1 — Onboarding (mandatory gate)
- [x] profile completeness util
- [x] OnboardingGate + AppNavigator gate
- [x] candidate onboarding steps (welcome/photo, education, skills, CV)
- [x] recruiter onboarding (company)

## Phase 2 — Candidate screens
- [x] OfferCard matchScore prop
- [x] CandidateHomeScreen (match badges, completeness)
- [x] OfferListScreen (match + sort)
- [x] OfferDetailsScreen (ring + breakdown + saved bug fixed)
- [x] CandidateProfileScreen (LinkedIn rebuild: photo, headline, bio, skills, CV, portfolio, experience, education, socials, edit sheets)
- [x] ApplicationsScreen (match ramp colors)
- [x] Favorites (match badges), AIRecommendations (MatchRing) — match-everywhere extended
- [ ] Premium/Notifications polish (deferred — already redesigned prior pass)

## Phase 3 — Recruiter screens
- [x] RecruiterApplicationsScreen (match badge + sort + nav)
- [x] CandidateDetailScreen (new — full applicant profile + match ring)
- [x] OfferCandidatesScreen (new — ranked candidates) + RecruiterOffers "View ranked candidates"
- [x] RecruiterNavigator routes
- [~] RecruiterHomeScreen (already polished prior pass; left as-is)
- [ ] OfferForm/Company/RecruiterProfile/Notifications polish (deferred)

## Phase 4 — Shared
- [ ] Conversations + Chat polish (deferred — already redesigned prior pass)

## Phase 5 — Backend OpenRouter
- [x] AiMatchingClient → OpenRouter RestClient (openrouter/free auto)
- [x] application.yml + backend .env.example
- [x] pom.xml remove anthropic dep + version prop
- [x] aiService.candidateRecommendations (mobile) for recruiter ranked view

## Phase 6 — Re-onboarding bug + recruiter/org persistence
- [x] BUG: candidate re-onboarded every login. Root: backend CandidateProfile lacked `headline` → never persisted → isCandidateComplete always false. Fixed: persist headline+photo+bio+projects+experiences+educations+socials (model+DTOs+service).
- [x] Backend embedded models: Project, Experience, Education, SocialLinks
- [x] RecruiterProfile backend: photoUrl, headline, bio, linkedin (model+DTOs+service)
- [x] Company backend: size, location (model+DTOs+service)
- [x] Mobile types: Company size/location, RecruiterProfile new fields; CompanyPayload
- [x] RecruiterProfileScreen: photo, headline, bio, position, phone, linkedin
- [x] CompanyScreen: logo picker, sector/size row, location

## Verify
- [x] tsc --noEmit (mobile) — CLEAN, zero errors (incl. Phase 6)
- [ ] mvn compile (backend) — needs Maven + Nexus bypass (no mvn in this env); arity hand-verified
