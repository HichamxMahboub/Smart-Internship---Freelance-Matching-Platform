# Interlance — Sécurité

## Authentification Firebase et token backend

Firebase Authentication gère l’inscription et la connexion par e-mail/mot de passe côté mobile et backoffice. Après connexion, le client envoie l’ID token Firebase dans chaque appel protégé :

```http
Authorization: Bearer <firebase_id_token>
```

Le filtre Spring Boot `FirebaseAuthenticationFilter` lit ce header. `FirebaseAdminTokenVerifier` valide le token avec Firebase Admin SDK (`verifyIdToken(..., true)`), puis le backend charge l’utilisateur local MongoDB par `firebaseUid`. Pour les données seed, une première connexion avec le même e-mail remplace l’UID de placeholder par l’UID Firebase réel.

Si Firebase Admin n’est pas configuré, les tokens réels ne sont pas acceptés pour les routes protégées. Les credentials backend doivent être fournis par `FIREBASE_SERVICE_ACCOUNT_JSON` ou `FIREBASE_SERVICE_ACCOUNT_PATH`.

## Rôles et contrôle d’accès

| Rôle | Accès principal |
|---|---|
| `CANDIDATE` | Profil candidat, CV, favoris, candidatures, souscription, IA Premium, notifications. |
| `RECRUITER` | Profil recruteur, entreprise, offres propres, candidatures reçues, recommandations de ses offres. |
| `ADMIN` | Dashboard, gestion utilisateurs, validation entreprises, modération offres, abonnements et logs. |

Spring Security est stateless. Les routes non publiques nécessitent un utilisateur authentifié ; les contrôleurs sensibles ajoutent `@PreAuthorize` et les services vérifient la propriété des ressources. Les endpoints `/api/admin/**` sont protégés par le rôle `ADMIN`. La synchronisation d’utilisateur refuse l’auto-inscription avec le rôle `ADMIN` : un administrateur provient d’un seed ou d’un mécanisme contrôlé.

Les routes publiques limitées comprennent la consultation des offres publiées, l’initialisation de synchronisation après Firebase, Swagger et les webhooks de paiement. Les webhooks appliquent leur propre contrôle de secret ou de signature.

## Uploads et protection des fichiers

Pour le CV local, le backend applique :

- taille maximale de 5 Mo (et limites multipart Spring correspondantes) ;
- types MIME PDF, DOC et DOCX uniquement ;
- extensions `.pdf`, `.doc` et `.docx` uniquement ;
- rejet des noms vides ou contenant `..`, `/` ou `\` ;
- génération d’un nom de stockage serveur (`cv-<uuid>.<extension>`) ;
- normalisation du chemin et contrôle que la destination reste dans le répertoire configuré.

Les uploads Cloudinary valident également les types autorisés pour les images et CV. Les signatures d’upload sont générées côté backend pour un utilisateur authentifié. Pour la production, préférer un stockage privé et des URLs signées à durée courte après contrôle d’autorisation.

## Variables d’environnement et secrets

- Les comptes de service Firebase, clés Stripe, clés OpenRouter, secrets Cloudinary et secrets de webhook ne doivent jamais être commitées.
- Les fichiers de compte de service Firebase sont ignorés par Git ; les valeurs serveur sont injectées par environnement.
- Les configurations Firebase des applications clientes sont des identifiants publics d’application, pas des secrets serveur. Les règles Firebase et les clés serveur doivent rester protégées.
- Les profils de production refusent le secret de paiement par défaut `change-me`.

## Docker et Kubernetes

- L’image backend s’exécute avec un utilisateur non root et possède seulement les droits nécessaires sur `/uploads`.
- Nginx du backoffice définit `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` et `Permissions-Policy`.
- Les manifests Kubernetes prévoient deux réplicas backend, requests/limits, probes et un PVC MongoDB ; le fichier Secret fourni est un exemple sans valeur réelle.
- Le `docker-compose.yml` du backend active l’authentification basique de Mongo Express via `MONGO_EXPRESS_USERNAME` et `MONGO_EXPRESS_PASSWORD`.
- Le Docker Compose racine conserve actuellement Mongo Express sans authentification : ne pas l’exposer hors d’un poste local de démonstration. C’est un point à corriger avant tout déploiement partagé.

## Améliorations restantes

- Ajouter un rate limiting, une journalisation de sécurité centralisée et une politique de mots de passe/anti-abus Firebase adaptée au déploiement.
- Utiliser TLS de bout en bout, des NetworkPolicies Kubernetes et une base MongoDB managée avec sauvegardes et restrictions réseau.
- Porter les privilèges administrateur dans des Firebase custom claims ou une source d’identité de confiance.
- Ajouter des contrôles antivirus/antimalware et une analyse de contenu approfondie pour les fichiers.
- Remplacer le stockage local de CV par un stockage objet privé et des liens signés.
- Remplacer ou compléter les confirmations Demo Mode par un webhook Stripe réel, avec protection contre la relecture.
