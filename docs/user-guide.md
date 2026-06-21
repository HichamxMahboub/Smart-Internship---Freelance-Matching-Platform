# Interlance — Guide utilisateur

Ce guide décrit le parcours de démonstration. Les intitulés peuvent varier légèrement selon la version mobile ou backoffice.

## Pré-requis

- Le backend, MongoDB et l’application concernée sont démarrés.
- Firebase Authentication est configuré côté backend et côté client.
- Les comptes de démo sont créés dans Firebase avec les mêmes e-mails que les données seed ; voir [demo-data.md](demo-data.md).

## Candidat

### Créer un compte et compléter son profil

1. Ouvrir l’application mobile et choisir **Créer un compte**.
2. Saisir l’e-mail, le mot de passe et le rôle `CANDIDATE`.
3. Après connexion Firebase, laisser l’application synchroniser le compte avec le backend.
4. Ouvrir **Profil**, renseigner les études, la localisation, les compétences, langues et préférences.
5. Ajouter un CV PDF, DOC ou DOCX de 5 Mo maximum si la fonction upload est configurée.

### Rechercher et suivre des offres

1. Ouvrir la liste des offres.
2. Utiliser les filtres de mot-clé, localisation ou compétences si nécessaires.
3. Ouvrir le détail d’une offre publiée.
4. Ajouter l’offre aux favoris depuis le détail ou la liste.
5. Cliquer sur **Postuler**, ajouter un message, puis confirmer.
6. Consulter **Mes candidatures** pour suivre le statut : en attente, entretien, acceptée ou refusée.
7. Ouvrir **Notifications** et marquer les éléments consultés.

### Premium et IA, si disponibles

1. Ouvrir **Premium** pour consulter le plan courant.
2. L’upgrade simulé crée d’abord une demande de paiement en attente ; l’opérateur de démo doit la confirmer côté backend.
3. Avec un plan Premium actif, ouvrir les insights ou l’assistant IA.
4. Consulter les recommandations et l’analyse comme une aide : vérifier les compétences et ne pas interpréter un score comme une décision.

## Recruteur

### Créer le compte et le profil recruteur

1. Créer un compte Firebase avec le rôle `RECRUITER` puis se connecter sur mobile ou backoffice.
2. Compléter le profil recruteur : poste, téléphone et informations demandées.
3. Créer l’entreprise, avec son nom, secteur, description et site.
4. Attendre sa validation par un administrateur avant de publier une offre.

### Créer une offre et gérer les candidatures

1. Ouvrir **Mes offres** puis **Créer une offre**.
2. Renseigner le titre, la description, le type (`INTERNSHIP` ou `FREELANCE`), la localisation, la durée et les compétences requises.
3. Enregistrer en brouillon puis publier après validation de l’entreprise.
4. Ouvrir **Candidatures** pour consulter les candidatures reçues.
5. Ouvrir une candidature et modifier son statut lorsque la décision humaine est prise.
6. Consulter les recommandations de candidats pour ses propres offres, si la fonction IA est configurée.

### Échanger avec le candidat

Le chat est disponible après une candidature existante pour l’offre concernée. Depuis les conversations, choisir le fil associé, envoyer un message et consulter l’historique. Le recruteur et le candidat ne peuvent accéder qu’à leurs propres conversations.

## Administrateur

### Connexion et dashboard

1. Ouvrir le backoffice Angular.
2. Se connecter avec un compte Firebase associé au rôle local `ADMIN`.
3. Arriver sur le dashboard pour consulter les indicateurs d’utilisateurs, entreprises, offres, candidatures et abonnements.

### Gestion de la plateforme

1. Ouvrir **Utilisateurs** pour consulter les comptes et leur statut.
2. Ouvrir **Entreprises** pour valider ou refuser une entreprise recruteur.
3. Ouvrir **Offres** pour modérer les offres.
4. Ouvrir **Candidatures** si le module est exposé dans le backoffice pour vérifier le suivi global.
5. Ouvrir **Abonnements** pour consulter les souscriptions et paiements associés disponibles dans la vue admin.
6. Consulter les notifications et les logs administratifs lorsque ces écrans sont configurés.

## Règles de démonstration

- Ne jamais créer un compte `ADMIN` depuis l’écran d’inscription : le backend le refuse.
- Ne pas utiliser de secret de webhook dans l’application cliente ou une capture écran.
- Expliquer qu’IA et paiement en mode démo restent contrôlés et que les décisions de recrutement restent humaines.
