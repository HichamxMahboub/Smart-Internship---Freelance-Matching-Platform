# Architecture

## Components

The platform is composed of three main applications and two external services:

- **Mobile app**: Expo React Native app used by candidates and recruiters.
- **Backoffice**: Angular PWA used by admins and recruiters.
- **Backend**: Spring Boot REST API exposing business modules and security rules.
- **MongoDB**: document database storing users, profiles, offers, applications and analytics.
- **Firebase Authentication**: identity provider for email/password authentication.

## Request Flow

1. User signs in with Firebase from mobile or backoffice.
2. Frontend receives a Firebase ID token.
3. Frontend sends API requests to Spring Boot with `Authorization: Bearer <firebase_id_token>`.
4. Backend Firebase filter validates the token using Firebase Admin SDK.
5. Backend loads the local user from MongoDB using `firebaseUid`.
6. Controllers and services execute business rules based on `CANDIDATE`, `RECRUITER` or `ADMIN` role.
7. Data is persisted in MongoDB and responses are returned as DTOs.

## Role-Based Access Control

- Public users can list and view published offers.
- Candidates can manage candidate profile, applications, favorites, subscriptions, AI features and notifications.
- Recruiters can manage company, recruiter profile, offers and received applications.
- Admins can validate companies, manage users, moderate offers, view analytics, subscriptions and logs.

## Deployment View

Docker Compose runs MongoDB, backend, backoffice and Mongo Express. Kubernetes manifests are provided for Minikube using a namespace, MongoDB service, backend service, ConfigMap and Secret example.
