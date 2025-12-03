const router = require('express').Router()
const organizerController = require('../controllers/organizerController')
const { authenticate, authorize } = require('../middleware/auth')

// 仅组织者和管理员可访问
router.get(
  '/activities',
  authenticate,
  authorize('organizer', 'admin'),
  organizerController.getMyActivities
)

router.get(
  '/activities/:id/applications',
  authenticate,
  authorize('organizer', 'admin'),
  organizerController.getActivityApplications
)

router.patch(
  '/applications/:id',
  authenticate,
  authorize('organizer', 'admin'),
  organizerController.updateApplicationStatus
)

module.exports = router



