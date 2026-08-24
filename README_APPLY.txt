DEARLY ADMIN + BRAND UPDATE

THAY / THÊM ĐÚNG CẤU TRÚC:

src/components/Homepage.tsx                  -> THAY
src/components/CheckoutPage.tsx              -> THAY
src/components/admin/AdminOrdersPage.tsx     -> THAY
src/services/adminService.ts                  -> THAY
src/services/giftService.ts                   -> THAY
firestore.rules                               -> THAY + PUBLISH

src/config/brand.ts                           -> THÊM FILE MỚI
src/services/templateService.ts               -> THÊM FILE MỚI
public/images/dearly-logo.png                 -> THÊM FILE MỚI

SAU KHI COPY:
1. Publish firestore.rules vào đúng Firestore database app đang dùng.
2. Vào /admin -> Templates hoặc Khuyến mãi -> Save 1 lần.
   Việc này tạo templates/love-01 trong Firestore.
3. Các checkout MỚI sẽ lấy giá từ templates/love-01.
   Đơn đã tạo trước đó giữ nguyên giá cũ để không đổi tiền giữa chừng.
4. Tab Khách hàng được tổng hợp trực tiếp từ thông tin customer trong các đơn gifts.

ADMIN TÁCH FILE MỚI:
src/components/admin/AdminDashboardTab.tsx
src/components/admin/AdminOrdersTab.tsx
src/components/admin/AdminTemplatesTab.tsx
src/components/admin/AdminCustomersTab.tsx
src/components/admin/AdminSettingsTab.tsx
src/components/admin/adminUi.ts
