# Rapport de projet — Interlance

> Projet de fin de module — équipe de **5 personnes**.
> Ce document répond à deux questions :
> 1. Objectif du projet, frameworks, classes et fonctionnalités.
> 2. Ma tâche principale, son intégration au reste du projet et les difficultés rencontrées.

---

## Partie 1 — Présentation détaillée du projet

### 1.1 Objectif général

**Interlance** est une plateforme full-stack qui met en relation des **candidats** (étudiants, jeunes freelances) avec des **recruteurs / entreprises** qui publient des offres de **stage** ou de **mission freelance**.

Le problème de départ : les étudiants et freelances juniors peinent à trouver des opportunités pertinentes, pendant que les recruteurs perdent du temps à filtrer manuellement les candidatures. Les échanges sont éclatés entre e-mail, réseaux sociaux et tableurs, ce qui rend inefficaces la publication des offres, le suivi des candidatures, la validation des entreprises et le matching candidat/offre.

La plateforme centralise tout le cycle :

- publication et gestion des offres (stage / freelance) ;
- candidatures, favoris, profils enrichis (style LinkedIn) ;
- **matching intelligent** offre ↔ candidat (score de compatibilité) ;
- **assistant IA** (style ChatGPT) avec recherche augmentée (RAG) ;
- **monétisation** : abonnement Premium + **paiement de missions freelance** ;
- back-office d'administration (validation des entreprises, modération, analytics) ;
- notifications temps réel.

### 1.2 Acteurs (rôles)

| Acteur | Rôle |
|---|---|
| **Candidat** | Parcourt les offres, postule, gère favoris et profil, passe Premium, utilise l'IA, **reçoit des paiements freelance**. |
| **Recruteur** | Gère son profil et son entreprise, publie des offres, traite les candidatures, **paie les candidats** pour les missions freelance. |
| **Admin** | Valide les entreprises, modère utilisateurs/offres, consulte le tableau de bord (analytics) et les logs. |

### 1.3 Architecture globale

Trois applications + deux services externes :

```text
   Mobile (Expo/React Native)            Back-office (Angular PWA)
   Candidat / Recruteur                   Admin / Recruteur
            |                                      |
            |  Firebase ID token (Bearer)          |  Firebase ID token (Bearer)
            v                                      v
        ┌──────────────────────────────────────────────┐
        │   Spring Boot REST API + Spring Security RBAC  │
        │   (Firebase Admin SDK vérifie le token)        │
        └──────────────────────────────────────────────┘
            |                 |                |
            v                 v                v
         MongoDB          Stripe           n8n / OpenRouter
       (documents)     (paiements)        (RAG + IA matching)
```

**Flux d'authentification** : l'utilisateur se connecte via **Firebase** (email/mot de passe) côté client → le client récupère un **ID token Firebase** → il l'envoie au backend dans l'en-tête `Authorization: Bearer <token>` → un filtre Spring Security vérifie le token avec le **Firebase Admin SDK** → le backend charge l'utilisateur MongoDB via `firebaseUid` → les contrôleurs appliquent le **contrôle d'accès par rôle** (`CANDIDATE`, `RECRUITER`, `ADMIN`).

### 1.4 Technologies / frameworks utilisés

| Couche | Technologies |
|---|---|
| **Backend** | Java 17, **Spring Boot 3.3.5**, Spring Web, Spring Security, **Spring Data MongoDB**, Spring Validation, Spring WebSocket, **Firebase Admin SDK 9.4.1**, **Stripe Java 24.0.0**, Cloudinary, Apache PDFBox / POI (parsing CV), springdoc-openapi (Swagger), Lombok, Maven |
| **Base de données** | **MongoDB** (documents), Mongo Express (admin) |
| **Back-office** | **Angular** (PWA), Angular Material, Firebase Auth, HttpClient |
| **Mobile** | **Expo / React Native** (TypeScript), React Navigation, Firebase Auth, Axios, AsyncStorage, Expo Notifications |
| **IA / RAG** | n8n (workflow webhook), OpenRouter (LLM), RAG sur MongoDB |
| **Déploiement** | Docker Compose, Kubernetes / Minikube, Nginx |

