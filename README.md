# Mộc Mây Store — Lovable style

## Chạy trên Windows
npm install
npm run dev

## Build GitHub Pages
npm run build

GitHub Pages repository path:
https://dangthanh123tv-cmd.github.io/moc-may-store/

## Admin
Mật khẩu demo: admin123

Admin có:
- Thêm / sửa / xóa sản phẩm
- Sửa giá, danh mục, rating, mô tả, URL ảnh
- Xem và cập nhật trạng thái đơn hàng
- Xóa đánh giá
- Khách hàng tự gửi đánh giá
- Sửa tên thương hiệu, Gmail, số điện thoại, địa chỉ, giờ mở cửa
- Chỉnh màu nền và màu xanh chủ đạo

Lưu ý: dữ liệu admin dùng localStorage nên chỉ đồng bộ trên cùng một trình duyệt/thiết bị.


## Supabase – đơn hàng realtime

Project này đã tích hợp Supabase Realtime cho bảng `orders`. Khách có thể tạo đơn mà không cần đăng nhập; Admin đăng nhập bằng Supabase Auth để xem/cập nhật đơn. Publishable key được phép dùng trong trình duyệt; không đưa secret/service_role key vào frontend.

Trước khi deploy, hãy tạo một tài khoản Admin trong Supabase Authentication > Users và dùng email/mật khẩu đó ở nút Admin.
