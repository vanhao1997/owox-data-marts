# Kết nối kho dữ liệu BigQuery

Tài liệu hướng dẫn kết nối P2P Digital với **Google BigQuery** làm kho lưu trữ chính.

### Các bước thiết lập BigQuery:
1. Tạo một Service Account trong Google Cloud Platform (GCP).
2. Tải tệp JSON của Service Account về máy.
3. Đảm bảo Service Account có quyền **BigQuery Data Editor** và **BigQuery Job User**.
4. Truy cập giao diện P2P, mục **Storages** -> **Add new** -> Chọn BigQuery.
5. Upload nội dung JSON vào trường Service Account Key.

*(Sử dụng script dịch tự động để đọc bản đầy đủ tính năng mở rộng của BigQuery Destination)*
