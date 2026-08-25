DEARLY ADMIN UX OVERHAUL

Thay các file sau vào đúng vị trí trong repo Gifts:

1. src/components/admin/AdminOrdersPage.tsx
2. src/components/admin/AdminOrdersTab.tsx
3. src/components/admin/AdminTemplatesTab.tsx
4. src/components/admin/AdminDashboardTab.tsx
5. src/components/admin/AdminCustomersTab.tsx
6. src/components/admin/AdminSettingsTab.tsx
7. src/components/admin/adminUi.ts
8. src/routing/appRouter.ts
9. src/config/firebase.ts

Thay đổi chính:
- Admin có 5 khu vực rõ ràng: Tổng quan / Đơn hàng / Templates / Khách hàng / Cài đặt.
- /admin mở Tổng quan thay vì dồn mọi route cũ về Đơn hàng.
- Đơn hàng bỏ cụm 4 card thống kê lặp, gom tìm kiếm + filter vào 1 toolbar.
- Bulk action chỉ hiện khi thực sự chọn đơn.
- Templates chỉ còn 1 thanh chọn template + 1 nút Lưu.
- Bỏ thanh trạng thái lưu bị lặp ở cuối trang Templates.
- Các nhóm chỉnh template đổi thành: Thông tin / Thiết kế trang / Style / Tài nguyên.
- Khôi phục Dashboard, Customers, Settings vốn có file nhưng trước đây không được nối vào navigation.
- Bổ sung CustomerSummary + hàm tổng hợp khách từ checkout.
- Sửa lỗi Firestore không lưu template do dữ liệu editor có field undefined bằng ignoreUndefinedProperties.

Kiểm tra đã thực hiện:
- Parse/transpile TypeScript/TSX cho toàn bộ 9 file: OK.

Sau khi thay file:
- chạy npm run lint
- chạy npm run build
- deploy lại
- hard refresh trình duyệt trước khi test lưu template
