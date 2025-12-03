const router = require('express').Router()
const eventController = require('../controllers/eventController')
const organizerController = require('../controllers/organizerController')
const { authenticate, authorize } = require('../middleware/auth')

// 学生 / 公共接口
router.get('/', eventController.getEventList)
router.get('/:id', eventController.getEventDetail)
router.post('/:id/register', authenticate, eventController.registerEvent)

// 组织者：提交活动（待管理员审核）
router.post('/', authenticate, authorize('organizer', 'admin'), eventController.createEvent)

// 组织者：获取自己提交的活动及审核状态
router.get(
  '/organizer/mine',
  authenticate,
  authorize('organizer', 'admin'),
  organizerController.getMyEvents
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
