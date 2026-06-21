# Interlance — Diagrammes de conception et design patterns

Ce document relie les choix de conception du projet aux classes et modules réellement présents. Les diagrammes rendus sont dans `Conception/Diagrammes/`; leurs sources éditables sont dans `Conception/Mermaid/`.

## Architecture en couches

Le backend suit une séparation **Controller → Service → Repository → Model**. Un contrôleur reçoit la requête HTTP et réalise la validation d’entrée. Le service porte les règles métier, les contrôles de propriété et l’orchestration. Le repository isole l’accès MongoDB. Les modèles représentent les documents persistés. Les DTO séparent le contrat API des modèles de stockage.

Exemple : `OfferController` reçoit les appels `/api/offers`, `OfferService` applique les règles de publication, `OfferRepository` exécute les requêtes MongoDB et `Offer` représente le document. `OfferRequest` et `OfferResponse` évitent d’exposer directement la structure interne.

## Repository Pattern

Les interfaces Spring Data comme `UserRepository`, `OfferRepository`, `ApplicationRepository` et `PaymentRepository` encapsulent les accès à MongoDB. Le service utilise des méthodes métier telles que la recherche par utilisateur, par offre ou par statut, sans écrire les requêtes de persistence dans les contrôleurs.

Ce pattern simplifie les tests unitaires : un service peut recevoir un repository mocké, sans démarrer MongoDB.

## DTO Pattern

Les objets de transfert (`dto/`) définissent les données acceptées et retournées par l’API. Ils limitent les champs manipulés par le client et rendent les contrats Swagger plus lisibles.

Exemples : `ApplicationRequest`, `ApplicationResponse`, `CandidateProfileRequest`, `SubscriptionUpgradeResponse`, `PaymentResponse` et `AIResultResponse`.

## Dependency Injection

Spring injecte les dépendances dans les contrôleurs et services avec des constructeurs générés par `@RequiredArgsConstructor`. Une classe déclare ce dont elle dépend et ne crée pas elle-même ses repositories ou adaptateurs externes.

Exemple : `SubscriptionService` reçoit les repositories, `NotificationService` et `PaymentService`. La configuration reste centralisée et les tests peuvent substituer des mocks.

## Filter / Interceptor Pattern

`FirebaseAuthenticationFilter` est exécuté une fois par requête. En production, il vérifie un token Firebase Bearer puis place l’utilisateur local dans le contexte Spring Security. En Docker local, lorsque `APP_DEMO_AUTH_ENABLED=true`, il accepte l’identité de démo transmise par les clients et charge l’utilisateur seed correspondant.

Les clients utilisent aussi un interceptor : le mobile Axios et le backoffice Angular ajoutent soit le token Firebase, soit l’en-tête de démo, avant chaque appel API.

## Adapter Pattern pour services externes

Les services suivants jouent le rôle d’adaptateurs :

- `AssistantService` isole les appels aux workflows n8n.
- `AiMatchingClient` encapsule les appels OpenRouter et le format des réponses de matching.
- `CloudinaryStorageService` encapsule l’upload, la signature et les dossiers Cloudinary.
- `FirebaseTokenVerifier` fournit une abstraction avec une implémentation Firebase Admin et une implémentation désactivée lorsque Firebase n’est pas configuré.
- `StripeService` encapsule Stripe Checkout et les webhooks de paiement.

Le reste du code dépend de ces services métier, pas des SDK externes directement. La démo continue ainsi à fonctionner lorsque les intégrations optionnelles ne sont pas configurées.

## REST API Pattern

Les ressources sont exposées sous `/api/**` avec les verbes HTTP adaptés : `GET` pour consulter, `POST` pour créer ou déclencher une action, `PUT` pour remplacer une ressource, `PATCH` pour une transition d’état et `DELETE` pour archiver ou supprimer selon la règle métier. Swagger/OpenAPI rend ce contrat navigable.

## Notifications : approche événementielle légère

Le projet n’emploie pas un bus d’événements distribué. En revanche, les services métier déclenchent des notifications après des événements fonctionnels : candidature, validation d’entreprise, activation Premium, paiement ou résultat de matching. `NotificationService` centralise cette réaction ; le mécanisme se rapproche de l’idée Observer sans être une implémentation formelle du pattern.

## Sources des diagrammes

- `Conception/Mermaid/architecture-globale.mmd`
- `Conception/Mermaid/cas-utilisation.mmd`
- `Conception/Mermaid/diagramme-classes.mmd`
- `Conception/Mermaid/schema-mongodb.mmd`
- `Conception/Mermaid/sequence-demo.mmd`
