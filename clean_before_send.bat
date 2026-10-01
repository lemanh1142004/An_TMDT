@echo off
title Fashion Store - Don Dep File Rac Truoc Khi Gui
echo ========================================================
echo   DON DEP CAC FILE RAC VA BUILD TAM THOI
echo ========================================================
echo.
echo Ban co chac chan muon xoa node_modules va target khong?
echo.
pause

echo.
echo [*] Dang xoa thu muc node_modules...
if exist node_modules rmdir /s /q node_modules
if exist frontend\node_modules rmdir /s /q frontend\node_modules

echo [*] Dang xoa thu muc build dist...
if exist frontend\dist rmdir /s /q frontend\dist

echo [*] Dang xoa thu muc target...
if exist backend\target rmdir /s /q backend\target
if exist gateway\target rmdir /s /q gateway\target

echo [*] Dang xoa cac file script test tam thoi...
if exist test_features.cjs del /f /q test_features.cjs
if exist take_screenshots.cjs del /f /q take_screenshots.cjs
if exist test_upload_and_pagination.cjs del /f /q test_upload_and_pagination.cjs
if exist verify_new_features.cjs del /f /q verify_new_features.cjs

echo.
echo ========================================================
echo [HOAN TAT] Du an da duoc don sach se!
echo ========================================================
echo.
pause
