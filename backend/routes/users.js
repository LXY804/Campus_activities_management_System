const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { authenticate, authorize } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 确保上传目录存在
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置 multer 保存路径和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png'
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`)
  }
})

const upload = multer({ storage })

router.get('/profile', authenticate, userController.getProfile)
router.put('/profile', authenticate, userController.updateProfile)
router.post('/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar)

// 用户：获取个人统计数据
router.get(
  '/stats/personal',
  authenticate,
  userController.getPersonalStats
)

// 管理员：获取用户列表
router.get(
  '/list',
  authenticate,
  authorize('admin'),
  userController.getUserList
)

// 管理员：获取用户统计
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  userController.getUserStats
)

// 管理员：获取本月新增用户数
router.get(
  '/stats/new-users',
  authenticate,
  authorize('admin'),
  userController.getNewUsersThisMonth
)

// 管理员：获取系统配置
router.get(
  '/config',
  authenticate,
  authorize('admin'),
  userController.getSystemConfig
)

// 管理员：保存系统配置
router.put(
  '/config',
  authenticate,
  authorize('admin'),
  userController.saveSystemConfig
)

// 管理员：获取活动统计
router.get(
  '/stats/activities',
  authenticate,
  authorize('admin'),
  userController.getActivityStats
)

module.exports = router
