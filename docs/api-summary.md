# API Summary

All protected endpoints require:

```http
Authorization: Bearer <firebase_id_token>
```

## Authentication

- `POST /api/auth/sync-user` public with Firebase bearer token; `ADMIN` role is rejected for self-registration
- `GET /api/auth/me` authenticated
- `POST /api/auth/verify-email-status` planned/extendable

## Users

- `GET /api/users/me` authenticated
- `PUT /api/users/me` authenticated
- `GET /api/users/{id}` admin
- `PATCH /api/users/{id}/status` admin
- `GET /api/admin/users` admin
- `GET /api/admin/users/page?page=0&size=20` admin, paginated

## Profiles

- `GET /api/candidate-profiles/me` candidate
- `PUT /api/candidate-profiles/me` candidate
- `POST /api/candidate-profiles/me/upload-cv` candidate
- `GET /api/recruiter-profiles/me` recruiter
- `PUT /api/recruiter-profiles/me` recruiter

## Companies

- `POST /api/companies` recruiter
- `GET /api/companies/me` recruiter
- `PUT /api/companies/{id}` recruiter owner
- `GET /api/admin/companies` admin
- `GET /api/admin/companies/page?page=0&size=20` admin, paginated
- `PATCH /api/admin/companies/{id}/validate` admin

## Offers

- `GET /api/offers?page=0&size=10` public, published offers by default, keyword/location/skill limited to 80 chars
- `GET /api/offers/{id}` public for published offers
- `POST /api/offers` recruiter
- `PUT /api/offers/{id}` recruiter owner
- `DELETE /api/offers/{id}` recruiter owner, archives offer
- `PATCH /api/offers/{id}/publish` recruiter owner
- `PATCH /api/offers/{id}/archive` recruiter owner
- `GET /api/admin/offers` admin
- `PATCH /api/admin/offers/{id}/moderate` admin

## Applications

- `POST /api/applications` candidate
- `GET /api/applications/me` candidate
- `GET /api/applications/recruiter` recruiter
- `GET /api/applications/{id}` owner/recruiter/admin
- `PATCH /api/applications/{id}/status` recruiter owner

## Favorites

- `POST /api/favorites/{offerId}` candidate
- `DELETE /api/favorites/{offerId}` candidate
- `GET /api/favorites/me` candidate

## Subscriptions and Payments

- `GET /api/subscriptions/me` authenticated
- `POST /api/subscriptions/upgrade` authenticated, creates pending payment/subscription
- `POST /api/subscriptions/webhook/payment` public with `X-Payment-Secret`, activates premium only when status is `PAID`
- `POST /api/subscriptions/demo-confirm` public with `X-Payment-Secret`, local demo confirmation endpoint
- `GET /api/subscriptions/admin/page?page=0&size=20` admin, paginated
- `GET /api/payments/me` authenticated
- `GET /api/payments/{id}` owner/admin
- `GET /api/admin/subscriptions` admin

## AI and Notifications

- `POST /api/ai/jobs` premium/admin
- `GET /api/ai/jobs/{id}/result` premium/admin owner
- `GET /api/ai/candidates/recommendations/{offerId}` recruiter/admin
- `GET /api/notifications` authenticated
- `PATCH /api/notifications/{id}/read` owner
- `PATCH /api/notifications/read-all` owner

## Admin

- `GET /api/admin/dashboard` admin
- `GET /api/admin/logs` admin


## Chat

- `GET /api/conversations` authenticated participant
- `POST /api/conversations` candidate/recruiter, requires an existing application for the offer
- `GET /api/conversations/{id}/messages?page=0&size=50` participant, paginated
- `POST /api/conversations/{id}/messages` participant, content max 2000 characters
