DEARLY — CUMULATIVE PHASE 1 + 2 + 3
VISUAL TEMPLATE EDITOR / CANVA MINI FOUNDATION

GitHub main lúc kiểm tra:
- Admin sticky save: CÓ
- src/engine/: CHƯA CÓ
- Love Story public: vẫn renderer hard-code

BUNDLE NÀY GỘP TOÀN BỘ PHASE 1 + 2 + 3.

ADMIN → TEMPLATES → BỐ CỤC

TÍNH NĂNG:
- Tạo / nhân bản / xóa scene
- Đặt scene đầu
- Desktop / Mobile layout riêng
- Thêm Text / Ảnh / Nút / Decor
- Click chọn element
- Drag bằng chuột
- Resize bằng handle góc phải dưới
- Rotate bằng handle phía trên
- X / Y / Width / Height / Rotate / Scale / Opacity
- Layer z-index
- Ẩn / hiện
- Khóa element
- Animation + delay + duration
- Click action: chuyển scene / back / toggle / replay / open URL
- Background / overlay / blur / brightness
- Transition scene
- Interactive Preview trong Admin
- Save vào Firestore qua template.visualEditor

KIẾN TRÚC UI ĐÃ TÁCH:
src/components/admin/visual-editor/
├── EditorCanvas.tsx
├── InspectorPanel.tsx
├── LayersPanel.tsx
├── EditorControls.tsx
├── PreviewOverlay.tsx
└── editorUtils.ts

AdminVisualTemplateEditor.tsx chỉ điều phối state + scene/element CRUD.

LƯU Ý:
Visual Editor đã thiết kế + lưu + preview thật.
Love Story 01 ngoài storefront CHƯA dùng visualEditor để tránh phá flow khách hiện tại.
Bước tiếp theo là tạo Birthday template scene-based chạy trực tiếp bằng config này.

LINE COUNTS VS GITHUB MAIN:
SỬA — src/components/GiftSelector.tsx: 209 -> 198 (-11)
SỬA — src/components/admin/AdminTemplatesTab.tsx: 587 -> 627 (+40)
THÊM FILE MỚI — src/components/admin/AdminVisualTemplateEditor.tsx: 902 dòng
THÊM FILE MỚI — src/components/admin/visual-editor/EditorCanvas.tsx: 705 dòng
THÊM FILE MỚI — src/components/admin/visual-editor/EditorControls.tsx: 418 dòng
THÊM FILE MỚI — src/components/admin/visual-editor/InspectorPanel.tsx: 1283 dòng
THÊM FILE MỚI — src/components/admin/visual-editor/LayersPanel.tsx: 132 dòng
THÊM FILE MỚI — src/components/admin/visual-editor/PreviewOverlay.tsx: 60 dòng
THÊM FILE MỚI — src/components/admin/visual-editor/editorUtils.ts: 157 dòng
THÊM FILE MỚI — src/engine/animation/AnimatedElement.tsx: 143 dòng
THÊM FILE MỚI — src/engine/animation/AnimatedGroup.tsx: 92 dòng
THÊM FILE MỚI — src/engine/animation/presets.ts: 386 dòng
THÊM FILE MỚI — src/engine/animation/types.ts: 103 dòng
THÊM FILE MỚI — src/engine/index.ts: 89 dòng
THÊM FILE MỚI — src/engine/scene/SceneCanvas.tsx: 293 dòng
THÊM FILE MỚI — src/engine/scene/SceneElementView.tsx: 423 dòng
THÊM FILE MỚI — src/engine/scene/SceneTransition.tsx: 251 dòng
THÊM FILE MỚI — src/engine/scene/VisualSceneExperience.tsx: 198 dòng
THÊM FILE MỚI — src/engine/scene/actions.ts: 172 dòng
THÊM FILE MỚI — src/engine/scene/elementTypes.ts: 256 dòng
THÊM FILE MỚI — src/engine/scene/types.ts: 51 dòng
THÊM FILE MỚI — src/engine/scene/useSceneController.ts: 145 dòng
THÊM FILE MỚI — src/engine/scene/useSceneElementRuntime.ts: 201 dòng
SỬA — src/services/templateService.ts: 373 -> 524 (+151)
SỬA — src/templates/love-01/LoveStoryExperience.tsx: 335 -> 388 (+53)
THÊM FILE MỚI — src/templates/love-01/engineExampleScene.ts: 100 dòng
THÊM FILE MỚI — src/templates/love-01/sceneConfig.ts: 49 dòng
THÊM FILE MỚI — src/templates/visualEditor.ts: 1406 dòng
