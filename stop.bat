@echo off
chcp 65001 > nul
title Fashion Store - Dừng Hệ Thống
echo Đang dừng tất cả container Fashion Store...
docker compose down
echo.
echo Đã dừng toàn bộ dịch vụ an toàn!
pause
