# Deployment Hardening

## Implemented

- Backend Docker runtime uses a non-root `app` user and owns `/uploads`.
- Backoffice Nginx sends `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` headers.
- Root Docker Compose protects Mongo Express with basic auth variables.
- Kubernetes backend has two replicas, resource requests/limits, readiness and liveness probes.
- Kubernetes MongoDB uses a PersistentVolumeClaim instead of `emptyDir`.
- Kubernetes secrets are represented by `backend-secret.example.yaml`; real values must be supplied outside Git.

## Production Recommendations

- Replace simulated payment confirmation with a real provider webhook using signature verification and replay protection.
- Store CVs in private object storage and return short-lived signed download URLs after authorization checks.
- Move admin authorization to Firebase custom claims or another trusted identity claim source.
- Use a managed MongoDB service with backups, TLS and network restrictions for production.
- Add a real health endpoint such as Spring Boot Actuator `/actuator/health` and point probes to it.
- Use a shared storage class that supports the required access mode if backend replicas need to serve uploaded CVs across nodes.
