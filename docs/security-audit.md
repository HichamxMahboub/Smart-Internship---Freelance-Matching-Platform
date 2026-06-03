# Security Audit Notes

## Security Hardening Implemented

- Admin self-registration blocked in `AuthService`: client-supplied `role=ADMIN` is rejected during `/api/auth/sync-user` creation.
- Payment upgrade no longer marks payments as `PAID`; it creates pending payment/subscription records and waits for a secret-confirmed webhook/demo confirmation.
- Production profiles reject the default payment webhook secret.
- Mongo Express basic auth is enabled by default in Docker Compose.
- CV upload validation now checks size, extension, content type, path traversal and server-generated storage names.
- Chat messages are length-limited, message listing is paginated, and recruiter/candidate conversations require an existing application.
- MongoDB indexes were added for user identity/role, offer filters/search, applications, notifications, payments, subscriptions, companies and chat.
- Docker and Kubernetes deployment files were hardened with non-root runtime, security headers, probes, resources and PVC-backed MongoDB.

## Known Limitations for Academic Demo

- Payment remains simulated and should be replaced by a real payment provider webhook in production.
- Firebase custom claims for admin roles are recommended for production; the current MVP keeps roles in MongoDB plus guarded self-registration/seed controls.
- AI output depends on external provider configuration or local fallback logic.
- CV files are stored on local/PVC storage for the demo; production should use private object storage and signed URLs.