### 1.5 Organisation du code backend (packages & classes)

Le backend suit une architecture en couches classique **Controller → Service → Repository → Model**, avec des **DTO** (souvent des `record` Java) pour les échanges et des **enums** pour les états métier.

```text
com.smartmatch
├── config        # SecurityConfig, OpenAPI, CORS, MongoIndexes...
├── controller    # 19 contrôleurs REST (points d'entrée /api/**)
├── dto           # objets de transfert par domaine (payment, offer, ...)
├── exception     # exceptions métier (NotFound, BadRequest, Forbidden, Conflict)
├── mapper        # conversions entité ↔ DTO
├── model         # documents MongoDB (entités)
│   └── enums     # énumérations métier
├── repository    # interfaces Spring Data MongoDB
├── security      # filtre Firebase, résolution de l'utilisateur courant
├── service       # logique métier (25+ services)
└── util          # SecurityUtils, etc.
```

**Contrôleurs principaux** : `AuthController`, `UserController`, `CandidateProfileController`, `RecruiterProfileController`, `CompanyController`, `OfferController`, `ApplicationController`, `FavoriteController`, `NotificationController`, `ChatController`, `AIController`, `AssistantController`, `SubscriptionController`, **`PaymentController`**, `UploadController`, et les contrôleurs admin (`AdminUserController`, `AdminCompanyController`, `AdminOfferController`, `AdminDashboardController`).

**Modèles (documents MongoDB)** : `User`, `CandidateProfile` (avec `Education`, `Experience`, `Project`, `SkillLevel`, `SocialLinks`), `RecruiterProfile`, `Company`, `Offer`, `Application`, `Favorite`, `Subscription`, **`Payment`**, `Notification`, `Conversation`, `Message`, `AIResult`, `AdminLog`, `Analytics`.

**Enums métier** : `Role`, `Plan`, `OfferType` (STAGE / FREELANCE), `OfferStatus`, `ApplicationStatus`, `ValidationStatus`, `SubscriptionStatus`, `PaymentStatus`, **`PaymentType`**, `NotificationType`, `AIResultType`.

**Collections MongoDB** : `users`, `candidate_profiles`, `recruiter_profiles`, `companies`, `offers`, `applications`, `favorites`, `subscriptions`, `payments`, `notifications`, `ai_results`, `admin_logs`, `analytics`.

### 1.6 Fonctionnalités par rôle

**Candidat** — inscription/connexion, parcours et filtrage des offres, détail d'offre, candidature (une seule par offre), favoris, profil enrichi, passage Premium, recommandations/analyse IA, assistant IA, notifications, **suivi des gains freelance**.

