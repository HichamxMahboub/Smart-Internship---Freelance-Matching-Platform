# Database Schema

MongoDB stores data as documents. Collection names in code use snake case where configured.

## users

Stores Firebase-linked user accounts: `firebaseUid`, `fullName`, `email`, `role`, `plan`, `active`, `emailVerified`, timestamps.

## candidateProfiles

Candidate profile data: `userId`, education, field, location, CV URL, skills, languages, preferences.

## recruiterProfiles

Recruiter profile data: `userId`, `companyId`, position, phone.

## companies

Company data: recruiter owner, name, sector, description, logo, website, validation status.

## offers

Offer data: company, title, description, type, location, duration, required skills, status, publish/archive dates.

## applications

Candidate applications: offer, candidate, recruiter, message, status, matching score, dates.

## favorites

Candidate saved offers: `userId`, `offerId`, created date.

## subscriptions

Premium plans: user, plan, active flag, start/expiration dates, status.

## payments

Payment records linked to subscription and user: amount, currency, method, status, paid date.

## notifications

User notifications: user, title, message, type, read flag, created date.

## aiResults

Simulated AI outputs: user, offer/application references, type, score, skills, recommendation and details.

## adminLogs

Admin audit trail: admin id, action, target type/id, description, created date.

## analytics

Generated dashboard snapshots: totals for users, candidates, recruiters, offers, applications, premium users, companies, pending companies/offers/applications.
