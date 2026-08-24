DEARLY — VISUAL EDITOR V3 + MULTI PRODUCT ADMIN

BẢN NÀY LÀ BẢN CỘNG DỒN.
Dùng V3 này thay cho ZIP Visual Editor V2 trước.

1. BỐ CỤC EDITOR GỌN HƠN
- Header Visual Editor nhỏ lại
- Toolbar sticky
- Canvas tự fit vào vùng còn lại của màn hình
- Canvas có chiều cao theo viewport
- Layers tự scroll
- Properties tự scroll
- Có nút ẩn/hiện Layers
- Có nút ẩn/hiện Properties
- Có chế độ Toàn màn hình
- Màn hình < 1200px tự chuyển workspace thành 1 cột để không tràn ngang
- Product header / tab Admin nhỏ gọn hơn

2. QUẢN LÝ NHIỀU SẢN PHẨM
Admin → Templates:
- dropdown đổi sản phẩm
- + Sản phẩm
- tạo canvas trắng
- nhân bản sản phẩm hiện tại
- xóa sản phẩm
- love-01 được bảo vệ không cho xóa
- mỗi sản phẩm lưu document riêng: templates/{productId}
- save dùng đúng productId, không còn hard-code love-01
- list toàn bộ template từ Firestore
- sản phẩm mới mặc định coming_soon + hidden để không lộ khi chưa làm xong

3. TẠO SẢN PHẨM TRẮNG
Sản phẩm mới có:
- 1 scene trắng
- Visual Engine bật
- giá mặc định
- status coming_soon
- visible false
Sau đó vào Bố cục và tự design.

4. NHÂN BẢN
Nhân bản copy:
- scene
- element
- position
- desktop/mobile
- animation
- click action
- style
- asset/config hiện tại

5. CANVA MINI V2 VẪN GIỮ NGUYÊN
- multi-select
- marquee select
- drag nhiều object
- group / ungroup
- copy / paste / duplicate
- undo / redo
- keyboard shortcuts
- align / distribute
- layer
- lock / visible
- grid / snap guide
- zoom
- shape
- text formatting
- animation
- click action

FIREBASE
Không cần sửa firestore.rules.
Rules hiện tại đã cho Admin list/create/update/delete /templates.

LƯU Ý PUBLIC
Tạo sản phẩm mới ở V3 tạo product/template THẬT trong Firestore và design được ngay.
Public storefront hiện vẫn dùng registry module tĩnh.
Vì vậy product mới chưa tự xuất hiện ngoài Home / checkout cho đến khi làm bước Generic Customer Fields + Generic Checkout.

CÁCH DÙNG
1. Thay các file trong ZIP đúng path.
2. Vào /admin/templates
3. Bấm + Sản phẩm
4. Nhập tên + ID
5. Tạo sản phẩm
6. Vào Bố cục
7. Bấm Toàn màn hình để design
8. Lưu thay đổi
