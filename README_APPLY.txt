DEARLY HOME + FIREBASE FIX

THAY 3 FILE:
1. src/components/Homepage.tsx
2. src/services/adminService.ts
3. firestore.rules

QUAN TRỌNG:
Sau khi thay firestore.rules trong project, vào Firebase Console →
Cloud Firestore → chọn đúng database app đang dùng →
ai-studio-romanticlovesurp-1b89a4b9-dcb7-435b-ad96-d70becbbc72c →
Security / Rules → paste file firestore.rules này → Publish.

Fix Firebase trong bundle:
- Template config lỗi quyền sẽ fallback về giá mặc định thay vì làm toàn Admin chết.
- /templates/love-01 được public GET cho storefront.
- Chỉ Admin mới được sửa template.
- Giữ quyền Orders/Gifts và Admin Gmail/UID.

Homepage:
- Bo card 30px.
- Khối ảnh bên trong bo 24px.
- Shadow nhẹ.
- Ảnh Love Story lớn hơn.
- Giá / giá gạch / giảm giá rõ hơn.
- Coming soon đồng bộ bo góc.
