DEARLY — SECURE GIFT LINK + SUCCESS UI + VINYL FIX

THAY 5 FILE:
1. src/components/CheckoutPage.tsx
2. src/services/giftService.ts
3. src/config/payment.ts
4. src/components/gifts/VinylMusicPlayer.tsx
5. firestore.rules

QUAN TRỌNG:
Sau khi thay firestore.rules phải Publish rules vào đúng Firestore database.

MÃ ĐƠN VS LINK:
- Mã đơn thanh toán: Dearly8888
- orderNumber: 8888
- Public gift token: random 24 ký tự, ví dụ J7kP2m...
- Link: /gift/J7kP2m...
- Không thể suy ra gift link từ Dearly8888.

CHỐNG TRÙNG MÃ ĐƠN:
- Tạo /orderCodes/{8888} bằng create-only Firestore rule.
- Nếu 8888 đã tồn tại, write bị từ chối và client tự thử mã 4 số khác.
- Public user không được list/read orderCodes.

SUCCESS SCREEN:
- UI mới tối giản hơn.
- Có QR riêng để mở gift.
- Có Copy link.
- Có nút Mở món quà.
- Hiển thị mã đơn Dearly#### riêng biệt với URL.

VINYL:
- YouTube track: đĩa vinyl xoay rõ ràng.
- Audio track: xoay khi audio đang play.
- Ảnh giữa đĩa scale/crop kín hình tròn.
