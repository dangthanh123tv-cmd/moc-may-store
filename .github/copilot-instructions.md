# GitHub Copilot instructions — Mộc Mây

Security:
- Never expose service_role or secret keys in client code.
- Supabase RLS is mandatory for protected data.
- Treat app_metadata.role=admin as an authorization input, not a UI-only flag.
- Never persist customer PII or order details in localStorage.
- Sanitize/validate all order and review inputs.

Quality:
- Preserve React/Vite structure.
- Prefer small reusable functions and accessible UI.
- Keep mobile layout responsive.
- Run `npm audit --audit-level=high` and `npm run build`.
