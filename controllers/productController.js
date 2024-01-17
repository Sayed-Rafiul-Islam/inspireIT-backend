const db = require('../models')

// Create Main Model

const Products = db.products
const Inventory = db.inventories

// main work 


// get all inventory items

const getProductIds = async (req,res) => {  
    try {
        const {product_name,configuration,source_name,unit_price,page,import_date} = req.query
        const productIds = await Products.findAll({
            attributes : ['product_id','import_date'],
            where : {
                product_name : product_name,
                configuration : configuration,
                source_name : source_name,
                unit_price : unit_price,
                import_date : import_date
            }
        })
        res.status(200).send(productIds.reverse().slice(10*page,10*(page+1)))
    } catch (error) {
        res.status(500).send(error)
    }
}

// get the inventory items page count

const getProductPageCount = async (req,res) => {
    try {
        const {product_name,configuration,source_name,unit_price,import_date} = req.query
        const {count} = await Products.findAndCountAll({
            attributes : ['product_id','import_date'],
            where : {
                product_name : product_name,
                configuration : configuration,
                source_name : source_name,
                unit_price : unit_price,
                import_date : import_date
            }
        })
        const pageCount = Math.ceil(count / 10)
        res.status(200).json(pageCount)
    } catch (error) {
        res.status(500).send(error)
    }
}

// add product if there is no existing product with that product_id
// check if there are more products of the same genre, if so, update that genre's inventory quanitity
// else add new Item to incventory along with that product

const addProduct = async (req,res) => {
    try {
        const {product_id,product_name,configuration,source_name,unit_price,import_date} = req.body;
        const data = {
            product_id,
            product_name,
            configuration,
            source_name,
            unit_price,
            import_date 
        }

        const isProduct = await Products.findOne({
            attributes : ['product_name', 'configuration'],
            where : {
                product_id : product_id
            }
        })

        if (isProduct) {
            res.status(400).send(isProduct)
        } else {
            await Products.create(data)
            const item = await Inventory.findOne({
                where : {
                    product_name,
                    configuration,
                    source_name,
                    unit_price,
                    import_date
                }
            })

            if (item) {
                await item.increment('quantity', {by : 1})
                res.status(200).send({message : "product id added and inventory Updated"})
            } else {
                const newItem = {
                    product_name,
                    configuration,
                    source_name,
                    unit_price,
                    import_date,
                    quantity : 1
                }
                await Inventory.create(newItem)
                res.status(200).send(newItem)
            }
            
        }
        } catch (error) {
            res.status(500).send(error)
        }

    // const item = await Inventory.create(data)
    // res.status(200).send(item)
}
// get one Product from Products 

const getOneProduct = async (req,res) => {
    try {
        const id = req.query.id
        const product = await Products.findOne({
            where : {product_id : id}
        })
        if (product) {
            res.status(200).json(product)
        } else {
            res.status(404).json(product)
        }

    } catch (error) {
        res.status(500).send(error)
    }
    
}
// delete one product from Products 

const deleteProduct = async (req,res) => {
    try {
        const {id,product_name,configuration,source_name,unit_price,import_date} = req.query
        await Products.destroy({
        where : {product_id : id}
    })
    const item = await Inventory.findOne({
        where : {
            product_name,
            configuration,
            source_name,
            unit_price,
            import_date
        }
    })
    await item.decrement('quantity', {by : 1})
    res.status(200).json({message : "product deleted and inventory updated"})
    } catch (error) {
        res.status(500).send(error)
    }
}




// export

module.exports = {
    getProductIds,
    getProductPageCount,
    addProduct,
    getOneProduct,
    deleteProduct
}