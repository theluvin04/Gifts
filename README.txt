FIX PC/MOBILE TYPOGRAPHY + NUMBER INPUT

Patch này được viết theo đúng Gifts/main hiện tại.

SỬA:
1. Font/text style khi chỉnh Mobile không còn làm đổi PC.
2. Button typography cũng tách PC/Mobile.
3. Mobile chưa chỉnh gì vẫn kế thừa PC.
4. Cỡ chữ cho phép từ 1px.
5. Ô số không còn tự nhảy về 6 khi xóa 64 để nhập số mới.

CÁCH DÙNG:
- Giải nén file apply_pc_mobile_typography_fix.mjs vào ROOT repo Gifts
  (cùng cấp package.json).
- Chạy:
    node apply_pc_mobile_typography_fix.mjs
- Sau đó chạy npm run lint hoặc npm run build rồi commit 4 file bị thay đổi.

4 FILE BỊ SỬA:
src/components/admin/visual-editor/EditorControls.tsx
src/components/admin/visual-editor/InspectorPanel.tsx
src/components/admin/visual-editor/EditorCanvas.tsx
src/engine/scene/SceneElementView.tsx

Không cần migrate Firestore. Override Mobile được lưu lồng trong
textStyle.mobile / buttonStyle.mobile; normalize hiện tại của repo giữ nguyên
các field này vì đang spread toàn bộ style object khi load template.
