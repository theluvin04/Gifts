DEARLY — ASSET LIBRARY V4

MỤC TIÊU
Thêm kho tài nguyên thật cho Visual Editor:
- upload ảnh / GIF
- chia thư mục
- tìm kiếm
- chọn asset đã upload
- thay ảnh hiện tại
- chọn background
- dùng lại asset cho nhiều template

KHO MẶC ĐỊNH
- Ảnh thiệp
- Background
- Sticker
- Nhân vật
- Hoa & cây
- Bánh & sinh nhật
- Tape & scrapbook
- Icon & decor
- GIF
- Khác

CÓ THỂ TẠO THƯ MỤC RIÊNG
VD:
- Thiệp sinh nhật
- Thiệp tốt nghiệp
- Hoa hồng
- Cake
- Tape vintage

TRONG VISUAL EDITOR
1. Nút "Tài nguyên"
   → mở toàn bộ kho
   → chọn asset
   → asset được thêm vào canvas

2. Properties của Image / Decor
   → "Chọn từ kho tài nguyên"
   → thay src của element hiện tại

3. Properties của Scene
   → "Chọn ảnh nền từ kho tài nguyên"

ASSET LIBRARY
- sidebar thư mục + số lượng
- search theo tên / folder / tag
- upload nhiều file một lúc
- chọn folder trước khi upload
- tạo folder custom
- rename asset
- đổi folder
- tags
- delete
- PNG / JPG / WEBP / GIF
- max 15MB / file

LƯU TRỮ
- file thật: Firebase Storage /dearly-assets/...
- metadata: Firestore /assetLibrary/{id}
- custom folder: Firestore /assetFolders/{id}

CẦN LÀM 1 LẦN TRONG FIREBASE
1. Bật Firebase Storage nếu project chưa bật.
2. Deploy/paste firestore.rules mới vào named Firestore database đang dùng.
3. Deploy/paste storage.rules vào Firebase Storage Rules.

LƯU Ý SECURITY
Project hiện dùng named Firestore database cho Admin allowlist.
Theo Firebase, Storage Rules chỉ đọc được default Firestore database khi project có nhiều database.
Vì vậy:
- app vẫn check Admin allowlist trước mọi upload/delete/update;
- Storage rule bổ sung chặn Anonymous và chỉ cho Google-authenticated session upload ảnh <=15MB.
Nếu sau này public lớn hơn, nên chuyển quyền Admin sang Firebase custom claim hoặc backend upload endpoint.

KHÔNG CẦN
- không nhét base64 vào Firestore
- không cần copy file thủ công vào public/images
