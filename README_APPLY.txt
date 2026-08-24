DEARLY ASSET LIBRARY V4.1.1 — PERMISSION FIX

LỖI ĐÃ XÁC ĐỊNH
Firestore assetLibrary/assetFolders trả Missing or insufficient permissions.
V4.1 dùng Promise.all và service throw trước khi trả codeAssets, nên public/images/** bị biến mất.

FIX
- public/images/** được build/normalize trước.
- Firestore assetLibrary chỉ là nguồn bổ sung.
- Firestore lỗi -> vẫn trả code assets.
- assetFolders lỗi -> vẫn trả folder từ code + default.
- Upload vẫn cần Firebase rules đúng, nhưng không còn ảnh hưởng tới tab "Trong code".

FILE
src/services/assetLibraryService.ts

LINE COUNT
1024 -> 1064 (+40)

SAU KHI THAY FILE
1. AI Studio restart server / refresh Preview.
2. Admin -> Templates -> Bố cục -> Tài nguyên.
3. Bấm "Trong code".
4. Phải thấy các file đang có trong public/images/**.

Hiện GitHub main đã xác nhận có:
- /images/cat-default.gif
- /images/dearly-logo.png
- /images/gifts/gift-1.png
- /images/gifts/gift-2.png
- /images/gifts/gift-3.png
- /images/gifts/success.gif
- /images/letter/envelope-cover.png
- /images/template-assets/proposal/cat-love-sticker.gif

Nếu phần "Đã upload" vẫn chưa dùng được thì deploy firestore.rules/storage.rules sau.
Điều đó KHÔNG còn được phép làm mất ảnh "Trong code".
