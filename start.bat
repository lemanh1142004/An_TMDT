@echo off
chcp 65001 > nul
title Fashion Store - Khởi Chạy Toàn Diện Bằng Docker
echo ========================================================
echo        HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ FASHION STORE
echo        (Khởi chạy toàn bộ hệ thống bằng Docker Compose)
echo ========================================================
echo.

echo [*] Đang kiểm tra kết nối Docker...
docker info > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LỖI] Docker chưa được khởi động!
    echo Vui lòng mở ứng dụng "Docker Desktop" trên máy tính của bạn,
    echo đợi Docker khởi động xong (biểu tượng cá voi màu xanh lá) rồi chạy lại file này.
    echo.
    pause
    exit /b 1
)

echo [*] Docker đã sẵn sàng! Đang tiến hành build và khởi chạy tất cả dịch vụ...
echo     - PostgreSQL 16 (Port 5432)
echo     - Redis 7 (Port 6379)
echo     - Spring Boot Backend (Port 8080)
echo     - React Frontend + Nginx (Port 5173)
echo.

docker compose up -d --build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LỖI] Khởi chạy thất bại. Vui lòng kiểm tra lại log bên trên.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo [HOÀN TẤT] Tất cả dịch vụ đã khởi chạy thành công!
echo.
echo 👉 Website Cửa hàng: http://localhost:5173
echo 👉 Backend API:      http://localhost:8080
echo.
echo 👤 Tài khoản mẫu có sẵn trong hệ thống:
echo  1. Quản trị viên (Admin): admin@fashionstore.com / AdminPassword123!
echo  2. Nhân viên (Staff):    staff@fashionstore.com / StaffPassword123!
echo  3. Khách hàng (Customer): customer@fashionstore.com / CustomerPassword123!
echo ========================================================
echo.
echo Đang mở trình duyệt trong 3 giây...
timeout /t 3 > nul
start http://localhost:5173
echo.
echo (Nhấn phím bất kỳ để xem nhật ký log thời gian thực của hệ thống, hoặc đóng cửa sổ này)
pause > nul
docker compose logs -f
