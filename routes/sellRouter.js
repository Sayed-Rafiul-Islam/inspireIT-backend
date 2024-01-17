const { getSellPageCount, 
    getSellRecords, 
    getSellPageCountByDate, 
    getSellByDate, 
    getSellRecord, 
    addSell, 
    deleteSell } = require('../controllers/sellController')

const router = require('express').Router()

router.get('/sellPageCount',getSellPageCount )
router.get('/sellRecords',getSellRecords )
router.get('/sellRecordsByDatePageCount',getSellPageCountByDate )
router.get('/sellRecordsByDate',getSellByDate )
router.get('/sellRecord',getSellRecord )
router.post('/addSell',addSell )
router.delete('/sellRecords',deleteSell )


module.exports = router