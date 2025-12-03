const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { authenticate } = require('../middleware/auth')
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
router.get('/colleges', userController.getColleges)

module.exports = router
