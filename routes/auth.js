const express = require("express");
const router = express.Router()
const loginLimiter = require('../middlewares/loginLimiter')
const authController= require('../contollers/auth')

router.route('/').post(loginLimiter, authController.login)
router.route('/refresh').get(authController.refresh)
router.route('/logout').post(authController.logout)

module.exports = router