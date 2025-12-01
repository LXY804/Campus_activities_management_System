#!/bin/bash

echo "启动校园活动管理系统开发环境"
echo "=================================="

# 检查端口是否被占用
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "警告: 端口 $1 已被占用"
        return 1
    else
        return 0
    fi
}

echo "检查端口状态..."
check_port 3000 || echo "   后端端口 3000 被占用"
check_port 5173 || echo "   前端端口 5173 被占用"

echo ""
echo "启动后端服务器..."
echo "   地址: http://localhost:3000"
echo "   API健康检查: http://localhost:3000/api/health"

# 启动后端（在后台运行）
cd backend && npm run dev &
BACKEND_PID=$!

echo ""
echo "启动前端服务器..."
echo "   地址: http://localhost:5173"

# 启动前端（在后台运行）
cd "./校园活动管理系统" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "前后端已启动完成！"
echo "=================================="
echo "后端服务: http://localhost:3000"
echo "前端应用: http://localhost:5173" 
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户按 Ctrl+C
trap "echo ''; echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '所有服务已停止'; exit" INT

# 保持脚本运行
wait