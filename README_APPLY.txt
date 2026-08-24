DEARLY — ASSET LIBRARY V4.1
CODE ASSETS + UPLOADED ASSETS

ĐÂY LÀ BẢN CỘNG DỒN.
Nếu chưa cài V4 thì chỉ cần cài V4.1 này.

KHO TÀI NGUYÊN SẼ CÓ CẢ
1. File đang có sẵn trong public/images/**
2. File upload mới qua Firebase Storage

QUAN TRỌNG
vite.config.ts tự quét public/images/** khi dev/build.
Không phải khai báo từng ảnh.

Ví dụ:
public/images/anh-thiep/card-01.png
→ Ảnh thiệp

public/images/sticker/heart.png
→ Sticker

public/images/background/pink-paper.webp
→ Background

public/images/letter/envelope-cover.png
→ Ảnh thiệp

public/images/template-assets/proposal/cat-love-sticker.gif
→ Sticker

public/images/gifts/gift-1.png
→ Quà / Gifts

TRONG MODAL KHO TÀI NGUYÊN
Filter:
- Tất cả
- Trong code
- Đã upload

Tài nguyên trong code:
- badge CODE
- chọn được bình thường
- dùng URL /images/...
- read-only trong Admin

Tài nguyên upload:
- Firebase Storage
- rename
- tags
- đổi folder
- delete

CURRENT MAIN ĐÃ XÁC NHẬN CÓ 8 FILE ẢNH/GIF:
- /images/cat-default.gif
- /images/dearly-logo.png
- /images/gifts/gift-1.png
- /images/gifts/gift-2.png
- /images/gifts/gift-3.png
- /images/gifts/success.gif
- /images/letter/envelope-cover.png
- /images/template-assets/proposal/cat-love-sticker.gif

CÁCH TỔ CHỨC CODE SAU NÀY
public/images/
├── anh-thiep/
├── background/
├── sticker/
├── nhan-vat/
├── hoa-cay/
├── banh-sinh-nhat/
├── tape-scrapbook/
├── icon-decor/
├── gif/
└── ...

Sau khi thêm file mới: restart dev hoặc build/deploy lại.
