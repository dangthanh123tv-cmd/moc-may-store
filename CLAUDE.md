# Mộc Mây coding rules

- Keep React + Vite architecture unless a migration is explicitly requested.
- Never put Supabase service_role/secret keys in frontend code.
- Public Supabase publishable key may be client-side; database security must rely on RLS.
- Admin authorization must be enforced by Supabase RLS using app_metadata.role = admin.
- Do not store customer name, phone, address, or order data in localStorage.
- Validate and length-limit all customer input before insert.
- Keep mobile-first responsive behavior.
- Run `npm audit --audit-level=high` and `npm run build` before proposing a release.
- Do not invent secrets, DSNs, API keys, or account identifiers.
