DEARLY ADMIN — CLEAN UI + DELETE ORDERS

Đây là BẢN MỚI NHẤT, đã gộp:
1. Dọn Admin còn 2 tab: Đơn hàng / Templates
2. Asset Cat Love Sticker + merge Firestore
3. Xóa 1 đơn
4. Chọn nhiều đơn
5. Chọn tất cả đơn đang hiển thị
6. Xóa hàng loạt có confirm
7. Cảnh báo nếu xóa đơn đã thanh toán / gift đang publish
8. Xóa hàng loạt theo batch nhỏ để tránh bắn quá nhiều request cùng lúc

XÓA 1 ĐƠN:
- Có nút Xóa ở từng dòng/card.
- Trước khi xóa luôn hỏi lại.
- Nếu đơn đã thanh toán sẽ cảnh báo rõ.
- Nếu gift đang publish sẽ cảnh báo rõ.
- Trang chi tiết đơn vẫn có nút Xóa đơn và confirm.

XÓA NHIỀU:
- Tick checkbox từng đơn.
- Checkbox đầu bảng = chọn/bỏ chọn tất cả đơn đang hiển thị.
- Mobile có nút "Chọn tất cả ... đơn đang hiện".
- Có thanh nổi "Đã chọn N đơn".
- Bấm "Xóa N đơn" -> confirm lần cuối.
- Nếu chọn đơn đã thanh toán/publish, confirm hiển thị số lượng cảnh báo.
- Nếu một vài đơn xóa lỗi, giao diện báo chính xác đã xóa bao nhiêu / tổng bao nhiêu.

LƯU Ý:
GitHub main tại thời điểm tạo bundle này vẫn là Admin 6 tab cũ.
Vì vậy hãy dùng toàn bộ bundle này, không chỉ chép 2 file delete,
nếu muốn giữ luôn giao diện Admin đã dọn ở bước trước.

THAY ĐÚNG 9 FILE:
- src/components/admin/AdminOrdersPage.tsx
- src/components/admin/AdminOrdersTab.tsx
- src/components/admin/AdminOrderDetailPage.tsx
- src/components/admin/AdminTemplatesTab.tsx
- src/components/admin/AdminTemplateDesignEditor.tsx
- src/components/admin/AdminTemplateAssetEditor.tsx
- src/components/admin/adminUi.ts
- src/templates/assets.ts
- src/routing/appRouter.ts

KHÔNG CẦN SỬA:
- src/services/adminService.ts
  Vì repo hiện đã có deleteAdminOrder(), dùng để xóa gift + public order lookup.
- firestore.rules
  Vì rules hiện đã cho Admin delete /gifts.
- App.tsx
- vercel.json

LINE COUNTS
src/components/admin/AdminOrdersPage.tsx: 823 -> 1245 (+422)
src/components/admin/AdminOrdersTab.tsx: 237 -> 750 (+513)
src/components/admin/AdminOrderDetailPage.tsx: 1172 -> 1042 (-130)
src/components/admin/AdminTemplatesTab.tsx: 768 -> 521 (-247)
src/components/admin/AdminTemplateDesignEditor.tsx: 1205 -> 1049 (-156)
src/components/admin/AdminTemplateAssetEditor.tsx: 515 -> 523 (+8)
src/components/admin/adminUi.ts: 162 -> 106 (-56)
src/templates/assets.ts: 726 -> 715 (-11)
src/routing/appRouter.ts: 247 -> 261 (+14)
