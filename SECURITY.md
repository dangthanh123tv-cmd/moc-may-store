# Bảo mật Mộc Mây

## Nguyên tắc
- Không lưu mật khẩu hoặc service_role/secret key trong mã frontend.
- Admin được xác định bằng `app_metadata.role = "admin"`.
- RLS trên Supabase là lớp kiểm soát quyền thực tế.
- Đơn hàng chứa dữ liệu khách hàng và chỉ Admin được đọc/sửa/xóa.
- Dependency được kiểm tra bằng GitHub Actions và Dependabot.

## Báo lỗi bảo mật
Không đăng thông tin nhạy cảm, token hoặc mật khẩu trong issue công khai. Hãy thông báo riêng cho chủ dự án.
