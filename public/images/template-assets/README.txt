DEARLY TEMPLATE ASSETS

Hiện tại chưa dùng Firebase Storage.

Cách thêm file:
1. Copy GIF/PNG/JPG/WebP vào đúng folder.
2. Deploy code.
3. Vào /admin/templates -> Asset Library.
4. Thêm asset và nhập đường dẫn bắt đầu bằng /images/...

Gợi ý:

public/images/template-assets/proposal/
  cat-initial-01.gif
  cat-no-01.gif
  cat-success-01.gif

Admin path:
  /images/template-assets/proposal/cat-no-01.gif

public/images/template-assets/gifts/
  gift-box-pink.png
  gift-box-red.png

Admin path:
  /images/template-assets/gifts/gift-box-pink.png

public/images/template-assets/letter/
  envelope-01.png
  envelope-02.png

Admin path:
  /images/template-assets/letter/envelope-02.png

LƯU Ý:
- Không đưa GIF thành base64 vào Firestore.
- Asset Library trong Firestore chỉ lưu path/URL.
- Khi sau này bật Firebase Storage, chỉ thay path bằng Storage URL.
