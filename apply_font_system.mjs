import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const patchRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = process.cwd();

const fail = (message) => {
  console.error(`\n[Font system] ${message}\n`);
  process.exit(1);
};

const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
};

const copyFromPatch = (relativePath) => {
  const source = path.join(patchRoot, relativePath);
  const target = path.join(repoRoot, relativePath);
  if (!fs.existsSync(source)) {
    fail(`Thiếu file trong ZIP: ${relativePath}`);
  }
  if (path.resolve(source) === path.resolve(target)) {
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
};

const inspectorPath = path.join(
  repoRoot,
  'src/components/admin/visual-editor/InspectorPanel.tsx',
);
const mainPath = path.join(repoRoot, 'src/main.tsx');

if (!fs.existsSync(inspectorPath) || !fs.existsSync(mainPath)) {
  fail('Hãy đặt/extract ZIP vào đúng thư mục gốc repo Gifts rồi chạy lại.');
}

for (const relativePath of [
  'src/config/editorFonts.ts',
  'src/components/admin/visual-editor/QuickFontPicker.tsx',
  'public/fonts/manifest.json',
  'public/fonts/manifest.example.json',
  'public/fonts/README.md',
  'public/fonts/custom/.gitkeep',
]) {
  copyFromPatch(relativePath);
}

let inspector = read(inspectorPath);

if (!inspector.includes("from './QuickFontPicker'")) {
  const importAnchor = "} from './EditorControls';";
  if (!inspector.includes(importAnchor)) {
    fail('Không tìm thấy vị trí import EditorControls trong InspectorPanel.tsx.');
  }
  inspector = inspector.replace(
    importAnchor,
    `${importAnchor}\n\nimport { QuickFontPicker } from './QuickFontPicker';`,
  );
}

const fontOptionsStart = inspector.indexOf('\nconst FONT_OPTIONS = [');
const textControlsStart = inspector.indexOf('\nconst TextControls:', fontOptionsStart);
if (fontOptionsStart !== -1 && textControlsStart !== -1) {
  inspector = inspector.slice(0, fontOptionsStart) + inspector.slice(textControlsStart);
}

if (inspector.includes('<FontPicker\n')) {
  inspector = inspector.replace(
    '      <FontPicker\n        value={',
    '      <QuickFontPicker\n        previewText={\n          element.text\n        }\n        value={',
  );
}

const buttonControlsStart = inspector.indexOf('\nconst ButtonControls:');
if (buttonControlsStart === -1) {
  fail('Không tìm thấy ButtonControls trong InspectorPanel.tsx.');
}

const buttonFontStart = inspector.indexOf(
  '      <TextInput\n        label="Phông chữ"',
  buttonControlsStart,
);

if (buttonFontStart !== -1) {
  const buttonFontEnd = inspector.indexOf(
    '\n\n      <div className="grid grid-cols-2 gap-2">',
    buttonFontStart,
  );

  if (buttonFontEnd === -1) {
    fail('Không xác định được điểm kết thúc ô Phông chữ của button.');
  }

  const replacement = `      <QuickFontPicker
        previewText={
          element.label
        }
        value={
          style.fontFamily ||
          '"Quicksand", sans-serif'
        }
        onChange={(
          fontFamily
        ) =>
          patch({
            fontFamily,
          })
        }
      />`;

  inspector =
    inspector.slice(0, buttonFontStart) +
    replacement +
    inspector.slice(buttonFontEnd);
}

const embeddedPickerStart = inspector.indexOf('\nconst FontPicker:');
const assetPickerStart = inspector.indexOf('\nconst AssetPickerButton:', embeddedPickerStart);
if (embeddedPickerStart !== -1 && assetPickerStart !== -1) {
  inspector = inspector.slice(0, embeddedPickerStart) + inspector.slice(assetPickerStart);
}

if (inspector.includes('<FontPicker')) {
  fail('Vẫn còn FontPicker cũ trong InspectorPanel.tsx; dừng để tránh sửa nửa vời.');
}

if (!inspector.includes('<QuickFontPicker')) {
  fail('Không chèn được QuickFontPicker vào InspectorPanel.tsx.');
}

write(inspectorPath, inspector);

let main = read(mainPath);
if (!main.includes('bootstrapCustomFonts')) {
  const cssImport = "import './index.css';";
  if (!main.includes(cssImport)) {
    fail('Không tìm thấy import index.css trong src/main.tsx.');
  }

  main = main.replace(
    cssImport,
    `${cssImport}\nimport { bootstrapCustomFonts } from './config/editorFonts';`,
  );

  const rootAnchor = 'createRoot(document.getElementById(\'root\')!).render(';
  if (!main.includes(rootAnchor)) {
    fail('Không tìm thấy createRoot trong src/main.tsx.');
  }

  main = main.replace(
    rootAnchor,
    `void bootstrapCustomFonts();\n\n${rootAnchor}`,
  );

  write(mainPath, main);
}

console.log('\n[Font system] Đã cập nhật xong.');
console.log('- Font riêng: public/fonts/custom/');
console.log('- Danh sách font riêng: public/fonts/manifest.json');
console.log('- Picker chữ + button đã dùng chung QuickFontPicker');
console.log('- Trang editor và trang khách đều bootstrap cùng font local');
console.log('\nBây giờ chạy npm run build để kiểm tra.\n');
