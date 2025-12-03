const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/auth', require('./routes/auth'))
app.use('/api/events', require('./routes/events'))
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