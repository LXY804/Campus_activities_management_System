const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

router.post('/login', authController.login)
router.post('/register', authController.register)
router.get('/register', authController.registerByQuery)
router.get('/me', authenticate, authController.getCurrentUser)

module.exports = router
