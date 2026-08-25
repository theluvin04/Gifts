DEARLY ADMIN V4 - SMART MOBILE LAYOUT

Thay đổi chính:
1. Lần đầu bấm "Điện thoại ✨", editor tự tạo bố cục mobile từ Desktop.
2. Tự tăng/giới hạn width theo loại object, giữ object trong khung 9:16.
3. Hai object desktop nằm ngang nhưng chồng nhau trên mobile sẽ được đẩy xuống để giảm overlap.
4. Group giữ cùng phép biến đổi tương đối; decor không bị ép stack như content chính.
5. Nếu object đã có mobileFrame thì chuyển qua mobile KHÔNG ghi đè.
6. Nút "✨ Tự căn lại" cho phép chủ động tạo lại toàn bộ mobile từ Desktop và có confirm trước khi ghi đè.
7. Object mới thêm trong lúc đang ở mobile cũng được tạo mobileFrame tự động.
8. SceneCanvas thật trên điện thoại dùng aspect ratio 9:16 để khớp với editor/preview.

Nếu đã cài V3 trước đó, chỉ cần thay 2 file:
- src/components/admin/AdminVisualTemplateEditor.tsx
- src/engine/scene/SceneCanvas.tsx

Nếu chưa cài V3, dùng ZIP full V4.
