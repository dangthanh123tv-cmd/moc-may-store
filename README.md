# Mộc Mây Ultimate v5.0

Bản tổng hợp từ V7 EEAT + V8 Security Pro + V9 Complete + AI/Security Connect.

## Có gì trong bản này
- React + Vite, tối ưu GitHub Pages `/moc-may-store/`.
- Supabase Auth + RLS cho Admin.
- Quản lý sản phẩm đồng bộ qua Supabase.
- Quản lý cài đặt cửa hàng đồng bộ qua Supabase.
- Đơn hàng realtime, tổng kết theo ngày, cập nhật trạng thái và xóa đơn.
- Trigger Database kiểm tra lại sản phẩm/giá/tổng đơn trước khi ghi.
- Form liên hệ lưu vào Supabase + Admin xem/xóa.
- Reviews realtime + chống spam cơ bản.
- SEO: title, description, canonical, Open Graph, Schema.org, robots, sitemap.
- CSP, security.txt, Dependabot, CodeQL, npm audit.
- Sentry tùy chọn: chỉ bật khi có `VITE_SENTRY_DSN`.
- Không chứa Supabase service_role/secret key.

## Cài đặt Supabase
1. Đảm bảo database V8 hiện tại đã có bảng `orders` và `reviews`.
2. Vào Supabase → SQL Editor.
3. Chạy **SUPABASE-MASTER-UPGRADE.sql** một lần.
4. Tài khoản Admin phải có `app_metadata.role = admin`.
5. Kiểm tra publishable/anon key trong `src/supabase.js`.

Có thể chạy riêng `supabase_security.sql`, `supabase_reviews.sql` và `supabase_v9_upgrade.sql` nếu bạn muốn nâng cấp theo từng bước.

## GitHub Pages trên điện thoại
Upload **toàn bộ nội dung bên trong thư mục này vào root repository**, không upload thư mục bọc `moc-may-ultimate`.

Settings → Pages → Source: GitHub Actions.

## Sentry (tùy chọn)
Không cần Sentry để website chạy. Nếu muốn bật monitoring, thêm `VITE_SENTRY_DSN` trong môi trường build. Không đưa auth token hoặc secret vào frontend.

## Lưu ý dữ liệu thật
Thay email, điện thoại, địa chỉ, giờ mở cửa, ảnh sản phẩm và đánh giá mẫu bằng dữ liệu thật trước khi kinh doanh.


## V5.1 — GitHub Ready
- Added `.github/workflows/deploy.yml` for automatic GitHub Pages deployment on pushes to `main`.
- Uses Node 22, `npm install`, `npm run build`, Pages artifact upload, and `actions/deploy-pages`.
- The project does not include `package-lock.json`; therefore CI intentionally uses `npm install` rather than `npm ci`. Generate and commit a lockfile later if you want fully reproducible dependency installs.
- GitHub repository Pages source should be set to **GitHub Actions**.
