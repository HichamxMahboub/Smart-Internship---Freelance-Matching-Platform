# Interlance — Checklist finale

## Contrôle technique juste avant la présentation

```bash
docker ps
docker logs --tail=80 smart-match-platform-backend
git ls-files | grep -E '(^|/).env($|.)' || echo "No tracked .env files"
git status --short
```

- [ ] `docker ps` affiche MongoDB, Mongo Express, backend, backoffice et n8n ;
- [ ] le log backend ne contient pas d'erreur bloquante et le seeder de démo est terminé ;
- [ ] Swagger s'ouvre sur `http://localhost:8080/swagger-ui/index.html` ;
- [ ] le backoffice s'ouvre sur `http://localhost:4200` ;
- [ ] Expo Web s'ouvre sur `http://localhost:8082` après son lancement séparé ;
- [ ] Mongo Express s'ouvre sur `http://localhost:8081` et affiche `smart_match` ;
- [ ] n8n s'ouvre sur `http://localhost:5678` ;
- [ ] aucun fichier `.env` n'est suivi par Git et le statut Git ne contient que les changements attendus ;
- [ ] le mode démo local est expliqué : Firebase est optionnel en Compose, mais requis/configuré pour l'authentification de production.

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
- [ ] Documentation complète et nom officiel Interlance vérifié
