# Smart Internship & Freelance Matching Platform

## General Description

Smart Internship & Freelance Matching Platform is a complete academic full-stack project that connects candidates, students and freelancers with recruiters and companies publishing internship or freelance opportunities. The platform includes a Spring Boot backend, an Angular PWA backoffice, and an Expo React Native mobile app.

## Problem Statement

Students and junior freelancers often struggle to find relevant opportunities, while recruiters spend time filtering candidates manually. Existing workflows are fragmented across email, social platforms and spreadsheets, making offer publication, application tracking, company validation and candidate matching inefficient.

## Objectives

- Centralize internship and freelance offer management.
- Provide candidates with mobile access to offers, applications, favorites and premium AI features.
- Provide recruiters with company, offer and application management tools.
- Provide admins with validation, moderation, analytics and monitoring tools.
- Secure access with Firebase Authentication and role-based authorization.
- Package the system for local, Docker and Kubernetes deployment.

## Main Actors

- **Candidate**: browses offers, applies, saves favorites, manages profile, upgrades to premium and uses AI features.
- **Recruiter**: manages recruiter profile, company, offers and received applications.
- **Admin**: validates companies, supervises users/offers/subscriptions/logs and monitors dashboard analytics.

## Technologies Used

| Layer | Technologies |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring Security, Spring Data MongoDB, Firebase Admin SDK, Swagger/OpenAPI, Maven |
| Database | MongoDB, Mongo Express |
| Backoffice | Angular, Angular Material, PWA, Firebase Auth, HTTP Client |
| Mobile | Expo, React Native, TypeScript, React Navigation, Firebase Auth, Axios, AsyncStorage, Expo Notifications |
| Deployment | Docker Compose, Kubernetes/Minikube, Nginx |

## Global Architecture

```text
Candidate / Recruiter Mobile App       Admin / Recruiter Backoffice
              |                                      |
              | Firebase ID token                    | Firebase ID token
              v                                      v
        Spring Boot REST API with Firebase security and RBAC
              |
              v
            MongoDB
```

Firebase authenticates users. The frontend apps send the Firebase ID token as a bearer token to the backend. The backend verifies the token, loads the MongoDB user by `firebaseUid`, and applies role-based access rules.

## Folder Structure

```text
smart-match-platform/
  smart-match-backend/
  smart-match-backoffice/
  smart-match-mobile/
  docs/
  deployment/
  README.md
  docker-compose.yml
  .gitignore
```

In this workspace, these folders are prepared side-by-side at the repository root.

## Backend Description

`smart-match-backend` is a Spring Boot REST API that exposes modules for authentication, users, candidate profiles, recruiter profiles, companies, offers, applications, favorites, subscriptions, payments, AI results, notifications and admin dashboard. It uses MongoDB documents and Firebase Authentication.

## Backoffice Description

`smart-match-backoffice` is an Angular PWA for admins and recruiters. It includes Firebase login, role-based routing, Material tables/forms/cards, admin dashboard, user/company/offer/application/subscription management, notifications and recruiter profile/company pages.

## Mobile App Description

`smart-match-mobile` is an Expo React Native TypeScript app for candidates and recruiters. It supports Firebase login/register, offer browsing, application submission, favorites, candidate profile, premium subscription, AI jobs, notifications, recruiter company management, recruiter offers and recruiter applications.

## Database Collections

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

## Authentication Flow

1. User logs in or registers with Firebase email/password.
2. Frontend retrieves Firebase ID token.
3. Frontend calls backend with `Authorization: Bearer <firebase_id_token>`.
4. Backend verifies token using Firebase Admin SDK.
5. Backend loads local `User` from MongoDB using `firebaseUid`.
6. Spring Security applies role-based access control.

## Main Features by Role

### Candidate

- Register/login from mobile.
- Browse and filter published offers.
- View offer details.
- Apply once per offer.
- Save/remove favorites.
- Manage candidate profile.
- Upgrade to premium.
- Run simulated AI analysis/recommendations.
- Read notifications.

### Recruiter

- Register/login from mobile or backoffice.
- Manage recruiter profile.
- Create/update company.
- Create/update/publish/archive offers after company approval.
- Review received applications.
- Change application status.
- Read notifications.

### Admin

- Login from backoffice.
- View dashboard analytics.
- Manage users.
- Validate/reject companies.
- Moderate offers.
- View subscriptions and admin logs.

## Run Backend

```bash
cd smart-match-backend
cp .env.example .env
mvn spring-boot:run
```

Backend URL: `http://localhost:8080/api`

## Run Backoffice

```bash
cd smart-match-backoffice
npm install
npm start
```

Backoffice URL: `http://localhost:4200`

## Run Mobile

```bash
cd smart-match-mobile
npm install
npx expo start
```

For Android emulator, set mobile API URL to `http://10.0.2.2:8080/api` in `src/config/env.ts`.

## Run With Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Backend: `http://localhost:8080/api`
- Backoffice: `http://localhost:4200`
- MongoDB: `localhost:27017`
- Mongo Express: `http://localhost:8081`

## Swagger URL

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- API docs: `http://localhost:8080/v3/api-docs`

## Mongo Express URL

- `http://localhost:8081`

## Firebase Configuration Instructions

Backend needs Firebase Admin credentials through one of:

- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_SERVICE_ACCOUNT_PATH`

Backoffice Firebase config is placed in:

- `smart-match-backoffice/src/environments/environment.ts`
- `smart-match-backoffice/src/environments/environment.development.ts`

Mobile Firebase config is placed in:

- `smart-match-mobile/src/config/env.ts`

Never commit real Firebase service account JSON files.

## Demo Scenario

1. Start MongoDB and backend.
2. Start backoffice and mobile app.
3. Register candidate in mobile and sync user.
4. Register recruiter and create company.
5. Admin validates company in backoffice.
6. Recruiter creates and publishes an offer.
7. Candidate browses, favorites and applies to the offer.
8. Recruiter changes application status to `INTERVIEW`.
9. Candidate upgrades to premium and runs AI CV analysis.
10. Admin opens dashboard, subscriptions and logs.

## Screenshots

Add screenshots before final submission:

- Mobile login/register
- Candidate offer list
- Candidate offer details/apply
- Recruiter company page
- Recruiter offer management
- Backoffice dashboard
- Backoffice company validation
- Swagger UI

## Team Members

- Student 1: TODO
- Student 2: TODO
- Supervisor: TODO

## Academic Notes

This project is designed for academic demonstration. Payment and AI features are simulated but structured as real backend modules, allowing future integration with payment gateways and AI services. Firebase Authentication is real and should be configured with a Firebase project before the final demo.
