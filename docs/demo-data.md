# Interlance — Données de démonstration

## Comptes

| Profil | E-mail | Mot de passe | Rôle |
|---|---|---|---|
| Administrateur | [admin@interlance.demo](mailto:admin@interlance.demo) | `DemoAdmin123!` | `ADMIN` |
| Candidate | [candidate@interlance.demo](mailto:candidate@interlance.demo) | `DemoCandidate123!` | `CANDIDATE` |
| Recruteur | [recruiter@interlance.demo](mailto:recruiter@interlance.demo) | `DemoRecruiter123!` | `RECRUITER` |

Ces identifiants sont réservés à la démo académique. Ils ne sont ni des secrets de production ni des comptes à réutiliser en environnement réel.

## Activation du seeder

Le backend fournit `DataSeeder`, activé avec :

```bash
APP_SEED_ENABLED=true
```

Il crée les documents MongoDB de démonstration de façon idempotente. Il **ne crée pas les utilisateurs ni les mots de passe dans Firebase**. Avant la démonstration, créer les trois comptes e-mail/mot de passe dans Firebase Authentication (ou l’émulateur Firebase) avec les valeurs du tableau. À la première connexion, le backend associe le compte Firebase au document seed de même e-mail et conserve son rôle local.

## Jeu de données créé

### Entreprise validée

| Nom | Secteur | État |
|---|---|---|
| Interlance Demo Labs | Software | `APPROVED` |

### Offres

| Offre | Type | Lieu | État |
|---|---|---|---|
| Stage Backend Java | `INTERNSHIP` | Casablanca | `PUBLISHED` |
| Mission Freelance Mobile | `FREELANCE` | Remote | `PUBLISHED` |
| Stage Data Analyst | `INTERNSHIP` | Rabat | `DRAFT` |

### Candidatures

| Candidate | Offre | Statut | Score |
|---|---|---|---|
| candidate@interlance.demo | Stage Backend Java | `PENDING` | 75 % |
| candidate@interlance.demo | Mission Freelance Mobile | `ACCEPTED` | 88 % |

### Premium et paiement

Le candidat seed dispose d’une souscription `PREMIUM` active, avec une validité de 30 jours autour de la date de seed et un paiement `PAID` de démonstration :

- montant : `99 MAD` ;
- méthode : `DEMO` ;
- type : `SUBSCRIPTION`.

Ce paiement sert à montrer la vue Premium et l’accès à l’IA. Il ne correspond à aucun encaissement réel.

### Résultat IA exemple

Un `AIResult` `CV_ANALYSIS` est créé pour le candidat : score 84 %, profil `Backend Engineer`, stack `Java, Spring Boot, MongoDB`, séniorité `Junior`. La recommandation demande de mieux mettre en avant les projets Spring Boot et MongoDB. Le résultat est explicitement étiqueté comme démonstration et n’est pas une décision de recrutement.

### Notifications

Les notifications seed couvrent notamment :

- plateforme prête pour l’administrateur ;
- bienvenue, candidature en attente, Premium actif et résultat IA pour le candidat ;
- entreprise validée et candidature acceptée pour le recruteur.

## Réinitialisation

Les données seed sont conçues pour ne pas dupliquer les offres, candidatures, notifications, paiement et résultat IA à chaque redémarrage. Pour repartir de zéro, utiliser une base MongoDB de démonstration dédiée, puis relancer avec `APP_SEED_ENABLED=true`. Ne jamais supprimer une base contenant des données réelles uniquement pour préparer une démo.
