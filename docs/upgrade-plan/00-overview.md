# Upgrade Plan — Tong Quan

> Tai lieu huong dan cho AI Agent thuc hien nang cap toan dien apps/web.
> Moi phase la mot file .md rieng voi instructions cuc ky chi tiet.

## Hien trang Web App (v0.32.0)

| Metric | Value |
|---|---|
| Stack | React 19.2 + Vite 6.3 + TanStack Query 5 + react-router 8 + Tailwind 4 |
| UI Library | @owox/ui (radix-based, shadcn-style) |
| Total TS/TSX files | 1,695 |
| Test files | 259 |
| Feature modules | 15 |
| Page groups | 11 |
| Shared components | 32 |
| Custom hooks | 7 global + ~40 feature-specific |
| Services | 30 API service files |
| i18n | EN + VI (2,427 lines each) |
| State management | Custom store (reducers) + React Query |
| ARIA usage | ~434 instances across codebase |
| Toast system | DUAL: react-hot-toast (81 files) + sonner (1 file) — CAN MIGRATE |
| Lazy-loaded pages | 19 pages lazy (DA FIX — truoc do 6 chua lazy) |
| staleTime configured | Default 30s (DA FIX) + 4 queries co rieng |

## Phase List

| Phase | File | Priority | Sprint |
|---|---|---|---|
| 1 | phase-1-performance.md | Cao | Sprint 1-2 |
| 2 | phase-2-ux.md | Cao | Sprint 1-2 |
| 3 | phase-3-test-coverage.md | Cao | Sprint 3-4 |
| 4 | phase-4-accessibility.md | Trung binh | Sprint 5 |
| 5 | phase-5-i18n.md | Trung binh | Sprint 5 |
| 6 | phase-6-monitoring.md | Trung binh | Sprint 6 |
| 7 | phase-7-dx.md | Thap | Ongoing |

## Quy tac cho Agent

1. KHONG sua code trong apps/backend — chi apps/web va packages/ui.
2. KHONG thay doi API contract — chi thay doi frontend.
3. KHONG them dependency moi neu chua duoc liet ke ro trong task.
4. KHONG xoa test hien co.
5. PHAI chay `npm run lint -w @owox/web` va `npm run test -w @owox/web` sau moi thay doi.
6. PHAI giu dung cau truc thu muc hien tai cua feature modules.
7. PHAI su dung components tu @owox/ui thay vi tao moi.
8. PHAI su dung useTranslation() cho tat ca text hien thi — KHONG hardcode.

## Task Plans (Chi tiet trien khai)

| Task | File | Uu tien | Uoc tinh |
|---|---|---|---|
| Toast Migration | task-toast-migration.md | Cao | 3-4 gio |
| Loading/Error/Empty States | task-loading-error-empty-states.md | Thap (da co) | 1 gio audit |
| Test Coverage (MSW + Tests) | task-test-coverage.md | Cao | 8-12 gio |

## Trang thai trien khai (da code xong)

Cac tasks SAU da duoc trien khai trong code, KHONG can lam lai:
- Task 1.1: Lazy load 6 pages (routes/index.tsx) — DA XONG
- Task 1.2: Manual chunks (vite.config.ts) — DA XONG
- Task 1.3: staleTime mac dinh (App.tsx) — DA XONG
- Task 1.5: Prefetch routes (utils/prefetch-routes.ts) — DA XONG
- Task 2.3: ErrorState component (shared/components/ErrorState/) — DA TAO
- Task 4.5: SkipToContent component (shared/components/SkipToContent/) — DA TAO
- Task 5.3: i18n key check script (scripts/check-i18n-keys.mjs) — DA TAO
- Task 5.4: Format utilities (utils/format.ts) — DA TAO
- Task 6.1: Web Vitals tracker (utils/web-vitals.ts) — DA TAO
- Task 6.2: Error reporter (utils/error-reporter.ts) — DA TAO
- Task 7.4: Test utils (test/test-utils.tsx) — DA TAO

Cac tasks CON LAI can agent thuc hien:
- Task 1.4: Bundle analyzer (can npm install rollup-plugin-visualizer)
- Task 2.1: Toast migration (81 files) — xem task-toast-migration.md
- Task 2.2: Skeleton loading — xem task-loading-error-empty-states.md
- Task 2.4: Empty states — xem task-loading-error-empty-states.md
- Task 2.5: Responsive audit
- Task 3.1-3.5: Test coverage — xem task-test-coverage.md
- Task 4.1-4.4: Accessibility audit
- Task 5.1-5.2: i18n hardcoded strings + namespace split
- Task 6.3-6.4: API latency + feature flags
- Task 7.1-7.3, 7.5: DX tools
