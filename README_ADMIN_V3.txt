GIFTS ADMIN V3 - QUICK ASSET PICKER + POLAROID FLOW
===================================================

Thay/copy toàn bộ các file trong ZIP vào đúng vị trí tương ứng của repo Gifts.

THAY ĐỔI MỚI V3
1. src/components/admin/AdminVisualTemplateEditor.tsx
   - + Ảnh: tạo một object ảnh trống ngay trên canvas, KHÔNG tự mở kho tài nguyên.
   - + Khung Polaroid: tạo Polaroid trống ngay trên canvas, KHÔNG tự mở kho tài nguyên.
   - Nút Tài nguyên và nút chọn ảnh trong Inspector mở Quick Asset Picker mới.

2. src/components/admin/visual-editor/QuickAssetPickerModal.tsx (FILE MỚI)
   - Mặc định mở tab Gần đây.
   - Search được focus ngay khi mở.
   - Có Tất cả + các folder dạng chip để đổi cực nhanh.
   - Click trực tiếp thumbnail = chọn ngay.
   - Nút "Quản lý kho" mới mở AssetLibraryModal cũ để upload/sửa/xóa.

CÁCH DÙNG SAU KHI SỬA
- Muốn tạo ảnh: bấm + Ảnh -> object xuất hiện -> chọn object -> Chọn ảnh từ kho ở panel bên phải.
- Muốn Polaroid: bấm + Khung Polaroid -> khung xuất hiện -> chọn khung -> Chọn ảnh ở panel bên phải.
- Muốn chèn sticker/decor nhanh: bấm Tài nguyên -> Gần đây/folder/search -> click ảnh.

KIỂM TRA
- AdminVisualTemplateEditor.tsx được dựng trực tiếp từ blob hiện tại trên GitHub main.
- Reverse patch cho ra đúng Git blob SHA gốc: fe4fce8466f59e4c3a89b92575ae949f12e5f584.
- TypeScript transpile syntax check: 0 errors cho 2 file V3.

LƯU Ý
- File AssetLibraryModal.tsx cũ KHÔNG bị thay đổi. Quick picker dùng nó khi bấm "Quản lý kho".
- ZIP này đã bao gồm các file của bản Admin overhaul V2 trước đó + 2 file V3.