**Recruteur** — profil, création/gestion d'entreprise, création/publication/archivage d'offres (après validation de l'entreprise), traitement des candidatures (changement de statut), assistant IA, **paiement des candidats pour les missions freelance**.

**Admin** — tableau de bord (analytics), gestion des utilisateurs, validation/refus des entreprises, modération des offres, consultation des abonnements et des logs.

### 1.7 Répartition du travail dans l'équipe (5 membres)

Le projet a été découpé en modules fonctionnels. Chaque membre a pris la responsabilité d'un domaine de bout en bout (backend + interface) :

| Membre | Module principal |
|---|---|
| Membre 1 | **Authentification & Utilisateurs** — Firebase Auth, rôles/RBAC, synchronisation des comptes, sécurité (`SecurityConfig`, filtre Firebase). |
| Membre 2 | **Offres, Candidatures & Favoris** — cycle de vie des offres, candidatures, favoris, gestion des entreprises. |
| Membre 3 | **Matching IA & Assistant** — score de compatibilité offre/candidat, assistant IA style ChatGPT, RAG via n8n/OpenRouter, parsing de CV. |
| Membre 4 | **Back-office Admin & Notifications** — tableau de bord Angular, validation des entreprises, modération, analytics, notifications. |
| **Moi (Membre 5)** | **Paiement & Monétisation (Stripe)** — abonnement Premium + paiement des missions freelance, côté backend et mobile. |

> *Le découpage ci-dessus correspond aux grands modules réellement présents dans le code ; adaptez les noms des membres 1 à 4 à votre équipe.*

---

## Partie 2 — Ma tâche : le module Paiement & Monétisation (Stripe)

### 2.1 Objectif de ma partie

J'ai été responsable de **toute la chaîne de paiement** de la plateforme, sur **deux flux distincts** :

1. **Abonnement Premium (`SUBSCRIPTION`)** — un utilisateur (candidat ou recruteur) achète **30 jours de Premium** : `utilisateur → plateforme`.
2. **Paiement freelance (`FREELANCE`)** — un **recruteur paie un candidat** pour une mission freelance liée à une candidature : `recruteur → candidat`.

Les deux flux passent par **Stripe Checkout** (page de paiement hébergée par Stripe), en **mode test**.

### 2.2 Ce que j'ai réalisé

#### Côté backend (Spring Boot)

| Fichier | Rôle |
|---|---|
| [StripeService.java](../smart-match-backend/src/main/java/com/smartmatch/service/StripeService.java) | Cœur de l'intégration Stripe : création des sessions Checkout, confirmation au retour, webhook, passage à l'état `PAID`. |
| [PaymentService.java](../smart-match-backend/src/main/java/com/smartmatch/service/PaymentService.java) | Lecture des paiements (paiements émis, gains reçus), mapping vers DTO avec résolution des noms d'utilisateur et titres d'offre. |
| [PaymentController.java](../smart-match-backend/src/main/java/com/smartmatch/controller/PaymentController.java) | Endpoints REST `/api/payments/**`. |
| [Payment.java](../smart-match-backend/src/main/java/com/smartmatch/model/Payment.java) | Document MongoDB enrichi : `type`, `payerId`, `payeeId`, `stripeSessionId`, `stripePaymentIntentId`, etc. |
| [PaymentType.java](../smart-match-backend/src/main/java/com/smartmatch/model/enums/PaymentType.java) | Nouvel enum `SUBSCRIPTION` / `FREELANCE`. |
| DTO [`FreelancePaymentRequest`](../smart-match-backend/src/main/java/com/smartmatch/dto/payment/FreelancePaymentRequest.java), [`CheckoutSessionResponse`](../smart-match-backend/src/main/java/com/smartmatch/dto/payment/CheckoutSessionResponse.java), [`PaymentResponse`](../smart-match-backend/src/main/java/com/smartmatch/dto/payment/PaymentResponse.java) | Contrats d'échange (records). |
| [SubscriptionService.java](../smart-match-backend/src/main/java/com/smartmatch/service/SubscriptionService.java) | Méthode `activatePaidSubscription(...)` réutilisée par le flux Stripe pour activer 30 jours de Premium. |

**Endpoints REST exposés :**

```http
GET  /api/payments/me                  # paiements que j'ai financés (abonnements + payouts freelance)
GET  /api/payments/earnings            # [CANDIDAT] gains freelance reçus
POST /api/payments/freelance/checkout  # [RECRUTEUR] démarre un Checkout pour payer un candidat
POST /api/payments/subscription/checkout  # démarre un Checkout pour 30 j de Premium
POST /api/payments/{id}/confirm        # re-lit la session Stripe et confirme le paiement
POST /api/payments/stripe/webhook      # webhook Stripe (déploiements joignables par Stripe)
GET  /api/payments/{id}                # détail d'un paiement (avec contrôle de propriété)
```

#### Côté mobile (Expo / React Native)

| Fichier | Rôle |
|---|---|
| [paymentService.ts](../smart-match-mobile/src/services/paymentService.ts) | Client API : `mine()`, `earnings()`, `freelanceCheckout()`, `subscriptionCheckout()`, `confirm()`. |
| [PayCandidateScreen.tsx](../smart-match-mobile/src/screens/recruiter/PayCandidateScreen.tsx) | Écran recruteur : saisie du montant + note, ouverture de Stripe, confirmation automatique au retour. |
| [EarningsScreen.tsx](../smart-match-mobile/src/screens/candidate/EarningsScreen.tsx) | Écran candidat : total reçu + historique des paiements freelance. |
| [PremiumScreen.tsx](../smart-match-mobile/src/screens/candidate/PremiumScreen.tsx) | Achat de l'abonnement Premium via Stripe. |

### 2.3 Le mécanisme de paiement (logique métier)

**Création d'une session Checkout** (`createFreelanceCheckout` / `createSubscriptionCheckout`) :

1. Vérifier que Stripe est configuré (`STRIPE_SECRET_KEY`).
2. Contrôler les règles métier (ex. pour le freelance : l'offre est bien de type `FREELANCE`, le recruteur est bien propriétaire de l'entreprise de l'offre, montant > 0).
3. Créer un `Payment` en base avec le statut `PENDING`.
4. Créer la session Stripe avec le `paymentId` en **métadonnée**, puis renvoyer au client `{ paymentId, sessionId, url }`.

**Confirmation au retour** (`confirmFromStripe`) — détail important expliqué en 2.5 :

```java
Session session = Session.retrieve(payment.getStripeSessionId());
if ("paid".equals(session.getPaymentStatus())) {
    markPaid(payment, session.getPaymentIntent());
}
```

**`markPaid(...)`** — point d'aboutissement commun aux deux flux, **idempotent** :

- ignore si déjà `PAID` (évite la double activation) ;
- passe le paiement à `PAID` + `paidAt` ;
- si `SUBSCRIPTION` → `subscriptionService.activatePaidSubscription(payment)` (active 30 j, passe l'utilisateur en `PREMIUM`, notifie) ;
- si `FREELANCE` → crée une **notification** « Payment received » pour le candidat.

### 2.4 Comment j'ai intégré ma partie au reste du projet

Le module de paiement est **transversal** : il dépend de presque tous les autres modules. Points d'intégration concrets :

- **Module Offres/Candidatures (Membre 2)** : le paiement freelance part d'une `Application` → je remonte à l'`Offer` (vérif. `type == FREELANCE`) puis à la `Company` (vérif. propriété recruteur). J'ai donc consommé `ApplicationRepository`, `OfferRepository`, `CompanyRepository`.
- **Module Auth/Utilisateurs (Membre 1)** : récupération de l'utilisateur courant via `SecurityUtils.currentUser()`, contrôle des rôles avec `@PreAuthorize("hasRole('RECRUITER')")` / `hasRole('CANDIDATE')`, et contrôles de propriété (un utilisateur ne confirme/voit que ses propres paiements).
- **Module Abonnements** : réutilisation de `SubscriptionService.activatePaidSubscription(...)` — au lieu de dupliquer la logique d'activation Premium, le flux Stripe **branche** dessus, ce qui garde une seule source de vérité.
- **Module Notifications (Membre 4)** : à chaque paiement réussi, j'émets une `Notification` (`NotificationType.PAYMENT` / `SUBSCRIPTION`) — j'ai ajouté la valeur `PAYMENT` à l'enum `NotificationType`.
- **Mobile / Navigation** : intégration des écrans dans `RecruiterNavigator` (bouton « Payer » depuis le détail candidat → `PayCandidateScreen`) et `CandidateNavigator` (`EarningsScreen`, `PremiumScreen`). Côté types, ajout des interfaces `Payment` et `CheckoutSession` dans `src/types/index.ts`.
- **Configuration** : variables `smartmatch.stripe.*` dans `application.yml` (clé secrète, webhook, devise, montant Premium, URLs success/cancel) + `SecurityConfig` (route webhook publique, contrôle d'accès des endpoints).

### 2.5 Difficultés rencontrées et solutions

**1. Les webhooks Stripe n'atteignent pas `localhost`.**
En production, Stripe notifie le backend via un webhook quand le paiement réussit. Mais en démo, le backend tourne en local : Stripe ne peut pas joindre `localhost`. J'ai donc mis en place un **double mécanisme** : un endpoint webhook (`/stripe/webhook`) pour les environnements déployés, **et** une confirmation côté client (`confirmFromStripe`) qui **re-lit la session Stripe** au retour de l'utilisateur sur l'app. Sur mobile, `PayCandidateScreen` déclenche cette confirmation automatiquement grâce à `useFocusEffect` (quand l'écran reprend le focus après le navigateur).

**2. Garantir l'idempotence (pas de double activation/paiement).**
Webhook **et** confirmation client peuvent se déclencher pour le même paiement. La méthode `markPaid` commence donc par `if (status == PAID) return;`, et `activatePaidSubscription` est sûre à rejouer. Sans ça, un utilisateur aurait pu obtenir 60 jours de Premium pour un seul achat.

**3. Sécurité : empêcher de payer/confirmer à la place d'un autre.**
J'ai ajouté des contrôles de propriété stricts : un recruteur ne peut payer que pour **ses propres** offres (vérif. `company.getRecruiterId().equals(recruiter.getId())`), et seul le payeur (ou un admin) peut confirmer/consulter un paiement. La signature du webhook est vérifiée via `Webhook.constructEvent(...)` avec le secret Stripe.

**4. Conversion des montants.**
Stripe attend les montants en **plus petite unité** (centimes) sous forme d'entier. J'ai converti le `BigDecimal` proprement : `amount.movePointRight(2).setScale(0, HALF_UP).longValueExact()`, pour éviter les erreurs d'arrondi sur les sommes en virgule.

**5. Compatibilité ascendante avec les anciens paiements.**
Le modèle `Payment` existait déjà (abonnements simulés via `SubscriptionService`) avec un champ `userId` mais sans `type` ni `payeeId/payerId`. J'ai étendu le document sans casser l'existant : `type == null` est traité comme `SUBSCRIPTION`, et `payerId` retombe sur `userId` quand il est absent (`toResponse` et `markPaid` gèrent les deux cas).

**6. Cohérence entre deux flux de paiement dans un même modèle.**
Plutôt que deux entités séparées, j'ai unifié abonnement et freelance dans `Payment` via l'enum `PaymentType`, avec des champs optionnels (`payeeId`, `offerId`, `applicationId` pour le freelance ; `subscriptionId` pour l'abonnement). Cela simplifie les écrans « mes paiements » et la maintenance, au prix de quelques champs nullable bien documentés.

**7. Contraintes d'environnement (build).**
Le proxy Maven du laboratoire étant hors service, la compilation locale passait par un contournement ; la validation s'est faite principalement via `docker compose up -d --build` (les images de base disposent du réseau).

### 2.6 Tests et vérification

- Paiements testés en **mode test Stripe** avec la carte `4242 4242 4242 4242`.
- Scénario freelance : recruteur → détail candidat → « Payer » → montant → Stripe → retour app → confirmation auto → notification reçue côté candidat → apparition dans `EarningsScreen`.
- Scénario abonnement : `PremiumScreen` → Stripe → retour → utilisateur passé `PREMIUM` 30 jours.
- Tests unitaires existants sur `SubscriptionService` mis à jour pour couvrir l'activation déclenchée par le paiement.

---

## Conclusion

Ce projet m'a permis de mettre en œuvre une **intégration de paiement réelle** (Stripe Checkout) au sein d'une architecture full-stack (Spring Boot + MongoDB + React Native), en gérant des problématiques concrètes de **sécurité**, d'**idempotence** et d'**intégration inter-modules**. Ma partie, bien que ciblée sur la monétisation, touche à presque tous les autres modules (auth, offres, candidatures, abonnements, notifications), ce qui a exigé une bonne coordination avec le reste de l'équipe.
