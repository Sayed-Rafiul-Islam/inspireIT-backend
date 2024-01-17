const { getInventory,
        getInventoryPageCount,
        getOneItem,
        deleteItem,
    } = require('../controllers/inventoryController')

const router = require('express').Router()

router.get('/inventory', getInventory)
router.get('/inventoryPageCount', getInventoryPageCount)
router.get('/inventoryItem', getOneItem)
router.delete('/inventory', deleteItem)

module.exports = router