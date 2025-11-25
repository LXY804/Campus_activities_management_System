const router = require('express').Router()
const eventController = require('../controllers/eventController')
const { authenticate } = require('../middleware/auth')

router.get('/', eventController.getEventList)
router.get('/:id', eventController.getEventDetail)
router.post('/:id/register', authenticate, eventController.registerEvent)

module.exports = router
