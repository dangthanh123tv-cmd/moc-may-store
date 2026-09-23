# Checklist trước khi public

[ ] SNYK_TOKEN đã lưu trong GitHub Actions Secrets
[ ] Sentry DSN đã cấu hình
[ ] Sentry Auth Token chỉ nằm trong GitHub Secrets
[ ] Không có service_role/secret key trong src/
[ ] Supabase RLS đã bật cho orders/reviews
[ ] Admin RLS kiểm tra app_metadata.role = admin
[ ] npm audit --audit-level=high = pass
[ ] CodeQL = pass
[ ] npm run build = pass
[ ] Dependabot hoạt động
[ ] Cloudflare HTTPS/WAF/rate limiting đã cấu hình nếu dùng domain riêng
