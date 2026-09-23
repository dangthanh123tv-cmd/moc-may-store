# Mộc Mây Store - bản hoàn chỉnh

## Đã có
- Website Mộc Mây responsive.
- Sản phẩm, tìm kiếm, lọc, chi tiết.
- Giỏ hàng và đặt hàng.
- Đơn hàng lưu Supabase.
- Admin xem đơn hàng realtime.
- Admin thấy tên, SĐT, địa chỉ, ghi chú.
- Admin thấy **số lượng, đơn giá và thành tiền từng sản phẩm**.
- Cập nhật trạng thái: Mới / Đã nhận / Đang pha / Đang giao / Hoàn thành.
- Admin thêm/sửa/xóa sản phẩm.
- Admin quản lý đánh giá.
- Admin sửa thông tin cửa hàng và giao diện.
- Đăng nhập Supabase.
- Quên mật khẩu / đặt mật khẩu mới.

## Supabase
URL:
https://deknuzxystcfvbyyboah.supabase.co

Admin:
Email Admin được nhập khi đăng nhập; không hiển thị sẵn trên giao diện.

Site URL:
https://dangthanh123tv-cmd.github.io/moc-may-store/

Redirect URL:
https://dangthanh123tv-cmd.github.io/moc-may-store/**


## Phân quyền Admin không chứa Gmail trong mã nguồn

Bản V5 không lưu email Admin trong `main.jsx`.

Tài khoản Admin được xác định bằng `app_metadata.role = "admin"` của Supabase Auth.

Chạy SQL này trong Supabase SQL Editor để cấp quyền Admin cho user hiện tại:

```sql
update auth.users
set raw_app_meta_data =
  jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"',
    true
  )
where id = 'USER_UUID_CUA_BAN';
```

Lấy `USER_UUID_CUA_BAN` trong Supabase > Authentication > Users.

Sau khi chạy SQL, đăng xuất/đăng nhập lại Admin để nhận token mới.


V6: đánh giá realtime, hiển thị tức thì, bố cục background và tối ưu mobile. Chạy `supabase_reviews.sql` trong Supabase SQL Editor trước khi dùng đánh giá realtime.


## Nâng cấp Quản lý đơn hàng

Bản này giữ giao diện Mộc Mây và bổ sung:
- Xóa đơn hàng trực tiếp từ Admin, có xác nhận.
- Tự tổng kết theo từng ngày: số đơn, số sản phẩm, số đơn hoàn thành và doanh thu.
- Khi xóa đơn, thống kê tự tính lại.
- Lọc theo ngày, trạng thái và tìm kiếm.
- Đồng bộ xóa đơn qua Supabase Realtime.

### Supabase
Mở Supabase Dashboard → SQL Editor và chạy phần SQL bổ sung ở cuối `supabase_reviews.sql`.
Chính sách DELETE chỉ cho phép user có `app_metadata.role = admin`.

## V7 — EEAT & SEO
- Added title, meta description, robots directives, canonical and Open Graph metadata.
- Added Schema.org CafeOrCoffeeShop structured data.
- Added `robots.txt` and `sitemap.xml` for the GitHub Pages URL.
- Added a trust/transparency section to the homepage.
- Fixed the review submission state update so it no longer calls an undefined `setReviews` function.
- Configured Vite `base` for `/moc-may-store/` GitHub Pages deployment.

### Before publishing
Replace the demo contact details (`hello@mocmay.vn`, `0900 123 456`, address) with the real business information if they are placeholders. Likewise, replace demo product photos/reviews with real assets and verified customer feedback.
