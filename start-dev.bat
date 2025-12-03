@echo off
title Campus Activity Dev

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%校园活动管理系统"

echo.
echo ===== 启动后端 =====
start "backend" cmd /k "cd /d %BACKEND_DIR% && npm run dev"

echo.
echo ===== 启动前端 =====
start "frontend" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

echo.
echo 已在两个窗口中启动前端和后端，请不要关闭这些窗口。
pause


