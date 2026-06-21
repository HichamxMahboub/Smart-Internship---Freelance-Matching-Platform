# Interlance — Deployment Notes

This root deployment folder is reserved for platform-level deployment material.

Current deployment assets:
- Root Docker Compose: `../docker-compose.yml`
- Backend Kubernetes manifests: `../smart-match-backend/deployment/k8s/`

For the academic demo, use the root Docker Compose file to start MongoDB, backend, backoffice, and Mongo Express together.
For Minikube/Kubernetes deployment, apply the backend manifests from the backend project folder.
