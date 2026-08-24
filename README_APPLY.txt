DEARLY — FULL FIX

THAY FILE:
src/App.tsx
src/components/Homepage.tsx
src/components/admin/AdminOrdersPage.tsx
src/components/CheckoutPage.tsx
src/components/CreateLovePage.tsx
src/components/gifts/VinylMusicPlayer.tsx
src/services/giftService.ts
src/services/templateService.ts
src/config/payment.ts
src/types/index.ts

THÊM FILE MỚI:
src/utils/youtube.ts

1. URL ADMIN:
 /admin
 /admin/orders
 /admin/templates
 /admin/customers
 /admin/discounts
 /admin/settings
 /admin/orders/:giftId

Không còn /admin#orders hay /admin#templates.
Link hash cũ tự chuyển sang route mới.

2. HOME:
Nút Templates / Cách hoạt động chỉ scroll.
URL vẫn giữ /, không sinh #templates hoặc #how-it-works.

3. GIÁ:
Đơn draft chưa thanh toán luôn đọc lại giá hiện tại từ
Firestore templates/love-01.

Nếu Admin đổi sale xuống 20.000đ thì checkout cũ đang giữ
draft 99.000đ cũng được cập nhật về 20.000đ khi mở checkout lại.

Checkout đọc lại giá thêm một lần trước khi hiện QR.

Nếu Firestore lỗi quyền khi lấy giá, checkout báo lỗi thay vì
âm thầm fallback về 99.000đ rồi thu sai tiền.

4. NỘI DUNG CHUYỂN KHOẢN:
Cũ: GIFT CZW47J3UVJ
Mới: DearlyCZW47J3UVJ

VietQR và nội dung hiển thị dùng cùng reference.

5. GIỮ CÁC FIX TRƯỚC:
Không preview trước thanh toán.
YouTube music vẫn hoạt động.
Không sửa firestore.rules / Firebase config / ngân hàng.
