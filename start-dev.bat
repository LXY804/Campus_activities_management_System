@echo off
title Campus Activity Dev

echo.
echo ===== 启动后端 =====
start "backend" cmd /k "cd /d E:\cursor\Campus_activities_management_System\backend && npm run dev"

echo.
echo ===== 启动前端 =====
start "frontend" cmd /k "cd /d E:\cursor\Campus_activities_management_System\校园活动管理系统 && npm run dev"

echo.
echo 已在两个窗口中启动前端和后端，请不要关闭这些窗口。
pause


