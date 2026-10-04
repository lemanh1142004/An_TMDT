@echo off
title Fashion Store - Khoi Chay He Thong
echo ========================================================
echo        HE THONG THUONG MAI DIEN TU FASHION STORE
echo ========================================================
echo.

echo [*] Dang kiem tra Docker Desktop...
docker info > nul 2>&1
if errorlevel 1 goto DOCKER_ERROR

echo [*] Docker da san sang! Dang tien hanh khoi chay tat ca dich vu...
echo     - PostgreSQL 16: Port 5432
echo     - Redis 7: Port 6379
echo     - Spring Boot Backend: Port 8080
echo     - React Frontend: Port 5173
echo.

docker compose up -d --build
if errorlevel 1 goto BUILD_ERROR

echo.
echo ========================================================
echo [HOAN TAT] Tat ca dich vu da khoi chay thanh cong!
echo.
echo Website Cua hang: http://localhost:5173
echo Backend API:      http://localhost:8080
echo.
echo Tai khoan mau co san:
echo  1. Admin:    admin@fashionstore.com / AdminPassword123!
echo  2. Staff:    staff@fashionstore.com / StaffPassword123!
echo  3. Customer: customer@fashionstore.com / CustomerPassword123!
echo ========================================================
echo.
echo Dang mo trinh duyet...
timeout /t 3 > nul
start http://localhost:5173
exit /b 0

:DOCKER_ERROR
echo.
echo ========================================================
echo [LOI] DOCKER CHUA DUOC BAT!
echo ========================================================
echo Vui long mo ung dung "Docker Desktop" tren may tinh cua ban,
echo doi den khi bieu tuong con ca voi bao mau xanh (Engine running)
echo roi moi nhap dup chay lai file nay!
echo.
pause
exit /b 1

:BUILD_ERROR
echo.
echo [LOI] Khong the khoi chay cac container Docker!
echo Vui long kiem tra lai Docker Desktop tren may cua ban.
echo.
pause
exit /b 1
