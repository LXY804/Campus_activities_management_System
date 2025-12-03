# 校园活动管理系统

一个基于 Vue 3 + Express + MySQL 的校园活动管理系统。

## 项目结构

```
Campus_activities_management_System/
├── backend/                 # 后端服务（Express + Sequelize）
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── middleware/         # 中间件
│   ├── routes/             # 路由
│   ├── utils/              # 工具函数
│   ├── database/           # 数据库脚本
│   └── app.js              # 入口文件
├── 校园活动管理系统/        # 前端项目（Vue 3 + Vite）
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── components/    # 组件
│   │   ├── views/         # 页面
│   │   └── router/        # 路由配置
│   └── vite.config.js
└── start-dev.bat          # 开发环境启动脚本（Windows）
```

## 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- MySQL >= 5.7 或 >= 8.0
- npm 或 yarn

## 快速开始

### 1. 安装依赖

#### 后端依赖
```bash
cd backend
npm install
```

#### 前端依赖
```bash
cd 校园活动管理系统
npm install
```

### 2. 配置数据库

#### 2.1 创建数据库

使用 MySQL 客户端执行数据库初始化脚本：

```bash
mysql -u root -p < backend/database/init.sql
```

或者手动创建数据库并导入 SQL 文件。

#### 2.2 配置环境变量

在 `backend` 目录下创建 `.env` 文件（如果不存在），参考 `backend/.env.example`：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=campus_activities
DB_USER=root
DB_PASSWORD=your_password

# JWT 配置
JWT_SECRET=campus_activity_jwt_secret_key_2024
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# CORS 配置
CORS_ORIGIN=http://localhost:5173
```

**重要**：请修改 `DB_PASSWORD` 为你的 MySQL 密码，并确保 `DB_NAME` 与数据库名称一致。

### 3. 测试数据库连接

```bash
cd backend
node test-db.js
```

如果看到 "✅ 数据库连接成功"，说明配置正确。

### 4. 启动项目

#### 方式一：使用启动脚本（Windows）

双击运行 `start-dev.bat`，会自动启动前端和后端服务。

#### 方式二：手动启动

**启动后端**：
```bash
cd backend
npm run dev
```

后端服务运行在：http://localhost:3000

**启动前端**：
```bash
cd 校园活动管理系统
npm run dev
```

前端服务运行在：http://localhost:5173

### 5. 访问系统

打开浏览器访问：http://localhost:5173

## 测试账户

系统初始化时会创建以下测试账户：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| organizer | organizer123 | 组织者 |
| student | student123 | 学生 |

## API 接口

后端 API 基础地址：http://localhost:3000/api

### 主要接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/events` - 获取活动列表
- `GET /api/events/:id` - 获取活动详情
- `POST /api/registrations/:id` - 报名活动
- `GET /api/registrations/my` - 获取我的报名
- `GET /api/comments/:eventId` - 获取活动评论
- `POST /api/comments/:eventId` - 提交评论

更多接口请查看 `backend/routes/` 目录下的路由文件。

## 常见问题

### 1. 数据库连接失败

- 检查 MySQL 服务是否启动
- 确认 `.env` 文件中的数据库配置是否正确
- 确认数据库 `campus_activities` 是否已创建

### 2. 端口被占用

- 后端默认端口：3000，可在 `.env` 中修改 `PORT`
- 前端默认端口：5173，可在 `vite.config.js` 中修改

### 3. CORS 错误

- 确认后端 `.env` 中的 `CORS_ORIGIN` 与前端地址一致
- 前端默认地址：http://localhost:5173

### 4. 依赖安装失败

- 尝试清除缓存：`npm cache clean --force`
- 删除 `node_modules` 和 `package-lock.json` 后重新安装
- 检查 Node.js 版本是否符合要求

## 开发说明

### 后端技术栈

- Express.js - Web 框架
- Sequelize - ORM 框架
- MySQL2 - MySQL 驱动
- JWT - 身份认证
- bcrypt - 密码加密（当前使用明文，建议后续改进）

### 前端技术栈

- Vue 3 - 前端框架
- Vite - 构建工具
- Vue Router - 路由管理
- Axios - HTTP 客户端
- Vant - UI 组件库

## 注意事项

1. **密码安全**：当前系统密码以明文存储，生产环境请使用 bcrypt 加密
2. **环境变量**：`.env` 文件包含敏感信息，不要提交到版本控制系统
3. **数据库备份**：定期备份数据库，避免数据丢失

## 许可证

MIT License