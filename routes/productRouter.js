const { 
    getProductIds, 
    getProductPageCount, 
    addProduct, 
    getOneProduct, 
    deleteProduct } = require('../controllers/productController')

const router = require('express').Router()

router.get('/productIds', getProductIds)
router.get('/productsPageCount', getProductPageCount)
router.get('/products', getOneProduct)
router.post('/addProduct', addProduct)
router.delete('/product', deleteProduct)

module.exports = router