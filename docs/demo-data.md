# Interlance — Données de démonstration

Ce jeu de données est synthétique, portable et réservé à la présentation académique. Il ne contient ni donnée privée, ni secret, ni URL externe de photo ou de logo.

## Activation locale

Le seeder backend `DataSeeder` est actif lorsque le Compose local définit :

```bash
APP_SEED_ENABLED=true
APP_DEMO_AUTH_ENABLED=true
```

Le mode démo authentifie les comptes seed avec le mot de passe `demo123` dans les clients locaux et transmet uniquement leur e-mail de démo au backend. Firebase ne sert pas au parcours de démo. Ces comptes ne sont pas des comptes de production.

## Comptes principaux

| Profil | E-mail | Mot de passe démo | Plan |
|---|---|---|---|
| Administrateur | [admin@interlance.demo](mailto:admin@interlance.demo) | `demo123` | `PREMIUM` |
| Candidate | [candidate@interlance.demo](mailto:candidate@interlance.demo) | `demo123` | `PREMIUM` |
| Candidate | [sara.bennani@interlance.demo](mailto:sara.bennani@interlance.demo) | `demo123` | `FREE` |
| Candidate | [yassine.elamrani@interlance.demo](mailto:yassine.elamrani@interlance.demo) | `demo123` | `FREE` |
| Candidate | [imane.zahraoui@interlance.demo](mailto:imane.zahraoui@interlance.demo) | `demo123` | `FREE` |
| Candidate | [omar.tazi@interlance.demo](mailto:omar.tazi@interlance.demo) | `demo123` | `FREE` |
| Recruteur | [recruiter@interlance.demo](mailto:recruiter@interlance.demo) | `demo123` | `PREMIUM` |
| Recruteur | [amal.idrissi@interlance.demo](mailto:amal.idrissi@interlance.demo) | `demo123` | `FREE` |
| Recruteur | [mehdi.alami@interlance.demo](mailto:mehdi.alami@interlance.demo) | `demo123` | `FREE` |
| Recruteur | [nour.belghiti@interlance.demo](mailto:nour.belghiti@interlance.demo) | `demo123` | `FREE` |

Trois recruteurs synthétiques supplémentaires sont créés comme responsables de MedConnect Health, EduBridge Labs et CloudScale Consulting. Ils assurent des relations de données cohérentes, sans être nécessaires au scénario principal.

## Profils candidats

Les cinq profils comportent un titre, une formation, une ville, une biographie, compétences, niveaux, langues, projets synthétiques, disponibilité et préférences `INTERNSHIP`, `FREELANCE` ou `BOTH`.

| Candidate | Positionnement | Ville | Compétences mises en avant |
|---|---|---|---|
| Candidate Interlance | Full Stack Junior | Casablanca | React, Node.js, MongoDB, Docker, Spring Boot |
| Sara Bennani | Mobile React Native et UI/UX | Rabat | React Native, TypeScript, UI/UX, Flutter |
| Yassine El Amrani | Backend Java | Marrakech | Spring Boot, Java, PostgreSQL, Docker, Kubernetes |
| Imane Zahraoui | Data Analyst | Casablanca | Python, Data Analysis, Machine Learning, PostgreSQL |
| Omar Tazi | DevOps Junior | Tanger | Docker, Kubernetes, CI/CD, Linux, Python |

Les liens de portfolio sont des valeurs `example.com` de démonstration. Les `photoUrl`, `logoUrl` et `imageUrl` sont volontairement vides.

## Entreprises

| Entreprise | Badge affiché | Secteur | Ville | Statut |
|---|---|---|---|---|
| Atlas Digital Solutions | `ADS` | Technologies numériques | Casablanca | `APPROVED` |
| NovaTech Africa | `NA` | Conseil logiciel | Rabat | `APPROVED` |
| DataSprint Morocco | `DSM` | Data et IA | Casablanca | `APPROVED` |
| GreenPay Fintech | `GP` | Fintech | Casablanca | `APPROVED` |
| MedConnect Health | `MH` | HealthTech | Rabat | `APPROVED` |
| EduBridge Labs | `EL` | EdTech | Fès | `PENDING` |
| CloudScale Consulting | `CC` | Cloud et DevOps | Tanger | `APPROVED` |

