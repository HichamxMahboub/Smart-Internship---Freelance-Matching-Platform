# Réponses d'examen — Projet Interlance (équipe de 5)

## Réponse 1 — Objectif du projet, frameworks et fonctionnalités

**Interlance** est une plateforme full-stack qui met en relation des **candidats** (étudiants, freelances) et des **recruteurs** publiant des offres de **stage** ou de **mission freelance**. L'objectif est de centraliser tout le cycle (publication d'offres, candidatures, favoris, matching intelligent, paiement, administration) qui était auparavant éclaté entre e-mails et tableurs.

**Trois acteurs :** Candidat, Recruteur, Admin (contrôle d'accès par rôle).

**Architecture :** une application **mobile (Expo / React Native)** et un **back-office (Angular PWA)** communiquent avec un **backend Spring Boot** via un **token Firebase** (`Bearer`). Le backend persiste dans **MongoDB**, délègue les paiements à **Stripe** et l'IA à **n8n** (RAG + matching).

**Frameworks / technologies :**
- Backend : Java 17, **Spring Boot 3.3.5** (Web, Security, Data MongoDB, Validation), **Firebase Admin SDK**, Stripe, Maven.
- Base de données : **MongoDB**.
- Back-office : **Angular** + Angular Material.
- Mobile : **Expo / React Native** (TypeScript).
- IA : **n8n** + **OpenRouter / Gemini**.

**Architecture en couches** (backend) : `Controller → Service → Repository → Model`, avec des **DTO** et des **enums**. Principales entités : `User`, `Offer`, `Application`, `Company`, `Subscription`, `Payment`, `Notification`, `Analytics`.

**Fonctionnalités principales :** authentification Firebase + RBAC ; gestion des offres et candidatures ; favoris et profils enrichis ; **matching IA** (score de compatibilité) ; **assistant IA** ; **abonnement Premium + paiement freelance** ; **tableau de bord admin** (analytics, validation, modération).

---

## Réponse 2 — Ma tâche et son intégration

Ma partie : **le tableau de bord administrateur + le moteur RAG (n8n) + l'assistant IA (n8n & Spring)**.

**1. Dashboard Admin.** J'ai développé `AdminDashboardController` et `AdminDashboardService` (endpoints `/api/admin/dashboard`, `/subscriptions`, `/notifications`, `/logs`, réservés à l'admin). Ils agrègent les volumes (utilisateurs, offres, candidatures, Premium, entreprises en attente…), calculent les **revenus** (CA total, CA du mois, **MRR**, courbe 6 mois) et sauvegardent un instantané `Analytics`. Côté Angular, le `DashboardComponent` affiche les cartes métriques.

**2. RAG sous n8n.** J'ai construit le workflow **Interlance RAG Assistant** : `Webhook → agrégat MongoDB ($unionWith de toutes les collections) → nœud Code qui bâtit un « snapshot » texte → LLM (OpenRouter) → réponse`. Le LLM répond **uniquement à partir des données réelles** de la plateforme (anti-hallucination). J'ai ajouté deux workflows de **matching** (candidat↔offre) scorés par Gemini.

**3. Assistant IA (Spring).** `AssistantController` / `AssistantService` servent de **proxy** sécurisé entre le back-office et n8n (n8n reste interne). Selon la question, une **regex d'intention** route vers le chat RAG ou vers le scoring de CV. La réponse renvoie le texte + les `sources`.

**Intégration au projet :** ma partie est **transversale** — le dashboard lit les données de tous les modules (le calcul des revenus dépend du module Paiement), et le RAG lit directement les collections MongoDB produites par les autres modules (couplage lâche via le schéma partagé). Tous les endpoints sont protégés par rôle (`@PreAuthorize`).

**Difficultés rencontrées :**
- **RAG sans base vectorielle** → agrégat `$unionWith` pour construire un contexte texte (RAG léger).
- **Réponses n8n hétérogènes** (objet/tableau/wrapper) → parsing défensif sondant plusieurs clés.
- **Hallucinations du LLM** → prompt strict « répondre uniquement depuis le snapshot » + `temperature` basse.
- **Quotas/latence des modèles gratuits** → historique limité, timeout 120 s, messages de repli.
- **Réseau Docker vs hôte** → URLs séparées (`n8n:5678` côté Spring), n8n non exposé publiquement.
- **Calcul des revenus** sur paiements hétérogènes → filtres null-safe, regroupement mensuel en UTC.
