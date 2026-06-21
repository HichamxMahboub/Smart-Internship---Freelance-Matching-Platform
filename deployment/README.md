# Interlance — Deployment Notes

## Docker Compose local

Le fichier Compose racine est le point d’entrée de la démonstration locale :

```bash
docker compose up -d --build
docker ps
docker logs --tail=80 smart-match-platform-backend
```

Services publiés :

| Service | Conteneur | Port / URL |
|---|---|---|
| Backend Spring Boot | `smart-match-platform-backend` | `http://localhost:8080` |
| Swagger UI | backend | `http://localhost:8080/swagger-ui/index.html` |
| Backoffice Angular/Nginx | `smart-match-platform-backoffice` | `http://localhost:4200` |
| MongoDB | `smart-match-platform-mongodb` | `localhost:27017` |
| Mongo Express | `smart-match-platform-mongo-express` | `http://localhost:8081` |
| n8n | `smart-match-platform-n8n` | `http://localhost:5678` |

L’application mobile Expo Web est lancée séparément sur `http://localhost:8082`; elle n’est pas un service du Compose racine.

Le mode démo local utilise les données seed et l’authentification de démo. Firebase Admin, Cloudinary, OpenRouter, Stripe et les workflows n8n restent optionnels pour démarrer la plateforme.

## Kubernetes

Les manifests sont disponibles dans `smart-match-backend/deployment/k8s/` :

- `namespace.yaml` ;
- `mongodb-deployment.yaml` et `mongodb-service.yaml` ;
- `backend-configmap.yaml`, `backend-secret.example.yaml`, `backend-deployment.yaml` et `backend-service.yaml`.

Ils créent un namespace `smart-match`, MongoDB avec PVC, un backend à deux réplicas, un Service NodePort, des probes et des limites de ressources. Le Secret est un exemple : créer un Secret réel hors Git avant toute utilisation partagée.

Exemple de démonstration Minikube :

```bash
minikube start
eval $(minikube docker-env)
docker build -t smart-match-backend:latest smart-match-backend
kubectl apply -f smart-match-backend/deployment/k8s/namespace.yaml
kubectl apply -f smart-match-backend/deployment/k8s/mongodb-deployment.yaml
kubectl apply -f smart-match-backend/deployment/k8s/mongodb-service.yaml
kubectl apply -f smart-match-backend/deployment/k8s/backend-configmap.yaml
# Créer le Secret depuis une source privée, puis appliquer le déploiement backend.
kubectl apply -f smart-match-backend/deployment/k8s/backend-deployment.yaml
kubectl apply -f smart-match-backend/deployment/k8s/backend-service.yaml
```

## Exigences de production

- Activer l’authentification, TLS et les sauvegardes MongoDB ; ne pas exposer Mongo Express publiquement.
- Fournir les credentials Firebase Admin par secret de plateforme.
- Forcer HTTPS et configurer des domaines/origines CORS de production.
- Stocker les secrets d’environnement dans Docker/Kubernetes Secrets ou un gestionnaire de secrets.
- Fournir, si utilisés, les credentials Cloudinary, la clé OpenRouter, les credentials n8n et les clés/webhooks Stripe.
- Désactiver `APP_DEMO_AUTH_ENABLED` et les comptes de démonstration.

This root deployment folder is reserved for platform-level deployment material.

Current deployment assets:
- Root Docker Compose: `../docker-compose.yml`
- Backend Kubernetes manifests: `../smart-match-backend/deployment/k8s/`

For the academic demo, use the root Docker Compose file to start MongoDB, backend, backoffice, and Mongo Express together.
For Minikube/Kubernetes deployment, apply the backend manifests from the backend project folder.
