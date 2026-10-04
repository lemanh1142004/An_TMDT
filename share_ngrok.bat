@echo off
title Fashion Store - Chia Se Link Qua Ngrok
echo ========================================================
echo        CHIA SẺ DỰ ÁN RA INTERNET BẰNG NGROK
echo ========================================================
echo.
echo [*] Đang mở đường hầm kết nối cổng 5173 ra Internet...
echo (Vui lòng đảm bảo Frontend của bạn đang chạy ở cổng 5173)
echo.
ngrok http 5173
pause
