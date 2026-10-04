@echo off
title Fashion Store - Chay Nhanh Truc Tiep (Dev Mode)
echo ========================================================
echo        FASHION STORE - CHE DO DEV TRUC TIEP
echo ========================================================
echo.

echo [*] 1. Dang bat Database PostgreSQL va Redis qua Docker...
docker compose up -d postgres redis

echo [*] 2. Dang khoi dong Backend Spring Boot...
start "Fashion Store - Backend" cmd /k "cd /d %~dp0backend && mvnw.cmd spring-boot:run"

echo [*] 3. Dang khoi dong Frontend React Vite...
start "Fashion Store - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo [HOAN TAT] He thong dang duoc bat truc tiep!
echo Web: http://localhost:5173
echo ========================================================
echo.
timeout /t 5 > nul
start http://localhost:5173
