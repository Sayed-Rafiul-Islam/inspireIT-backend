const express = require('express');
const router = express.Router()

const { userAuthViaToken } = require("../middlewares/auth");
const { varify } = require('../controllers/varificationController');


router.get('/varify',userAuthViaToken, varify)

module.exports = router