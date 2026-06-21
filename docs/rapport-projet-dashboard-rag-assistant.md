# Rapport de projet — Smart Internship & Freelance Matching Platform (Interlance)

> Projet de fin de module — équipe de **5 personnes**.
> Ce document répond à deux questions :
> 1. Objectif du projet, frameworks, classes et fonctionnalités.
> 2. Ma tâche principale — **Dashboard Admin + RAG sous n8n + Assistant IA (n8n & Spring)** — son intégration au reste du projet et les difficultés rencontrées.

---

## Partie 1 — Présentation détaillée du projet

### 1.1 Objectif général

**Interlance** est une plateforme full-stack qui met en relation des **candidats** (étudiants, jeunes freelances) avec des **recruteurs / entreprises** qui publient des offres de **stage** ou de **mission freelance**.

Le problème de départ : les étudiants et freelances juniors peinent à trouver des opportunités pertinentes, pendant que les recruteurs perdent du temps à filtrer manuellement les candidatures. Les échanges sont éclatés entre e-mail, réseaux sociaux et tableurs. La plateforme **centralise** tout le cycle : publication des offres, candidatures, favoris, profils enrichis, **matching intelligent**, **assistant IA**, monétisation (Premium + paiement freelance), back-office d'administration et notifications.

### 1.2 Acteurs (rôles)

| Acteur | Rôle |
|---|---|
| **Candidat** | Parcourt les offres, postule, gère favoris et profil, passe Premium, utilise l'IA (recommandations, assistant). |
| **Recruteur** | Gère son profil et son entreprise, publie des offres, traite les candidatures, utilise l'assistant IA et le matching. |
| **Admin** | Valide les entreprises, modère utilisateurs/offres, consulte le **tableau de bord (analytics)**, les abonnements, les notifications et les logs. |

### 1.3 Architecture globale

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
            |                 |                       |
            v                 v                       v
         MongoDB          Stripe              n8n (RAG + matching)
       (documents)     (paiements)           └─> OpenRouter / Gemini (LLM)
