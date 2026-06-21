# Interlance — Script de démonstration (10 minutes)

> Préparer les trois comptes de [demo-data.md](demo-data.md), les applications ouvertes et les données seed déjà visibles. Ne pas afficher de secret dans le terminal ou à l’écran.

## 0:00–1:00 — Présentation d’Interlance

- Présenter Interlance comme une plateforme qui centralise stages et missions freelance.
- Expliquer le problème : recherche fragmentée côté candidat et sélection manuelle côté recruteur.
- Annoncer les trois rôles : candidat, recruteur et administrateur.
- Mentionner : « Interlance est l’évolution du projet Smart Match, une plateforme intelligente de stages et missions freelance. »

## 1:00–3:00 — Parcours candidat

1. Se connecter sur mobile avec `candidate@interlance.demo`.
2. Ouvrir le profil et montrer études, compétences, préférences et CV.
3. Parcourir les offres publiées, appliquer un filtre puis ouvrir **Stage Backend Java**.
4. Ajouter l’offre aux favoris.
5. Montrer la candidature `PENDING` et les notifications : candidature, Premium et IA.
6. Si le temps le permet, créer une nouvelle candidature sur une offre différente et expliquer que le doublon sur une même offre est bloqué.

## 3:00–5:00 — Parcours recruteur

1. Se connecter avec `recruiter@interlance.demo`.
2. Montrer le profil recruteur et **Interlance Demo Labs**, déjà validée.
3. Ouvrir les trois offres : deux publiées et une en brouillon.
4. Créer ou modifier une offre, puis expliquer que la publication dépend de la validation de l’entreprise.
5. Ouvrir les candidatures reçues, consulter le score indicatif et changer un statut uniquement après décision humaine.
6. Montrer le chat si disponible : une conversation nécessite une candidature existante.

## 5:00–7:00 — Parcours administrateur

1. Se connecter au backoffice avec `admin@interlance.demo`.
2. Montrer le dashboard et ses indicateurs.
3. Ouvrir la gestion des utilisateurs et rappeler que l’auto-inscription `ADMIN` est refusée.
4. Ouvrir les entreprises et expliquer la validation/refus.
5. Ouvrir les offres, les abonnements/paiements et les logs si les vues sont disponibles.

## 7:00–8:00 — IA et Premium

1. Revenir au candidat Premium et ouvrir le résultat IA seed : analyse de CV, compétences et score.
2. Expliquer que l’IA recommande, mais ne décide jamais d’accepter ou refuser une candidature.
3. Montrer le statut Premium. Décrire le flux : demande `PENDING` → confirmation sécurisée webhook/Demo Mode ou Stripe configuré → plan actif.
4. Ne saisir ni ne projeter le `X-Payment-Secret` ; une confirmation de démo se fait hors écran par l’opérateur.

## 8:00–9:00 — Architecture technique

- Mobile Expo React Native et backoffice Angular PWA.
- Backend Spring Boot, MongoDB et API REST.
- Firebase Authentication : token Bearer, vérification Firebase Admin et rôles `CANDIDATE`, `RECRUITER`, `ADMIN`.
- Résumer les protections : contrôle par rôle, validation des CV et isolation des ressources par propriétaire.

## 9:00–10:00 — Docker, Kubernetes et conclusion

- Montrer Docker Compose pour les services locaux et les manifests Kubernetes/Minikube préparés.
- Préciser les limites : secrets à fournir par environnement, Stripe et fournisseur IA à configurer pour les flux externes, Kubernetes à durcir avant production.
- Conclure sur la valeur : un parcours unifié, traçable et sécurisé, avec une IA d’assistance responsable.
