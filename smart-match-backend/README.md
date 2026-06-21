# Interlance — Backend API

Interlance backend REST API for a mobile and backoffice platform connecting candidates/students/freelancers with recruiters and companies publishing internship or freelance offers.

## Technologies

- Java 17
- Spring Boot 3
- Maven
- Spring Web
- Spring Security
- Spring Data MongoDB
- Firebase Authentication and Firebase Admin SDK
- Firebase Cloud Messaging-ready notification model
- Swagger/OpenAPI via springdoc-openapi
- Docker Compose
- Kubernetes/Minikube manifests

## Backend Architecture

The backend follows a layered Spring Boot architecture:

- `controller`: REST endpoints using `ResponseEntity`
- `service`: business rules and orchestration
- `repository`: Spring Data MongoDB access
- `model`: MongoDB documents and enums
- `dto`: request and response payloads grouped by module
- `security`: Firebase token verification filter and authenticated principal
- `config`: Mongo auditing, Firebase, OpenAPI, and seed data configuration
- `exception`: global API exception handling
- `util`: shared helpers such as current authenticated user access

## Folder Structure

```text
src/main/java/com/smartmatch/
  config/
  controller/
  dto/
  exception/
  mapper/
  model/
  repository/
  security/
  service/
  util/
  SmartMatchApplication.java
src/main/resources/application.yml
deployment/k8s/
docs/postman/
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SPRING_DATA_MONGODB_URI` | MongoDB URI used by Spring Boot | `mongodb://localhost:27017/smart_match` |
| `MONGODB_URI` | Fallback MongoDB URI configured in `application.yml` | `mongodb://localhost:27017/smart_match` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase service account JSON content | empty |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase service account file | empty |
| `APP_PAYMENT_WEBHOOK_SECRET` | Secret required by payment webhook/demo confirmation | `change-me` locally, never default in production |
| `APP_SEED_ENABLED` | Enables development seed data | `false` locally, `true` in Docker Compose |
| `APP_CV_UPLOAD_DIR` | Local CV upload directory | `/uploads/cv` |

## Run Locally

Start MongoDB locally, then run:

```bash
cd smart-match-backend
export SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/smart_match
export APP_PAYMENT_WEBHOOK_SECRET=change-me
export APP_SEED_ENABLED=true
mvn spring-boot:run
```

If Firebase credentials are not configured, protected endpoints that verify real Firebase tokens will reject authentication. For production or real demos, set `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH`.

## Run With Docker Compose

```bash
cd smart-match-backend
docker compose up --build
```

Services:

- Backend: `http://localhost:8080`
- MongoDB: `localhost:27017`
- Mongo Express: `http://localhost:8081`

## Run Tests

```bash
cd smart-match-backend
mvn test
```

Build without tests:

```bash
mvn -q -DskipTests package
```

## Swagger/OpenAPI

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Swagger UI alternate: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Swagger includes a Firebase bearer token security scheme. Click `Authorize` and paste a Firebase ID token.

## Main API Endpoints

