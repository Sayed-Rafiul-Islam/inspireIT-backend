const { createAdmin, login } = require('../controllers/adminController')
const router = require('express').Router()

router.post('/createAdmin', createAdmin)
router.post('/login', login)

module.exports = router