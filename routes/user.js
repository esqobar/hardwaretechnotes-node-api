const express = require("express");
const  usersControllers = require('../contollers/user')
const router = express.Router()
const verifyJWT = require('../middlewares/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(usersControllers.getAllUsers)
    .post(usersControllers.createUser)
    .patch(usersControllers.updateUser)
    .delete(usersControllers.deleteUsers)

module.exports = router