FIX ADMIN TEMPLATE SAVE

File cần thay:
src/config/firebase.ts

Nguyên nhân:
Visual Editor tạo một số field optional có giá trị undefined.
Firestore mặc định throw khi serialize undefined, nên save template fail.

Cách sửa:
Khởi tạo Firestore với:
ignoreUndefinedProperties: true

Sau khi thay file:
1. deploy lại web
2. hard refresh / đóng tab cũ rồi mở lại Admin
3. sửa template -> Lưu
4. refresh trang -> mở lại đúng template để kiểm tra dữ liệu còn nguyên
