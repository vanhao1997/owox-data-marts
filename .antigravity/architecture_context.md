# 🏗️ Sơ Đồ Kiến Trúc OWOX Data Marts

Đây là Context file do Agent Antigravity tự động sinh ra giúp thấu hiểu cấu trúc Monorepo của dự án [OWOX/owox-data-marts](https://github.com/OWOX/owox-data-marts).

## 📂 Sơ Đồ Thư Mục (Folder Tree)

```text
owox-data-marts/
├── apps/                        # Các ứng dụng và service chính
│   ├── backend/                 # API Server xử lý business logic
│   ├── docs/                    # Tài liệu dự án (Documentation Site)
│   ├── owox/                    # Các module nghiệp vụ đặc thù cho nền tảng OWOX
│   └── web/                     # Giao diện người dùng Web App (Frontend UI)
│
├── packages/                    # Chứa packages, libraries, plugin
│   ├── connector-runner/        # Engine chạy bộ kết nối dữ liệu
│   ├── connectors/              # Custom connectors kết nối với BigQuery, Snowflake... (MIT License)
│   ├── idp-*/                   # Identity Provider (Xác thực với "better-auth")
│   ├── internal-helpers/        # Helper code sử dụng chung
│   ├── ui/                      # Thư viện UI component dùng chung cho các web apps
│   ├── test-utils/              # Chứa logic mock, test fixtures
│   └── *-config/                # Chứa các file cấu hình cho monorepo (eslint, ts, prettier)
│
├── tools/                       # Scripts hỗ trợ DevOps hoặc CLI
├── package.json                 # Quản lý dependency gốc dạng Workspace
└── .github/                     # CI/CD Workflows
```

## 🧠 Nguyên Tắc Phân Bổ Code (Kiến trúc Monorepo)

1. **Phía Giao Diện (UI/Frontend):**
   - Viết hoặc sửa code dành cho frontend sẽ vào `apps/web`.
   - Nếu tạo một giao diện component dùng chung hoặc Design System, hãy đặt vào `packages/ui` để có thể tái sử dụng.
   
2. **Phía Logic Hệ Thống & Backend:**
   - Xử lý nghiệp vụ chính của nền tảng, Data API, Routing: nằm ở `apps/backend`.
   - Xử lý User Identity và Authentication, đặt ở `packages/idp-*`.

3. **Data Connectors & Semantic Logic:**
   - Mọi kết nối đến nguồn dữ liệu đích (Destinations như Looker, GSheet) hoặc nguồn Data Warehouse, viết trong `packages/connectors`.
   
4. **Cấu Hình & Tooling:**
   - Sử dụng các file configs tại `packages/*-config` để đảm bảo code format đồng nhất trên mọi workspaces.
