# Font riêng cho Gifts editor

## Cấu trúc

```text
public/
  fonts/
    manifest.json
    custom/
      ten-font.woff2
      ten-font-bold.woff2
```

Ưu tiên `.woff2` vì nhẹ và phù hợp web. Có thể dùng `.woff`, `.ttf`, `.otf` nếu cần.

## Thêm font mới

1. Chép file font vào `public/fonts/custom/`.
2. Deploy lại website.

`vite.config.ts` sẽ tự quét thư mục và tạo lại
`public/fonts/manifest.json`. Không cần khai báo JSON thủ công.

Tên hiển thị được lấy từ tên file. Các hậu tố như `Regular`, `Bold`,
`Italic`, `Personal Use`, `Demo` được tự nhận diện và loại khỏi tên font.

Editor sẽ tự đọc manifest, nạp `@font-face`, thêm font vào mục **Font riêng**, cho xem preview trực tiếp và lưu `fontFamily` vào element. Vì font được bootstrap ở `src/main.tsx`, trang khách/preview cũng dùng cùng font, không chỉ riêng màn hình editor.

### Ví dụ một font 1 weight

```json
{
  "fonts": [
    {
      "label": "My Handwriting",
      "family": "My Handwriting",
      "group": "Font riêng",
      "fallback": "cursive",
      "sources": [
        {
          "src": "/fonts/custom/my-handwriting.woff2",
          "format": "woff2",
          "weight": 400,
          "style": "normal"
        }
      ]
    }
  ]
}
```

Không cần sửa `manifest.json`, `InspectorPanel.tsx` hay
`QuickFontPicker.tsx` mỗi lần thêm font nữa.
