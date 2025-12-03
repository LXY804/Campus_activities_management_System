const express = require('express')
const router = express.Router()
const commentController = require('../controllers/commentController')
const { authenticate } = require('../middleware/auth')

router.post('/events/:eventId', authenticate, commentController.submitComment)
router.get('/events/:eventId', commentController.getEventComments)
router.get('/my', authenticate, commentController.getMyComments)

module.exports = router

