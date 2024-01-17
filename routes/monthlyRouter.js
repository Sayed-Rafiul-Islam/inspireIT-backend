const { addMonthly, getMonthlyRecords, deleteMonthly } = require('../controllers/monthlyController')

const router = require('express').Router()

router.post('/addMonthly', addMonthly)
router.get('/monthlyRecords', getMonthlyRecords)
router.delete('/monthlyRecord', deleteMonthly)

module.exports = router