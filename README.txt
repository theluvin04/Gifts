Gifts Admin V5 - Font picker + Smart Mobile fix

Replace/add exactly these files:
1. src/components/admin/AdminVisualTemplateEditor.tsx
2. src/components/admin/visual-editor/QuickFontPicker.tsx (NEW)

Changes:
- Quick font picker appears in the editor toolbar when exactly one text/button is selected.
- Searchable font grid with live preview, categories and recent fonts.
- Smart Mobile regenerate is now one-click, always overwrites mobile layout from Desktop and shows feedback.
- Mobile layout mapping now fits/spreads desktop composition into the 9:16 safe area more clearly.
