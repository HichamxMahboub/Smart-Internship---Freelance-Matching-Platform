# Interlance — Installation Guide

> La procédure Docker ci-dessous est la référence de démonstration. Les sections manuelles historiques qui demandent Firebase ou un fichier `.env` ne sont nécessaires que pour un environnement intégré/production.

## Prérequis

- Git ;
- Docker Engine et Docker Compose v2 (`docker compose version`) ;
- Node.js et npm pour le mobile Expo Web ;
- Java 17 et Maven pour lancer ou tester le backend hors Docker ;
- Expo CLI via `npx expo` si le mobile est lancé localement.

## Récupérer le projet

```bash
git clone <url-du-repository>
cd Smart-Internship---Freelance-Matching-Platform
```

## Démonstration Docker locale

Le Compose racine active le seeder et l’authentification de démo. Aucune clé Firebase, Cloudinary, OpenRouter ou n8n n’est requise pour démarrer les services de base.

```bash
docker compose up -d --build
docker ps
docker logs --tail=80 smart-match-platform-backend
```

Sur un environnement ancien où le plugin Compose v2 n’est pas installé, utiliser `docker-compose up -d --build` à la place.

## Vérifier les URLs

| Élément | URL |
|---|---|
| API backend | `http://localhost:8080` |
| Swagger/OpenAPI | `http://localhost:8080/swagger-ui/index.html` |
| Backoffice | `http://localhost:4200` |
| Mongo Express | `http://localhost:8081` |
| n8n | `http://localhost:5678` |

Si Swagger ne s’ouvre pas, consulter en premier les logs du backend avec la commande ci-dessus.

## Mobile Expo Web

Dans un autre terminal :

```bash
cd smart-match-mobile
npm install
echo 'EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api' > .env
npx expo start --web --port 8082
```

Ouvrir ensuite `http://localhost:8082`. Le fichier `.env` créé ici est **local et privé** : ne jamais le committer. Vérifier avec `git status --short` avant tout commit.

## Comptes de démonstration locaux

Le mode démo local fonctionne sans Firebase lorsque le Compose racine est utilisé :

| Rôle | E-mail | Mot de passe de démo |
|---|---|---|
| Candidat | `candidate@interlance.demo` | `demo123` |
| Recruteur | `recruiter@interlance.demo` | `demo123` |
| Administrateur | `admin@interlance.demo` | `demo123` |

Ces comptes ne sont pas des comptes de production. Les clients transmettent une identité de démo et le backend charge les utilisateurs créés par le seeder.

## Dépannage

- **Firebase non configuré** : normal en démonstration Docker. Utiliser les comptes de démo, pas un token Firebase.
- **Port déjà utilisé** : identifier le processus ou modifier le mapping de port dans Compose, puis relancer.
- **Backend indisponible** : `docker logs --tail=80 smart-match-platform-backend` et vérifier que MongoDB est `healthy`/démarré.
- **Swagger indisponible** : attendre le démarrage Spring Boot puis vérifier `http://localhost:8080/swagger-ui/index.html`.
- **Commande Compose inconnue** : essayer `docker-compose` si `docker compose` n’est pas disponible.
- **Mode production** : fournir les credentials Firebase Admin et les secrets externes par variables d’environnement ou gestionnaire de secrets, jamais dans Git.

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

Set Firebase Admin credentials using `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH`. Set `APP_PAYMENT_WEBHOOK_SECRET` to a non-default value before sharing the demo environment.

## Backoffice Setup

```bash
cd smart-match-backoffice
npm install
npm run build
npm start
```

Configure public Firebase client values in `src/environments/environment.ts` and `src/environments/environment.development.ts`. Keep service account JSON only on the backend.

## Mobile Setup

```bash
cd smart-match-mobile
npm install
npx tsc --noEmit
npx expo start
```

Configure Expo public variables from `smart-match-mobile/.env.example` or edit `src/config/env.ts` fallback values for local demos.

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
- Mongo Express: `http://localhost:8081` using `MONGO_EXPRESS_USERNAME` / `MONGO_EXPRESS_PASSWORD` from `.env`

## Troubleshooting

- If mobile Android emulator cannot reach backend, use `http://10.0.2.2:8080/api`.
- If physical phone cannot reach backend, use the computer LAN IP.
- If protected endpoints return 401, verify Firebase Admin config and frontend Firebase config.
- If company cannot publish offer, approve it from admin backoffice first.
- If AI returns forbidden, upgrade user to premium.


## Payment Demo Confirmation

`POST /api/subscriptions/upgrade` creates a pending payment and does not activate premium immediately. For a local demo, confirm with:

```bash
curl -X POST http://localhost:8080/api/subscriptions/demo-confirm \
  -H "Content-Type: application/json" \
  -H "X-Payment-Secret: $APP_PAYMENT_WEBHOOK_SECRET" \
  -d '{"paymentId":"<payment-id>","status":"PAID"}'
```

Do not use `change-me` in production profiles.
