# Kết nối các công cụ cho Mộc Mây V9

## 1. GitHub Copilot / Claude
Không cần API key trong website.
- Copilot đọc `.github/copilot-instructions.md`.
- Claude đọc `CLAUDE.md`.
Hai file này đặt quy tắc để AI không làm lộ secret và giữ kiến trúc React/Vite.

## 2. Snyk
1. Tạo tài khoản Snyk.
2. Lấy SNYK_TOKEN.
3. GitHub repository -> Settings -> Secrets and variables -> Actions.
4. New repository secret:
   Name: SNYK_TOKEN
   Value: token của Snyk.
5. Workflow `security-ai.yml` sẽ tự quét dependency.

## 3. Sentry
1. Tạo project JavaScript/React trên Sentry.
2. Lấy DSN public của project.
3. Đặt `VITE_SENTRY_DSN` trong môi trường build.
4. Nếu muốn upload source maps, thêm GitHub Actions secrets:
   SENTRY_AUTH_TOKEN
   SENTRY_ORG
   SENTRY_PROJECT
Không commit các secret này vào Git.

## 4. GitHub
Đã có:
- npm audit
- CodeQL
- Dependabot
- production build
- Snyk (khi có SNYK_TOKEN)
- Sentry source-map upload (khi có đủ Sentry secrets)

## 5. Cloudflare
Cloudflare không được nhúng bằng API key vào React.
Sau khi trỏ domain qua Cloudflare, cấu hình DNS/HTTPS/WAF/Rate Limiting ở Cloudflare.
Không đặt Cloudflare API token trong frontend.

## 6. Canva
Canva là công cụ thiết kế, không phải runtime security service.
Dùng Canva để tạo logo/background/banner rồi xuất asset đưa vào `public/`.
Không đưa Canva token vào `main.jsx`.

## 7. Supabase
Giữ Supabase publishable key ở frontend nếu cần.
Tuyệt đối không đưa service_role/secret key vào source code.
Orders/Reviews phải được bảo vệ bằng RLS.
