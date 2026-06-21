# Interlance — Flux Premium et paiement

## Rôle de l’abonnement Premium

L’abonnement Premium ouvre notamment l’accès aux fonctions IA : analyse de CV, recommandations d’offres, optimisation de profil et recommandations de candidats selon le rôle. Un compte reste `FREE` tant qu’un paiement n’est pas confirmé.

## Entités concernées

| Entité | Rôle |
|---|---|
| `User` | Porte le plan courant (`FREE` ou `PREMIUM`). |
| `Subscription` | Porte le plan, l’état (`PENDING`, `ACTIVE`, `CANCELLED`), l’activité et les dates de validité. |
| `Payment` | Trace le montant, la devise, la méthode, le statut et le lien vers la souscription. Il peut aussi porter un paiement de mission freelance. |

## Flux de souscription standard

1. Le candidat ou recruteur demande l’upgrade via `POST /api/subscriptions/upgrade`.
2. Le backend crée une `Subscription` `PENDING`, inactive, et un `Payment` `PENDING`.
3. Le paiement est confirmé soit par le webhook de démonstration sécurisé, soit par le flux Stripe configuré.
4. Quand le statut reçu est `PAID`, le backend active la souscription pour 30 jours, passe le `User.plan` à `PREMIUM` et crée une notification.

En cas de paiement `FAILED` ou `REFUNDED`, la souscription en attente est annulée. Le traitement est idempotent : un paiement déjà `PAID` n’active pas une seconde fois le même abonnement.

## Statut de l’intégration Stripe

Stripe est **réellement préparé et intégrable**, mais il reste optionnel : aucune clé Stripe n’est fournie par le dépôt.

- Avec `STRIPE_SECRET_KEY`, `POST /api/payments/subscription/checkout` crée une session Stripe Checkout.
- Au retour du navigateur, `POST /api/payments/{id}/confirm` relit la session Stripe et active le paiement uniquement si Stripe indique qu’elle est payée.
- Pour un environnement public, `POST /api/payments/stripe/webhook` accepte les événements Stripe et vérifie leur signature avec `STRIPE_WEBHOOK_SECRET`.
- Le même module permet un paiement de mission freelance par un recruteur vers un candidat lié à une candidature ; ce flux est distinct de l’abonnement Premium.

Sans clé Stripe, les endpoints Checkout refusent proprement la demande : le paiement en ligne n’est alors pas actif.

## Demo Mode

Le mode de démonstration est **simulé mais sécurisé par un secret côté serveur** :

1. L’application appelle `/api/subscriptions/upgrade` et reçoit les identifiants de la souscription et du paiement en attente.
2. L’opérateur de démo confirme le paiement avec `POST /api/subscriptions/demo-confirm` ou `/api/subscriptions/webhook/payment`.
3. La requête contient le header `X-Payment-Secret` et un corps avec `paymentId` et `status: "PAID"`.
4. Le compte devient Premium uniquement après cette confirmation.

Le secret ne doit jamais être affiché dans une capture, ajouté à un client mobile/web, commité, ni remplacé par une valeur par défaut en production.

## Variables d’environnement

| Variable | Usage |
|---|---|
| `APP_PAYMENT_WEBHOOK_SECRET` | Obligatoire pour la confirmation webhook ou Demo Mode. |
| `STRIPE_SECRET_KEY` | Active la création de sessions Stripe Checkout. |
| `STRIPE_WEBHOOK_SECRET` | Vérifie la signature des événements Stripe. |
| `STRIPE_CURRENCY` | Devise Stripe par défaut. |
| `STRIPE_PREMIUM_AMOUNT` | Montant Premium Stripe. |
| `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` | URLs de retour de Checkout. |

Les valeurs sont injectées dans `application.yml` via l’environnement. Utiliser des secrets de plateforme, Docker/Kubernetes Secrets ou un gestionnaire de secrets ; ne pas ajouter de clés réelles dans Git.

## Démonstration recommandée

- Montrer un compte Premium déjà actif issu du seeder pour accéder immédiatement à l’IA.
- Pour montrer le cycle de paiement, créer une demande en attente, confirmer depuis un terminal hors écran avec le secret, puis rafraîchir l’état Premium et les notifications.
- Présenter Stripe comme une intégration en mode test à configurer, pas comme un paiement réel prêt pour la production académique.
