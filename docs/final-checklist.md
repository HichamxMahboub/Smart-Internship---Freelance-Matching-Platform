# Final Verification Checklist

- [ ] Backend builds with `mvn -q -DskipTests package`
- [ ] Backend tests pass with `mvn test`
- [ ] Swagger opens at `http://localhost:8080/swagger-ui.html`
- [ ] MongoDB runs locally or with Docker Compose
- [ ] Backoffice builds with `npm run build`
- [ ] Mobile TypeScript passes with `npx tsc --noEmit`
- [ ] Firebase config added to backend, backoffice and mobile
- [ ] Candidate flow tested
- [ ] Recruiter flow tested
- [ ] Admin flow tested
- [ ] Docker Compose tested
- [ ] Demo video recorded
- [ ] README completed

- [ ] Admin self-registration blocked test passes
- [ ] Premium upgrade remains pending before secret confirmation
- [ ] Mongo Express password changed from `.env.example` default
- [ ] Firebase client placeholders replaced for the demo project
- [ ] CV upload rejects invalid type and path traversal
- [ ] Chat pagination and application-based conversation rule verified
- [ ] Kubernetes manifests reviewed for Minikube resources/PVC/probes