## Offres publiées

`PUBLISHED` est la valeur technique correspondant au statut actif dans le modèle actuel.

| Offre | Type | Lieu | Durée |
|---|---|---|---|
| Stage PFE Full Stack MERN | `INTERNSHIP` | Casablanca | 6 mois |
| Stage Développeur Spring Boot / Angular | `INTERNSHIP` | Rabat | 6 mois |
| Mission Freelance UI/UX Dashboard SaaS | `FREELANCE` | Remote | 5 semaines |
| Stage Mobile React Native | `INTERNSHIP` | Casablanca / Hybride | 4 mois |
| Freelance Backend API Integration | `FREELANCE` | Remote | 6 semaines |
| Stage Data Analyst | `INTERNSHIP` | Casablanca | 4 mois |
| Stage DevOps Docker Kubernetes | `INTERNSHIP` | Tanger / Hybride | 6 mois |
| Mission n8n Automation Specialist | `FREELANCE` | Remote | 1 mois |
| Stage QA / Test Automation | `INTERNSHIP` | Rabat | 4 mois |
| Freelance Landing Page Next.js | `FREELANCE` | Remote | 3 semaines |
| Stage Cloud & Microservices | `INTERNSHIP` | Tanger | 6 mois |
| Mission Chatbot Assistant IA | `FREELANCE` | Casablanca / Remote | 6 semaines |

Les montants de démo sont indiqués dans les descriptions, car le modèle `Offer` actuel ne possède pas de champ budget dédié.

## Candidatures, favoris et chat

Chaque candidate possède entre deux et quatre candidatures. Les statuts utilisés sont les valeurs réellement prises en charge : `PENDING`, `INTERVIEW`, `ACCEPTED` et `REJECTED`.

- Candidate Interlance : PFE MERN en attente, React Native en entretien et QA refusé.
- Sara Bennani : Spring Boot / Angular acceptée, UI/UX en attente et Next.js refusée.
- Yassine El Amrani : API Integration en entretien, Cloud et Microservices en attente.
- Imane Zahraoui : Data Analyst acceptée, Chatbot IA en attente.
- Omar Tazi : DevOps en entretien, n8n en attente.

Des favoris sont distribués aux cinq candidates. Une conversation de trois messages est créée entre Sara Bennani et Amal Idrissi pour la candidature acceptée Spring Boot / Angular.

## Premium, paiements, IA et notifications

- Candidate Interlance possède une souscription `PREMIUM` active et un paiement `PAID` de `99 MAD` en mode `DEMO`.
- Atlas Digital Solutions, via Recruiter Interlance, possède un plan `PREMIUM` actif de démonstration.
- Sara Bennani possède une demande Premium `PENDING` avec paiement en attente.
- Yassine El Amrani possède un exemple de paiement `FAILED`.
- Les autres profils disposent de souscriptions `FREE` actives.
- Trois résultats IA principaux de démonstration présentent des scores `84`, `91` et `91`, des forces, compétences à compléter et recommandations explicables.
- Les notifications couvrent nouvelle candidature, changement de statut, recommandation IA, activation Premium et rappel de profil.

Les résultats IA restent une aide à la décision. Ils ne produisent jamais une décision automatique de recrutement.

## Images remplacées par des labels

Aucune image externe ne fait partie des données seed. Lorsqu’une image est vide ou indisponible :

- le backoffice affiche les initiales de entreprise, par exemple `ADS` ou `DSM` ;
- le mobile affiche un avatar circulaire avec les initiales de personne ou de offre ;
- une erreur de chargement image bascule aussi vers ce placeholder textuel.

Les uploads image restent une fonctionnalité optionnelle du produit. Ils ne sont pas nécessaires à Docker, Expo Web ou à la démo académique.

## Idempotence et réinitialisation

Le seeder recherche les utilisateurs par e-mail, les entreprises par nom, les offres par couple entreprise et titre, puis les candidatures et favoris par leurs références. Un redémarrage met à jour les documents seed au lieu de les dupliquer.

Pour repartir de zéro, uniquement sur une base MongoDB de démonstration locale :

```bash
docker compose down -v
docker compose up -d --build
```

Cette commande supprime les volumes Docker locaux. Ne jamais appliquer cette réinitialisation à une base contenant des données réelles.
