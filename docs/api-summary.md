# Interlance — API Summary

> Référence de démo : la documentation interactive OpenAPI est disponible sur [Swagger UI](http://localhost:8080/swagger-ui/index.html). Les chemins et opérations ci-dessous sont ceux des contrôleurs Spring Boot ; Swagger reste la source de détail (paramètres, schémas et réponses).

## Accès et authentification

En production, un client transmet un jeton Firebase dans `Authorization: Bearer <firebase_id_token>`. Le backend le vérifie avant de charger l'utilisateur et son rôle (`CANDIDATE`, `RECRUITER` ou `ADMIN`).

Dans Docker Compose local, `APP_DEMO_AUTH_ENABLED=true` autorise les comptes seed sans Firebase : les clients de démonstration transmettent l'identité dans l'en-tête `X-Demo-User-Email`. Cet en-tête est réservé à la démo locale et ne remplace pas la vérification Firebase en production.

## Groupes d'API

| Groupe | Objet et principales opérations | Acteur principal |
|---|---|---|
| `/api/auth` | Synchroniser le compte authentifié et obtenir l'utilisateur courant (`POST /sync-user`, `GET /me`). | Tous les utilisateurs authentifiés |
| `/api/users` | Consulter ou modifier son profil utilisateur, enregistrer un jeton de notification ; l'administration peut consulter et changer un statut. | Utilisateur, Admin |
| `/api/candidates` | Nom fonctionnel du domaine candidat ; les routes réelles sont `/api/candidate-profiles` (`GET`/`PUT /me`, dépôt et analyse de CV). | Candidate |
| `/api/recruiters` | Nom fonctionnel du domaine recruteur ; les routes réelles sont `/api/recruiter-profiles` (`GET`/`PUT /me`). | Recruiter |
| `/api/companies` | Créer, consulter et modifier son entreprise ; `/api/admin/companies` valide les entreprises. | Recruiter, Admin |
| `/api/offers` | Lister, consulter, créer, modifier, publier ou archiver une offre ; `/api/admin/offers` modère. | Public, Recruiter, Admin |
| `/api/applications` | Postuler, consulter ses candidatures ou celles reçues, et modifier le statut autorisé. | Candidate, Recruiter, Admin |
| `/api/favorites` | Ajouter, supprimer et lister les offres favorites. | Candidate |
| `/api/subscriptions` | Consulter la souscription, demander un upgrade, confirmer une démo et administrer les souscriptions. | Utilisateur, Admin |
| `/api/payments` | Initialiser une souscription ou un paiement freelance, confirmer un paiement et traiter le webhook Stripe si configuré. | Utilisateur, service de paiement |
| `/api/notifications` | Lire les notifications, marquer une notification ou toutes comme lues. | Utilisateur |
| `/api/ai` | Lancer/consulter un traitement IA et obtenir des recommandations de candidats pour une offre. | Candidate, Recruiter selon la ressource |
| `/api/admin` | Dashboard, utilisateurs, entreprises, offres, abonnements, notifications et logs d'administration. | Admin |

### Groupes complémentaires réellement exposés

- `/api/uploads` : signatures Cloudinary et dépôts d'images/CV autorisés ;
- `/api/conversations` : conversations et messages liés aux candidatures ;
- `/api/assistant` : assistance conversationnelle et propositions de matching.

Ne pas déduire un endpoint précis du seul nom fonctionnel : vérifier Swagger avant d'intégrer un client ou de préparer une collection Postman.

Outside the explicit local Docker demo mode, protected endpoints require:

```http
Authorization: Bearer <firebase_id_token>
```

## Authentication

- `POST /api/auth/sync-user` public with Firebase bearer token; `ADMIN` role is rejected for self-registration
- `GET /api/auth/me` authenticated

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
