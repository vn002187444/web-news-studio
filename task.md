# Implementation Plan: 4 Chiến Lược Cải Tiến & Nâng Cấp Web News

## Mục tiêu
Triển khai toàn diện 4 hạng mục cải tiến đã thống nhất:
1. **Tối ưu Edge Cache & Header Performance**:
   - Tối ưu `middleware.ts` loại bỏ Set-Cookie dư thừa trên các trang công khai để kích hoạt Cloudflare Edge CDN Caching.
   - Chuẩn hóa header `Cache-Control` (`public, max-age=60, s-maxage=3600, stale-while-revalidate=86400`) trên tất cả các trang đọc tin.
   - Cập nhật hiển thị audit timestamp trong `daily-maintenance-check.mjs`.
2. **Nâng cấp RSS Engine đạt 100% tỷ lệ sống**:
   - Thay thế feed lỗi `The Guardian Lifestyle` bằng `The Independent Lifestyle (UK)` (`https://www.independent.co.uk/life-style/rss`) đạt 100% 200 OK.
   - Thêm cơ chế fallback `fetch() + parseString()` cho `check-status.ts`, `autoblog.ts`, `generate-report.ts` để xử lý triệt để lỗi stream của `ESPN Top News` (đạt 39 tin).
3. **Tự động đóng GitHub Issue báo cáo cũ**:
   - Cập nhật `.github/workflows/content-operations-report.yml` tự động tìm và đóng các issue `report,analytics` cũ hơn trước khi tạo issue mới.
4. **Bổ sung Root Scripts & Dọn dẹp Workspace**:
   - Bổ sung `check-status`, `qa`, `audit`, `report`, `autoblog` vào root `package.json`.
   - Di chuyển các file kết quả audit cũ `audit-result-2026-11-*.json` vào `reports/audit-history/`.
