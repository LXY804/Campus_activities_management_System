const router = require('express').Router()
const eventController = require('../controllers/eventController')
const organizerController = require('../controllers/organizerController')
const { authenticate, authorize } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 确保上传目录存在
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置 multer 保存路径和文件名（用于活动封面图片）
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    const timestamp = Date.now()
    cb(null, `cover_${timestamp}_${Math.random().toString(36).substring(7)}${ext}`)
  }
})

const uploadCover = multer({ 
  storage: coverStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制文件大小为 5MB
  },
  fileFilter: (req, file, cb) => {
    // 只接受图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只允许上传图片文件'), false)
    }
  }
})

// 学生 / 公共接口
router.get('/types', eventController.getActivityTypes) // 获取活动类型列表
router.get('/', eventController.getEventList)
router.get('/:id', eventController.getEventDetail)
router.post('/:id/register', authenticate, eventController.registerEvent)

// 组织者：提交活动（待管理员审核）
router.post('/', authenticate, authorize('organizer', 'admin'), uploadCover.single('coverImage'), eventController.createEvent)

// 组织者：获取自己提交的活动及审核状态
router.get(
  '/organizer/mine',
  authenticate,
  authorize('organizer', 'admin'),
  organizerController.getMyActivities
)

// 管理员审核队列
router.get(
  '/admin/pending',
  authenticate,
  authorize('admin'),
  eventController.getPendingEventsForAdmin
)
router.post(
  '/admin/:id/approve',
  authenticate,
  authorize('admin'),
  eventController.approveEvent
)
router.post(
  '/admin/:id/reject',
  authenticate,
  authorize('admin'),
  eventController.rejectEvent
)

module.exports = router
