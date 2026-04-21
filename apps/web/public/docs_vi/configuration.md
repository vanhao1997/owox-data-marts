# Cấu hình P2P Digital (Configuration)

Mọi cấu hình môi trường liên quan đến bảo mật của P2P Digital đều được tùy chỉnh thông qua tệp `.env`.

- **Vị trí tệp**: Nằm trong thư mục gốc của project (trên Coolify, ứng dụng sẽ quét biến môi trường trực tiếp).
- **Thiết lập Oauth**: Khai báo các API Key, Client ID và Secret ở đây để mở khóa tính năng tự động gia hạn token.
- **Better Auth**: Mặc định hệ thống dùng `better-auth` cho tính năng đăng nhập nội bộ.

> Nếu bạn cần config nâng cao (Redis, Kafka...), vui lòng chạy Automation Script để lấy bản dịch đầy đủ tiếng Việt cho các module này.
