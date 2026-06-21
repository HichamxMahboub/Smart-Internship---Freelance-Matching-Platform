# Interlance — Checklist finale

## Démarrage et configuration

- [ ] Backend lancé
- [ ] Mobile lancé
- [ ] Backoffice lancé
- [ ] MongoDB connecté
- [ ] Firebase configuré côté backend, mobile et backoffice
- [ ] Comptes Firebase de démonstration créés avec les e-mails `@interlance.demo`
- [ ] Swagger accessible à `http://localhost:8080/swagger-ui.html`

## Parcours métier et sécurité

- [ ] Authentification testée avec un token Firebase valide
- [ ] Rôles Candidate, Recruiter et Admin testés
- [ ] Auto-inscription Admin refusée
- [ ] CRUD offres testé
- [ ] Validation d’entreprise testée
- [ ] Candidature testée
- [ ] Changement de statut de candidature testé
- [ ] Favoris testés
- [ ] Notifications testées ou statut clarifié
- [ ] Chat testé ou statut clarifié
- [ ] Upload CV : taille, type et protection path traversal testés

## Premium, paiement et IA

- [ ] Premium/paiement testé ou statut clarifié
- [ ] Demande Premium reste `PENDING` avant confirmation sécurisée
- [ ] Stripe configuré en test ou explicitement désactivé pour la démo
- [ ] IA testée ou statut clarifié
- [ ] Résultat IA présenté comme aide à la décision, sans décision finale automatique

## Déploiement et rendu

- [ ] Docker Compose testé
- [ ] Mongo Express protégé ou non exposé hors environnement local
- [ ] Kubernetes préparé ou statut clarifié
- [ ] Ressources, probes, PVC et Secret Kubernetes revus
- [ ] Vidéo de démonstration préparée
- [ ] Script de démonstration répété en 10 minutes
- [ ] Documentation complète et nom officiel Interlance vérifié