```

**Flux d'authentification** : connexion via **Firebase** côté client → récupération d'un **ID token Firebase** → envoi au backend dans `Authorization: Bearer <token>` → un filtre Spring Security vérifie le token avec le **Firebase Admin SDK** → chargement de l'utilisateur MongoDB via `firebaseUid` → **contrôle d'accès par rôle** (`CANDIDATE`, `RECRUITER`, `ADMIN`).

### 1.4 Technologies / frameworks utilisés

| Couche | Technologies |
|---|---|
| **Backend** | Java 17, **Spring Boot 3.3.5**, Spring Web, Spring Security, **Spring Data MongoDB**, Spring Validation, Spring WebSocket, **Firebase Admin SDK 9.4.1**, Stripe Java, Cloudinary, Apache PDFBox / POI (parsing CV), springdoc-openapi (Swagger), Lombok, Maven |
| **Base de données** | **MongoDB** (documents), Mongo Express |
| **Back-office** | **Angular** (PWA, standalone components), Angular Material, Firebase Auth, HttpClient, RxJS |
| **Mobile** | **Expo / React Native** (TypeScript), React Navigation, Firebase Auth, Axios |
| **IA / RAG** | **n8n** (workflows webhook), **OpenRouter** (DeepSeek), **Gemini 2.5 Flash** (matching) |
| **Déploiement** | Docker Compose, Kubernetes / Minikube, Nginx |

### 1.5 Organisation du code backend (packages & classes)

Architecture en couches **Controller → Service → Repository → Model**, avec des **DTO** (`record` Java) et des **enums** pour les états métier.

```text
com.smartmatch
├── config        # SecurityConfig, OpenAPI, CORS, index Mongo...
├── controller    # 19 contrôleurs REST (/api/**)
├── dto           # objets de transfert par domaine (admin, assistant, ...)
├── exception     # exceptions métier (NotFound, BadRequest, Forbidden, Conflict)
├── mapper        # conversions entité ↔ DTO
├── model         # documents MongoDB (entités) + enums
├── repository    # interfaces Spring Data MongoDB
├── security      # filtre Firebase, utilisateur courant
├── service       # logique métier (25+ services)
└── util          # SecurityUtils, etc.
```

**Contrôleurs** : `AuthController`, `UserController`, `CandidateProfileController`, `RecruiterProfileController`, `CompanyController`, `OfferController`, `ApplicationController`, `FavoriteController`, `NotificationController`, `ChatController`, `AIController`, **`AssistantController`**, `SubscriptionController`, `PaymentController`, `UploadController`, et les contrôleurs admin (`AdminUserController`, `AdminCompanyController`, `AdminOfferController`, **`AdminDashboardController`**).

**Modèles (documents MongoDB)** : `User`, `CandidateProfile`, `RecruiterProfile`, `Company`, `Offer`, `Application`, `Favorite`, `Subscription`, `Payment`, `Notification`, `Conversation`, `Message`, `AIResult`, `AdminLog`, **`Analytics`**.

**Enums** : `Role`, `Plan`, `OfferType`, `OfferStatus`, `ApplicationStatus`, `ValidationStatus`, `SubscriptionStatus`, `PaymentStatus`, `PaymentType`, `NotificationType`, `AIResultType`.

### 1.6 Répartition du travail dans l'équipe (5 membres)

| Membre | Module principal |
|---|---|
| Membre 1 | **Authentification & Utilisateurs** — Firebase Auth, rôles/RBAC, sécurité. |
| Membre 2 | **Offres, Candidatures & Favoris** — cycle de vie des offres, candidatures, entreprises. |
| Membre 3 | **Analyse IA des profils** — analyse de CV, recommandations, parsing de CV (PDFBox/POI), `AiMatchingClient`/`AIService`. |
| Membre 4 | **Paiement & Monétisation (Stripe)** — abonnement Premium + paiement des missions freelance. |
| **Moi (Membre 5)** | **Dashboard Admin + RAG (n8n) + Assistant IA (n8n & Spring)** — analytics back-office et IA conversationnelle/matching. |

> *Adaptez les noms des membres 1 à 4 à votre équipe ; le découpage correspond aux modules réellement présents dans le code.*

---

## Partie 2 — Ma tâche : Dashboard Admin + RAG (n8n) + Assistant IA

Ma contribution couvre **trois briques complémentaires** :

1. **Le tableau de bord administrateur** (analytics, revenus, abonnements, notifications, logs).
2. **Le moteur RAG** (Retrieval-Augmented Generation) implémenté dans **n8n**.
3. **L'assistant IA** exposé côté Spring (proxy) et consommé par le back-office Angular, plus le **matching IA** candidat ↔ offre.

### 2.A — Le tableau de bord administrateur

#### Objectif
Donner à l'admin une vue temps réel de la plateforme : volumes (utilisateurs, offres, candidatures…), **revenus** (total, mois courant, MRR estimé, courbe 6 mois), abonnements, boîte de notifications globale et journal d'audit.

#### Réalisation — Backend
| Fichier | Rôle |
|---|---|
| [AdminDashboardController.java](../smart-match-backend/src/main/java/com/smartmatch/controller/AdminDashboardController.java) | Endpoints `/api/admin/**`, sécurisés `@PreAuthorize("hasRole('ADMIN')")`. |
| [AdminDashboardService.java](../smart-match-backend/src/main/java/com/smartmatch/service/AdminDashboardService.java) | Agrégation des statistiques, calcul des revenus/MRR, vue des abonnements et notifications. |
| [Analytics.java](../smart-match-backend/src/main/java/com/smartmatch/model/Analytics.java) | Document MongoDB stockant un **instantané** (snapshot) des chiffres clés. |
| DTO `AdminDashboardResponse`, `SubscriptionRevenueSummary`, `RevenueMonthPoint`, `AdminSubscriptionsOverviewResponse`, `AdminNotificationsOverviewResponse`, `NotificationInboxSummary`, `AdminLogResponse` | Contrats d'échange. |

**Endpoints exposés :**
```http
GET /api/admin/dashboard       # totaux + snapshot Analytics
GET /api/admin/subscriptions   # revenus (total, mois, MRR, courbe 6 mois) + liste des abonnements
GET /api/admin/notifications   # boîte globale + compteurs par type
GET /api/admin/logs            # journal d'audit admin
```

**Logique clé :**
- `getDashboard()` calcule les volumes (`countByRole`, `countByPlan`, `countByValidationStatus`, `countByStatus`…) et **sauvegarde un `Analytics`** horodaté à chaque appel.
- `getSubscriptionsOverview()` ne retient que les paiements `PAID`, calcule **chiffre d'affaires total**, **CA du mois**, **MRR estimé** (`99 × abonnements actifs`) et construit une **courbe de revenus sur 6 mois** (regroupement par `YearMonth` en `ZoneOffset.UTC`).
- `getNotificationsOverview()` produit des compteurs par `NotificationType` (APPLICATION, OFFER, SUBSCRIPTION, AI, ADMIN).

#### Réalisation — Front-office Angular
| Fichier | Rôle |
|---|---|
| [dashboard.component.ts](../smart-match-backoffice/src/app/pages/dashboard/dashboard.component.ts) | Cartes métriques, indicateurs dérivés (`premiumShare`, `reviewQueue`, `activeOpportunities`). |
| [dashboard.service.ts](../smart-match-backoffice/src/app/core/services/dashboard.service.ts) | Appels HTTP vers `/api/admin/**`. |
| [admin-dashboard.model.ts](../smart-match-backoffice/src/app/core/models/admin-dashboard.model.ts) | Typage TypeScript des réponses. |

10 cartes (utilisateurs, candidats, recruteurs, offres, candidatures, Premium, entreprises, entreprises en attente, offres publiées, candidatures en attente) + indicateurs synthétiques (part de Premium, file de revue, opportunités actives).

### 2.B — Le moteur RAG dans n8n

#### Qu'est-ce que le RAG ici ?
RAG = **Retrieval-Augmented Generation** : on **récupère** d'abord les données réelles de la plateforme depuis MongoDB, on les injecte comme **contexte** dans le prompt, puis le **LLM génère** une réponse **fondée uniquement sur ces données** (et non sur ses connaissances générales). Cela évite les hallucinations et permet de citer de vraies entreprises, offres, candidats et chiffres.

#### Le workflow « Interlance RAG Assistant »
Construit et déployé dans n8n via le script [n8n-build-workflow.mjs](../smart-match-backend/deployment/n8n-build-workflow.mjs) (création par l'API REST n8n) :

```text
Webhook(interlance-assistant)
   → MongoDB aggregate ($unionWith sur companies, offers, applications,
                        candidate_profiles, ai_results, users — tagués par __c)
   → Code "Build Context"  (aplatit tout en un SNAPSHOT texte + construit les messages)
   → HTTP OpenRouter       (modèle DeepSeek gratuit, temperature 0.2, max_tokens 800)
   → Code "Format Response"
   → Respond (JSON {answer, sources})
```

Détails marquants :
- **Récupération en une seule requête** : un `aggregate` sur `companies` qui `$unionWith` toutes les collections, chaque document étant étiqueté par `__c` (sa collection d'origine). C'est un RAG « léger » **sans base vectorielle** — adapté à la taille de la démo.
- **Build Context** reconstruit les relations (offres ↔ entreprises, candidatures ↔ offres ↔ utilisateurs, profils ↔ `ai_results`) et produit un *« PLATFORM SNAPSHOT »* lisible.
- **Ancrage anti-hallucination** : prompt système strict *« Answer ONLY from the PLATFORM SNAPSHOT below »*, `temperature: 0.2`, historique limité aux **6 derniers tours**.
- La réponse renvoie aussi `sources` (les collections réellement utilisées), affichées dans l'UI.

#### Les workflows de matching IA
En complément, [n8n-build-match-workflows.mjs](../smart-match-backend/deployment/n8n-build-match-workflows.mjs) déploie **deux workflows scorés par Gemini 2.5 Flash** :
- `interlance-candidate-match` : `{candidateId}` → **offres classées** pour ce candidat ;
- `interlance-recruiter-match` : `{offerId}` → **candidats classés** pour cette offre.

Chacun : `Webhook → agrégats Mongo enrichis (offres publiées + profils candidats) → prompt de scoring → Gemini (JSON) → Respond {matches:[{score, reasons, gaps}]}`. Un troisième workflow gère le **scoring de CV** (`interlance-cv-score`).

### 2.C — L'assistant IA côté Spring

Le back-office Angular ne parle **jamais** directement à n8n : Spring sert de **proxy** sécurisé. n8n reste **interne** au réseau Docker.

| Fichier | Rôle |
|---|---|
| [AssistantController.java](../smart-match-backend/src/main/java/com/smartmatch/controller/AssistantController.java) | Endpoints `/api/assistant/**`. |
| [AssistantService.java](../smart-match-backend/src/main/java/com/smartmatch/service/AssistantService.java) | Proxy `RestClient` vers les webhooks n8n + routage d'intention + parsing robuste. |
| DTO [`AssistantChatRequest`](../smart-match-backend/src/main/java/com/smartmatch/dto/assistant/AssistantChatRequest.java), [`AssistantChatResponse`](../smart-match-backend/src/main/java/com/smartmatch/dto/assistant/AssistantChatResponse.java), `MatchItem` | Contrats (question/historique/sessionId ; réponse + `thinking` + `sources`). |
| [assistant.component.ts](../smart-match-backoffice/src/app/pages/assistant/assistant.component.ts) | UI de chat **style Claude** (bloc de raisonnement repliable, sources). |

**Endpoints exposés :**
```http
POST /api/assistant/chat              # [ADMIN, RECRUITER] question RAG (chat ou scoring)
GET  /api/assistant/candidate-matches # [CANDIDATE]  offres recommandées (Gemini)
GET  /api/assistant/recruiter-matches?offerId=...  # [RECRUITER] candidats recommandés
```

**Routage d'intention** : `AssistantService.chat()` détecte via une **regex** (`SCORING_INTENT`) si la question relève du *scoring/ranking de CV*. Si oui → webhook `interlance-cv-score`, sinon → webhook RAG de chat. Le **parsing est tolérant** (n8n peut renvoyer un objet, un tableau, ou un wrapper `json` ; on sonde plusieurs clés : `answer`, `output`, `text`, `response`, `message`). En cas d'échec, un message de repli clair est renvoyé.

### 2.D — Intégration au reste du projet

- **Dashboard ↔ tous les modules** : `AdminDashboardService` lit `users`, `offers`, `applications`, `companies`, `subscriptions`, `payments`, `notifications`, `admin_logs`. Le calcul des **revenus** dépend directement du **module Paiement (Membre 4)** : coordination sur le format des `Payment` (statut `PAID`, montant, devise, `paidAt`).
- **Assistant ↔ Auth/Rôles (Membre 1)** : tous les endpoints sont protégés par `@PreAuthorize` (ADMIN/RECRUITER/CANDIDATE) et utilisent `SecurityUtils.currentUser()`.
- **RAG ↔ données métier (Membres 1-2-3)** : n8n lit directement les collections produites par les autres modules (offres, candidatures, profils, `ai_results`). Couplage **lâche** : aucune dépendance de code, uniquement le schéma MongoDB partagé.
- **Spring ↔ n8n** : configuration par variables `smartmatch.assistant.*` (URLs des webhooks, timeout) ; en Docker, n8n est joignable sur `http://n8n:5678`. Le back-office Angular appelle Spring, qui appelle n8n.
- **Front-office** : la page Assistant et le Dashboard sont intégrés à la navigation Angular (routes protégées par rôle).

### 2.E — Difficultés rencontrées et solutions

**1. Faire du RAG sans base vectorielle.**
Pas d'infrastructure d'*embeddings* pour la démo. Solution : un **agrégat `$unionWith`** qui rassemble toutes les collections en une requête, puis un nœud *Code* qui construit un « snapshot » texte. RAG léger mais suffisant pour un volume académique.

**2. Réponses n8n hétérogènes.**
Selon le nœud terminal, n8n renvoie tantôt un objet, tantôt un tableau, tantôt un wrapper `{json:{…}}`, avec des clés variables. J'ai écrit un `parse()` **défensif** qui déballe le tableau/`json` et sonde plusieurs clés candidates avant de retomber sur le texte brut.

**3. Hallucinations du LLM.**
Risque que le modèle invente des chiffres. Solution : prompt système strict (*répondre uniquement depuis le snapshot*), `temperature: 0.2`, et renvoi des `sources` pour la traçabilité.

**4. Budget de tokens et latence des modèles gratuits.**
Modèles gratuits = quotas et lenteurs. Solution : limiter l'historique aux **6 derniers tours**, `max_tokens` raisonnable (800), **timeout de 120 s** côté `RestClient`, et messages de repli explicites en cas d'indisponibilité.

**5. Routage chat vs scoring.**
Une seule entrée `/chat` mais deux workflows derrière. Solution : heuristique **regex d'intention** (`scor`, `rank`, `shortlist`, `cv`, `best profile`…) pour aiguiller vers le bon webhook.

**6. Réseau Docker vs hôte.**
Les scripts de build n8n s'exécutent depuis l'hôte (`localhost:5678`) alors que Spring joint n8n par le nom de service Docker (`n8n:5678`). J'ai séparé les URLs : configuration Spring d'un côté, scripts de déploiement de l'autre. n8n reste **non exposé publiquement** (seul Spring l'appelle).

**7. Calcul des revenus / MRR sur des paiements hétérogènes.**
Certains anciens paiements ont des champs nuls (devise/`paidAt`). Solution : filtres `null-safe`, repli sur `createdAt` quand `paidAt` manque, regroupement mensuel en `ZoneOffset.UTC`, et **snapshots `Analytics` idempotents** à chaque appel.

**8. Déploiement des workflows n8n.**
Création/maj des workflows automatisée via l'**API REST n8n** (scripts `.mjs`), avec gestion des **credentials** (Mongo, OpenRouter, Gemini). L'environnement de build Maven étant indisponible au labo, la validation s'est faite via `docker compose up -d --build`.

### 2.F — Tests et vérification
- Dashboard testé avec données seed : cohérence des totaux, de la courbe de revenus et des compteurs de notifications.
- Assistant testé sur questions analytiques (*« combien d'offres freelance publiées ? »*, *« quels candidats correspondent le mieux à l'offre X ? »*) → réponses citant de vrais noms/chiffres + `sources`.
- Matching candidat/recruteur vérifié sur des profils réels (scores 0-100 + raisons/écarts cohérents).

---

## Conclusion

Ma partie relie la **donnée** et l'**intelligence** de la plateforme : un **tableau de bord** qui agrège l'activité de tous les modules, et un **assistant IA fondé sur du RAG** (n8n + MongoDB + LLM) exposé proprement via Spring. Ces briques sont **transversales** : elles consomment les données de presque tous les autres modules, ce qui a demandé une bonne coordination d'équipe (schéma MongoDB partagé, format des paiements pour les revenus, rôles de sécurité). Les principaux défis ont été l'**ancrage du LLM** (anti-hallucination), la **robustesse de l'intégration n8n** et le **calcul fiable des indicateurs** business.
