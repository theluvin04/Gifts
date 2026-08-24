DEARLY — BRAND + NO DEMO + TEMPLATE ARCHITECTURE

MỤC TIÊU:
1. Xóa hoàn toàn live demo khỏi Product Detail.
2. Không còn logo "Gifts" cũ ở Product Detail.
3. /templates/love-01 và các link demo cũ tự chuyển về /products/love-01.
4. App.tsx không còn chứa toàn bộ logic riêng của Love Story 01.
5. Chuẩn bị cấu trúc để thêm template mới mà không phình App.tsx.

THAY FILE:
- src/App.tsx
- src/components/ProductDetailPage.tsx
- src/services/templateService.ts
- index.html
- metadata.json

THÊM FILE MỚI:
- src/components/BrandLogo.tsx
- src/routing/appRouter.ts
- src/templates/types.ts
- src/templates/registry.ts
- src/templates/love-01/index.tsx
- src/templates/love-01/LoveStoryExperience.tsx

CẤU TRÚC MỚI:

src/
├── App.tsx
├── hooks/
│   ├── useAppNavigation.ts
│   ├── useSharedGift.ts
│   └── useTemplateDrafts.ts
├── routing/
│   └── appRouter.ts
└── templates/
    ├── types.ts
    ├── registry.ts
    └── love-01/
        ├── index.tsx
        └── LoveStoryExperience.tsx

CÁCH THÊM TEMPLATE MỚI SAU NÀY:

src/templates/birthday-01/
├── index.tsx
├── BirthdayProductPage.tsx
├── BirthdayEditorPage.tsx
├── BirthdayCheckoutPage.tsx
└── BirthdayExperience.tsx

Sau đó chỉ đăng ký module trong:
src/templates/registry.ts

App.tsx KHÔNG cần nhét thêm proposal/gift/music/letter route của template mới.

LƯU Ý:
- Không sửa Firebase config.
- Không sửa Firestore rules.
- Không sửa payment/order code.
- Không sửa Admin auth.
- Gift đã thanh toán vẫn mở bằng /gift/<random-token>.
- Không còn public live demo từ Product Detail.

THÊM FILE MỚI:
- src/hooks/useAppNavigation.ts
- src/hooks/useSharedGift.ts
- src/hooks/useTemplateDrafts.ts

App.tsx giờ chỉ làm nhiệm vụ điều phối page/module.
Routing, draft local và load gift đã được tách ra hook riêng.
