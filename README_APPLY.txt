DEARLY — CHECKOUT ORDER FLOW FIX

THAY 4 FILE:
1. src/components/CheckoutPage.tsx
2. src/services/giftService.ts
3. src/components/admin/AdminOrdersPage.tsx
4. src/components/admin/AdminOrdersTab.tsx

FLOW MỚI:
- Vào /checkout/love-01: chỉ đọc giá.
- CHƯA tạo gift document.
- CHƯA sinh mã đơn.
- Khách điền đủ Tên + Email + SĐT.
- Khách bấm "Tạo QR thanh toán".
- Lúc đó mới sinh giftId.
- Lúc đó mới tạo Firestore order.
- paymentReference = Dearly + giftId.
- Admin thấy đơn ngay sau khi refresh.

ADMIN:
- Không tính các ghost draft cũ chưa có thông tin khách vào "Đơn hàng".
- Tìm được bằng:
  DearlyCZW47J3UVJ
  hoặc CZW47J3UVJ
  hoặc tên/email/SĐT.
- Cột đầu hiển thị mã đơn dạng DearlyXXXXXXXXXX.

SESSION CŨ:
- Nếu sessionStorage đang giữ một draft "unpaid" cũ được sinh quá sớm,
  checkout tự bỏ ID đó và không dùng làm mã đơn mới.
