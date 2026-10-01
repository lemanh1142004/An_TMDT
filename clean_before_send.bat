@echo off
chcp 65001 > nul
title Fashion Store - Dọn Dẹp File Rác Trước Khi Gửi
echo ========================================================
echo   DỌN DẸP CÁC FILE RÁC / BUILD TẠM THỜI (TIẾT KIỆM ~300MB)
echo ========================================================
echo.
echo Bạn có chắc chắn muốn xóa node_modules, target, dist để nén gửi dự án không?
echo (Đừng lo: Khi chạy lại, hệ thống sẽ tự động cài lại các thư mục này!)
echo.
pause

echo.
echo [*] Đang xóa thư mục node_modules...
if exist node_modules rmdir /s /q node_modules
if exist frontend\node_modules rmdir /s /q frontend\node_modules

echo [*] Đang xóa thư mục build dist...
if exist frontend\dist rmdir /s /q frontend\dist

echo [*] Đang xóa thư mục target của backend & gateway...
if exist backend\target rmdir /s /q backend\target
if exist gateway\target rmdir /s /q gateway\target

echo [*] Đang xóa các script kiểm thử tạm thời (.cjs)...
if exist test_features.cjs del /f /q test_features.cjs
if exist take_screenshots.cjs del /f /q take_screenshots.cjs
if exist test_upload_and_pagination.cjs del /f /q test_upload_and_pagination.cjs
if exist verify_new_features.cjs del /f /q verify_new_features.cjs

echo.
echo ========================================================
echo [HOÀN TẤT] Dự án đã được dọn sạch sẽ (~10MB)!
echo Bạn có thể nén toàn bộ thư mục này thành file .zip để gửi ngay.
echo ========================================================
echo.
pause
