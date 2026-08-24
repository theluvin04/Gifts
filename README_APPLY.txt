DEARLY — MOBILE OVERFLOW FIX

Mục tiêu: sửa layout mobile bị tràn/cắt sang phải, không chỉ che bằng overflow-x-hidden.

THAY 7 FILE:
- src/index.css
- src/components/Homepage.tsx
- src/components/ProductDetailPage.tsx
- src/components/CreateLovePage.tsx
- src/components/CheckoutPage.tsx
- src/components/gifts/PolaroidGallery.tsx
- src/components/gifts/VinylMusicPlayer.tsx

ĐÃ SỬA:
- Global viewport clamp cho html/body/#root và media.
- Home header rút gọn trên mobile, không ép logo + 2 nút dài trên cùng một hàng.
- Product header chuyển sang 44px / center / 44px ở mobile, chỉ hiện mũi tên.
- Create page dùng grid header mobile chuẩn; tab ngang không kéo body rộng; các card/input có min-w-0.
- Checkout bổ sung min-w-0 và typography nhỏ hơn ở màn rất hẹp.
- Polaroid mobile dùng max-width thật của viewport và giảm gap/padding ở màn <360px.
- Vinyl player co được xuống màn 320–359px; đĩa, controls và panel không ép viewport.

LINE COUNTS:
src/index.css: 58 -> 84 (+26)
src/components/Homepage.tsx: 714 -> 716 (+2)
src/components/ProductDetailPage.tsx: 383 -> 385 (+2)
src/components/CreateLovePage.tsx: 1706 -> 1706 (+0)
src/components/CheckoutPage.tsx: 1261 -> 1261 (+0)
src/components/gifts/PolaroidGallery.tsx: 618 -> 618 (+0)
src/components/gifts/VinylMusicPlayer.tsx: 738 -> 738 (+0)
