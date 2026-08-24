DEARLY — 4 DIGIT ORDER CODE

THAY 5 FILE:
1. src/components/CheckoutPage.tsx
2. src/services/giftService.ts
3. src/config/payment.ts
4. src/components/admin/AdminOrdersPage.tsx
5. src/components/admin/AdminOrdersTab.tsx

QUY TẮC MỚI:
- giftId nội bộ: đúng 4 số, ví dụ 8888.
- Mã đơn: Dearly8888.
- Nội dung chuyển khoản: Dearly8888.
- Admin hiển thị: Dearly8888.
- Admin tìm được Dearly8888 hoặc 8888.

FLOW:
- Vào checkout: KHÔNG sinh mã.
- Điền đủ tên/email/SĐT.
- Bấm Tạo QR.
- Lúc đó mới tạo một mã 4 số chưa tồn tại trên Firestore.
- Sau đó mới tạo order và QR.

SESSION CŨ:
- ID cũ dạng CZW47J3UVJ bị loại khỏi session.
- Không tái sử dụng làm mã đơn mới.

DỮ LIỆU CŨ:
- Không xóa đơn cũ khỏi Firestore.
- Chỉ đơn mới sau bản này dùng Dearly + 4 số.
