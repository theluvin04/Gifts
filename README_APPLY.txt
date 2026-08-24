V7 STEP 8 — PERMISSION KHO TÀI NGUYÊN

assetLibraryService.ts
1064 -> 1153 (+89)

AssetLibraryModal.tsx
1416 -> 1472 (+56)

Fix:
- bỏ spam console warning lặp vô hạn
- ảnh trong code vẫn dùng
- nếu Firestore chặn assetLibrary/assetFolders:
  + hiện 1 cảnh báo rõ trong modal
  + tắt Upload
  + tắt + Thư mục

Không bypass Firestore security.
Muốn upload cloud hoạt động thật vẫn phải có live rules đúng.
