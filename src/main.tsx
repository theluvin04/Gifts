import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {bootstrapCustomFonts} from './config/editorFonts';

// Register local @font-face rules before the editor, preview or customer page
// tries to render text. The promise is intentionally non-blocking.
void bootstrapCustomFonts();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
