const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()

// 中间件
// 开发环境下放宽 CORS，允许本机任意端口的前端访问（如 5173 / 5174 / 5175）
app.use(
  cors({
    origin: (origin, callback) => {
      // 无 origin（如 Postman）直接放行
      if (!origin) return callback(null, true)
      // 只要是本机 localhost 源都允许
      if (origin.startsWith('http://localhost')) {
        return callback(null, true)
      }
      // 其他来源拒绝
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态资源：头像等上传文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 路由
app.use('/api/auth', require('./routes/auth'))
app.use('/api/events', require('./routes/events'))
app.use('/api/organizer', require('./routes/organizer'))
app.use('/api/registrations', require('./routes/registrations'))
app.use('/api/comments', require('./routes/comments'))
app.use('/api/users', require('./routes/users'))

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: '服务运行正常' })
})

// 错误处理
const errorHandler = require('./middleware/errorHandler')
app.use(errorHandler)

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' })
})

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(` 服务器运行在 http://localhost:${PORT}`)
  console.log(` API 文档: http://localhost:${PORT}/api/health`)
})