V7 STEP 3 — FIX HIỆU ỨNG KHÔNG CHẠY TRONG CANVAS

CHỈ SỬA 1 FILE:
src/components/admin/visual-editor/EditorCanvas.tsx

LINE COUNT:
1898 -> 1911 (+13)

NGUYÊN NHÂN
Canvas editor trước đây chỉ tự xử lý:
- Xoay thuận liên tục
- Xoay ngược liên tục

Các hiệu ứng khác như:
- Quét từ dưới lên
- Quét từ trái sang
- Zic-zac
- Nảy vào
- Lật vào
- Mờ → rõ
- Rung
- Nhịp thở
không hề đi qua AnimatedElement nên chọn xong không nhìn thấy gì.

FIX
- EditorCanvas dùng cùng AnimatedElement với runtime Preview.
- Khi đổi preset / duration / delay / easing, key đổi -> animation replay ngay.
- Typewriter / hiện từng từ / từng dòng vẫn dùng AnimatedTextContent riêng, tránh chạy animation 2 lần.
- Bỏ CSS spin riêng của editor, tất cả dùng chung một animation engine.

TEST
1. Chọn ảnh.
2. Hiệu ứng -> Quét từ dưới lên.
3. Đổi dropdown -> phải thấy animation chạy ngay trên canvas.
4. Đổi Thời lượng 520 -> 1500 -> phải replay chậm hơn.
5. Thử Zic-zac từ trái.
6. Thử Nảy vào.
7. Với chữ thử Đánh chữ từng ký tự.

Không sửa layer/template/preview ở step này.
