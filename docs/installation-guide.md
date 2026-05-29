# Installation Guide

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 20+
- npm 11+
- Docker and Docker Compose
- MongoDB locally or through Docker
- Firebase project with Authentication enabled
- Expo Go or Android Studio emulator for mobile testing

## Backend Setup

```bash
cd smart-match-backend
cp .env.example .env
mvn -q -DskipTests package
mvn test
mvn spring-boot:run
```

Set Firebase Admin credentials using `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH`.

## Backoffice Setup

```bash
cd smart-match-backoffice
npm install
npm run build
npm start
```

Configure Firebase in `src/environments/environment.ts` and `src/environments/environment.development.ts`.

## Mobile Setup

```bash
cd smart-match-mobile
npm install
npx tsc --noEmit
npx expo start
```

Configure Firebase and backend URL in `src/config/env.ts`.

## Firebase Setup

1. Create Firebase project.
2. Enable Email/Password Authentication.
3. Create a web app and copy config to Angular and Expo apps.
4. Generate service account JSON for backend.
5. Set backend environment variable without committing secrets.

## Docker Setup

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Backend: `http://localhost:8080/api`
- Backoffice: `http://localhost:4200`
- Mongo Express: `http://localhost:8081`

## Troubleshooting

- If mobile Android emulator cannot reach backend, use `http://10.0.2.2:8080/api`.
- If physical phone cannot reach backend, use the computer LAN IP.
- If protected endpoints return 401, verify Firebase Admin config and frontend Firebase config.
- If company cannot publish offer, approve it from admin backoffice first.
- If AI returns forbidden, upgrade user to premium.
