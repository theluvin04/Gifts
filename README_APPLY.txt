DEARLY — 8 UNIQUE MEMORY PHOTOS

BUNDLE CUMULATIVE MỚI.

BỐ CỤC:

4 ẢNH CHÍNH
- Ảnh 1: trái trên
- Ảnh 2: trái dưới
- Ảnh 3: phải trên
- Ảnh 4: phải dưới

4 ảnh chính có caption khách tự sửa.

4 ẢNH COLLAGE RIÊNG
- Ảnh 5: strip trái / trên
- Ảnh 6: strip trái / dưới
- Ảnh 7: strip phải / trên
- Ảnh 8: strip phải / dưới

Ảnh 5-8 không caption.

FIX TRÙNG ẢNH:
Code cũ dùng:
  safePhotos[i % safePhotos.length]

nên bắt buộc lặp ảnh.

Code mới:
- chỉ lấy index 4,5,6,7 cho collage
- không modulo
- không quay vòng
- thiếu ảnh thì placeholder ♡
- tuyệt đối không lấy ảnh 1-4 chèn lại vào giữa

FORM KHÁCH:
Ảnh kỷ niệm chia thành:
1. 4 ảnh chính
2. 4 ảnh phụ cho collage giữa

Draft cũ có 5 ảnh vẫn mở đủ 8 slot.
Khi upload ảnh 6/7/8 config tự mở rộng lên 8.

CHỈ THAY:
- src/components/CreateLovePage.tsx
- src/components/gifts/PolaroidGallery.tsx

Không cần sửa Firebase / Admin / Checkout.
