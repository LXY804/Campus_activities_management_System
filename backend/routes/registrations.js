const express = require('express')
const router = express.Router()
const registrationController = require('../controllers/registrationController')
const { authenticate } = require('../middleware/auth')

router.get('/my', authenticate, registrationController.getMyRegistrations)
router.delete('/:id', authenticate, registrationController.cancelRegistration)

module.exports = router