| Module | Endpoint | Access |
|---|---|---|
| Auth | `POST /api/auth/sync-user` | Public with Firebase bearer token |
| Auth | `GET /api/auth/me` | Authenticated |
| Users | `GET /api/users/me`, `PUT /api/users/me` | Authenticated |
| Users | `GET /api/users/{id}`, `PATCH /api/users/{id}/status` | Admin |
| Candidate Profile | `GET/PUT /api/candidate-profiles/me` | Candidate |
| Candidate Profile | `POST /api/candidate-profiles/me/upload-cv` | Candidate |
| Recruiter Profile | `GET/PUT /api/recruiter-profiles/me` | Recruiter |
| Companies | `POST /api/companies`, `GET /api/companies/me`, `PUT /api/companies/{id}` | Recruiter |
| Companies Admin | `GET /api/admin/companies`, `PATCH /api/admin/companies/{id}/validate` | Admin |
| Offers | `GET /api/offers`, `GET /api/offers/{id}` | Public |
| Offers | `POST/PUT/DELETE /api/offers`, `PATCH /publish`, `PATCH /archive` | Recruiter |
| Applications | `POST /api/applications`, `GET /api/applications/me` | Candidate |
| Applications | `GET /api/applications/recruiter`, `PATCH /api/applications/{id}/status` | Recruiter |
| Favorites | `POST/DELETE /api/favorites/{offerId}`, `GET /api/favorites/me` | Candidate |
| Subscriptions | `GET /api/subscriptions/me`, `POST /api/subscriptions/upgrade` | Authenticated |
| Payments | `GET /api/payments/me`, `GET /api/payments/{id}` | Owner or Admin |
| AI | `POST /api/ai/jobs`, `GET /api/ai/jobs/{id}/result` | Premium or Admin |
| Notifications | `GET /api/notifications`, `PATCH /read`, `PATCH /read-all` | Authenticated owner |
| Admin | `GET /api/admin/dashboard`, `/subscriptions`, `/logs` | Admin |

## Roles and Permissions

- `CANDIDATE`: manage candidate profile, browse published offers, apply, save favorites, use AI with PREMIUM plan.
- `RECRUITER`: manage recruiter profile and own company, create/update/publish/archive own offers, manage own applications, use recruiter AI with PREMIUM plan.
- `ADMIN`: validate companies, moderate platform data, view dashboard, subscriptions, logs, and access AI endpoints.

## MongoDB Collections

- `users`
- `candidate_profiles`
- `recruiter_profiles`
- `companies`
- `offers`
- `applications`
- `favorites`
- `subscriptions`
- `payments`
- `notifications`
- `ai_results`
- `admin_logs`
- `analytics`

## Kubernetes / Minikube Deployment

Build the image inside Minikube, then apply manifests:

```bash
cd smart-match-backend
minikube start
eval $(minikube docker-env)
docker build -t smart-match-backend:latest .
kubectl apply -f deployment/k8s/namespace.yaml
kubectl apply -f deployment/k8s/mongodb-deployment.yaml
kubectl apply -f deployment/k8s/mongodb-service.yaml
kubectl apply -f deployment/k8s/backend-configmap.yaml
cp deployment/k8s/backend-secret.example.yaml /tmp/smart-match-secret.yaml
# edit /tmp/smart-match-secret.yaml and set non-real demo secrets if needed
kubectl apply -f /tmp/smart-match-secret.yaml
kubectl apply -f deployment/k8s/backend-deployment.yaml
kubectl apply -f deployment/k8s/backend-service.yaml
minikube service smart-match-backend -n smart-match
```

## Presentation Demo Scenario

1. Sync three Firebase users: admin, candidate, recruiter.
2. Recruiter creates a company.
3. Admin approves the company.
4. Recruiter creates and publishes an internship offer.
5. Candidate browses offers and applies.
6. Recruiter changes application status to `INTERVIEW`.
7. Candidate upgrades to PREMIUM.
8. Candidate runs `CV_ANALYSIS` AI job.
9. Recruiter checks candidate recommendations for the offer.
10. Admin opens dashboard and reviews logs.

## Firebase Token Usage

The mobile app and Angular backoffice must send the Firebase ID token in every protected request:

```http
Authorization: Bearer <firebase_id_token>
```

The backend verifies the token using Firebase Admin SDK, reads `firebaseUid`, and loads the matching MongoDB user. Use `POST /api/auth/sync-user` after Firebase login to create or update the local user record.


## Security Hardening Implemented

- `/api/auth/sync-user` rejects `ADMIN` role self-registration.
- Subscription upgrade creates a `PENDING` payment and activates premium only after a valid secret-confirmed webhook/demo confirmation.
- CV uploads are limited to 5MB and only `.pdf`, `.doc`, `.docx` content types are accepted.
- Chat messages are capped at 2000 characters and message history is paginated.
- MongoDB indexes were added for high-traffic lookup fields.
