# Mộc Mây Ultimate v5.0 — bản tổng hợp

| Nguồn | Giữ lại | Nâng cấp |
|---|---|---|
| V7 EEAT + SEO | EEAT, SEO, Schema, sitemap, robots | Giữ và tích hợp vào V9 |
| V8 Security Pro | RLS, Auth, CodeQL, Dependabot | Giữ và củng cố workflow |
| V9 Complete | Catalog Supabase, Settings Supabase, Contact Admin, server-side order validation | Làm nền tảng chính |
| V9 AI Security Connect | Sentry tùy chọn, AI/security docs, security workflow | Tích hợp, sửa CSP và npm workflow |

## Các lỗi/điểm yếu đã tránh
- Không dùng bản AI Connect làm nền vì bản đó đã bỏ mất Contact Admin và đồng bộ Catalog/Settings.
- Không dùng localStorage làm nguồn dữ liệu chính cho sản phẩm/cài đặt.
- Không để browser tự quyết định tổng tiền mà không được database xác minh.
- Không dùng `npm ci` khi project không có package-lock.json.
- Không để migration seed ghi đè thay đổi sản phẩm của Admin khi chạy lại.
