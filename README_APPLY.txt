DEARLY — FIX TEMPLATE SAVE + CUSTOMER ASSET REFRESH

THAY ĐÚNG 3 FILE:
- src/components/admin/AdminOrdersPage.tsx
- src/components/admin/AdminTemplatesTab.tsx
- src/components/CreateLovePage.tsx

FIX 1 — ADMIN KHÔNG CÒN QUÊN LƯU
- Bất kỳ thay đổi nào trong Templates đều đánh dấu dirty.
- Sticky bar dưới màn hình: Có thay đổi chưa lưu.
- Nút Lưu luôn nhìn thấy khi kéo xuống GIF & ảnh.
- Lưu xong hiện Đã lưu thay đổi ✓.
- Nếu rời tab Templates khi chưa lưu sẽ hỏi trước.
- Nếu đóng/reload browser khi chưa lưu, browser cảnh báo.

FIX 2 — /create/love-01 NHẬN ASSET MỚI
- Không dùng hàm fallback-cache để refresh asset nữa.
- Dùng getRequiredPublicTemplateConfigById để đọc Firestore thật.
- Khi quay lại tab/browser focus, template tự refresh.
- Khi document trở lại visible, template tự refresh.
- Vì vậy sau khi Admin bật 'Khách được chọn' + Lưu, quay lại /create/love-01 sẽ tự thấy lựa chọn.

KHÔNG CẦN SỬA FIREBASE RULES.
KHÔNG CẦN SỬA adminService.ts.

LINE COUNTS:
src/components/admin/AdminOrdersPage.tsx: 1245 -> 1319 (+74)
src/components/admin/AdminTemplatesTab.tsx: 521 -> 587 (+66)
src/components/CreateLovePage.tsx: 1662 -> 1706 (+44)
