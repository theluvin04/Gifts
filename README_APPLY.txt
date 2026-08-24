V7 STEP 6 — LÀM RÕ LOGIC TEMPLATE + CHỌN TEMPLATE ỔN ĐỊNH

CHỈ SỬA 2 FILE.

LOGIC SAU KHI SỬA

1. FIRESTORE = DANH SÁCH TEMPLATE ADMIN
Admin dropdown đọc collection:
templates/{templateId}

Ví dụ:
templates/love-01
templates/birthday-01
templates/anniversary-01

Nếu Firestore chỉ có love-01:
dropdown chỉ có 1 lựa chọn.
Không có template bí mật nào khác để chọn.

2. URL = TEMPLATE ĐANG CHỈNH
Ví dụ:
 /admin/templates?template=love-01
 /admin/templates?template=birthday-01

Khi:
- chọn dropdown
- tạo template
- xóa template
URL tự cập nhật.

Refresh trang vẫn quay lại đúng template.
Back/Forward cũng đổi template.

3. VISUAL EDITOR REMOUNT THEO TEMPLATE ID
AdminVisualTemplateEditor có:
key={template.id}

Khi đổi love-01 -> birthday-01:
editor cũ bị unmount hoàn toàn.
Editor mới mount với scene/config của birthday-01.
Không giữ selection/scene state của template trước.

4. UI NÓI RÕ ĐANG CHỈNH CÁI GÌ
Trên Bố cục sẽ hiện:
Đang chỉnh
[Tên template] [template-id] [Chưa lưu / Đã đồng bộ]

5. NẾU CHỈ CÓ 1 TEMPLATE
UI hiện:
“Firestore hiện chỉ có 1 template. Bấm + Sản phẩm để tạo template thứ 2...”

LƯU Ý QUAN TRỌNG
src/templates/registry.ts hiện chỉ đăng ký module public love-01.
Đây là hệ PUBLIC RUNTIME, khác với danh sách template Admin trong Firestore.

Bước này chỉ sửa logic CHỌN / NHẬN DIỆN template trong Admin.
Chưa generic hóa public runtime cho template mới.
