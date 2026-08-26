@echo off
cd /d "%~dp0"
node apply_font_system.mjs
if errorlevel 1 (
  echo.
  echo CO LOI - xem thong bao phia tren.
  pause
  exit /b 1
)
echo.
echo XONG. Chay npm run build de test.
pause
