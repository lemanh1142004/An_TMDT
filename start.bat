@echo off
chcp 65001 > nul
title Fashion Store - Khởi Chạy Hệ Thống Tự Động
echo ========================================================
echo        HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ FASHION STORE
echo ========================================================
echo.

echo [1/3] Đang khởi động Cơ sở dữ liệu PostgreSQL & Redis qua Docker...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo [CẢNH BÁO] Không thể khởi động Docker. Vui lòng đảm bảo Docker Desktop đang mở!
    echo Nếu máy bạn đã cài PostgreSQL và Redis thủ công, hãy bỏ qua bước này.
    pause
)
echo.

echo [2/3] Đang khởi chạy Backend Spring Boot (Port 8080)...
start "Fashion Store - Backend" cmd /k "cd /d %~dp0backend && mvnw.cmd spring-boot:run"
echo.

echo [3/3] Đang cài đặt thư viện và khởi chạy Frontend React (Port 5173)...
start "Fashion Store - Frontend" cmd /k "cd /d %~dp0frontend && (if not exist node_modules (echo Dang cai dat thu vien npm... && npm install) else (echo Thu vien da co san.)) && npm run dev"
echo.

echo ========================================================
echo [HOÀN TẤT] Hệ thống đang được khởi chạy!
echo.
echo - Frontend:  http://localhost:5173
echo - Backend:   http://localhost:8080
echo.
echo Tài khoản đăng nhập sẵn có trong hệ thống:
echo  1. Quản trị viên (Admin): admin@fashionstore.com / AdminPassword123!
echo  2. Nhân viên (Staff):    staff@fashionstore.com / StaffPassword123!
echo  3. Khách hàng (Customer): customer@fashionstore.com / CustomerPassword123!
echo ========================================================
echo.
timeout /t 5 > nul
start http://localhost:5173
exit
