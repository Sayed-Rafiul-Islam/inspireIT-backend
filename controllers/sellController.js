const { Op } = require('sequelize')
const db = require('../models')

// Create Main Model

const Products = db.products
const Inventory = db.inventories
const Sells = db.sell_records

// main work 


// get all sell records and search filter

const getSellRecords = async (req,res) => {  
    try {
        const {page,search} = req.query
        if (search === '') {
            const sell_records = await Sells.findAll()
            res.status(200).send(sell_records.reverse().slice(10*page,10*(page+1)))
        } else {
            const sell_records = await Sells.findAll({
                where : {
                    [Op.or] : [
                        {product_id : {[Op.like] : `%${search}%`}},
                        {customer_name : {[Op.like] : `%${search}%`}},
                        {contact_no : {[Op.like] : `%${search}%`}}
                    ]
                }
            })
            res.status(200).send(sell_records.reverse().slice(10*page,10*(page+1)))
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

// get all sell records and search filter

const getSellRecord = async (req,res) => {  
    try {
        const {id} = req.query
        const sell_record = await Sells.findOne({
            where : {
                product_id : id
            }
        })
        res.status(200).send(sell_record)
    
    } catch (error) {
        res.status(500).send(error)
    }
}

// get the sell records page count

const getSellPageCount = async (req,res) => {
    try {
        const {count} = await Sells.findAndCountAll()
        const pageCount = Math.ceil(count / 10)
        res.status(200).json(pageCount)
    } catch (error) {
        res.status(500).send(error)
    }
}

// get the sell records by date page count
// between and less than equal operator is not displaying the record for which the parameters are equal for some reason
// It's acting like just less than so incremented the end date by one day

const getSellPageCountByDate = async (req,res) => {
    try {
        const {from,to} = req.query
        if (from === '' || to === '') {
            const {count} = await Sells.findAndCountAll()
            const pageCount = Math.ceil(count / 10)
            res.status(200).json(pageCount)
        } else {
            const year = to.split("-")[0]
            const month = to.split("-")[1]
            const day = to.split("-")[2]
            const dayPlusOne = (parseInt(day) + 1).toString()
            const newTo = year + '-' + month + '-' + dayPlusOne
            const {count} = await Sells.findAndCountAll({
                where : {
                    selling_date : { [Op.and] : [{ [Op.gt] : from }, { [Op.lte] : newTo }] }
                }
            })
            const pageCount = Math.ceil(count / 10)
            res.status(200).json(pageCount)
        }

        
    } catch (error) {
        res.status(500).send(error)
    }
}
// get the sell records by date page count

const getSellByDate = async (req,res) => {
    try {
        const {from,to,page} = req.query

        if (from === '' || to === '') {
            const sells = await Sells.findAll()
            res.status(200).json(sells.reverse().slice(10*page,10*(page+1)))
        } else {
            const year = to.split("-")[0]
            const month = to.split("-")[1]
            const day = to.split("-")[2]
            const dayPlusOne = (parseInt(day) + 1).toString()
            const newTo = year + '-' + month + '-' + dayPlusOne
            const sells = await Sells.findAll({
                where : {
                    selling_date : { [Op.and] : [{ [Op.gt] : from }, { [Op.lte] : newTo }] }
                }
            })
            res.status(200).json(sells.reverse().slice(10*page,10*(page+1)))
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

// add to sell records
// remove product from inventory that just got sold
// update that product's genre by quantity


const addSell = async (req,res) => {
    try {
        const {product_id,
            product_name,
            configuration,
            unit_price,
            customer_name,
            contact_no,
            address,
            selling_price,
            due,
            source_name,
            import_date} = req.body;
        const date = new Date().toISOString().split("T")[0]
        const newSellRecord = {
            product_id,
            product_name,
            configuration,
            customer_name,
            contact_no,
            address,
            buying_price : unit_price,  
            selling_price,  
            due,
            selling_date : date
        }

        await Sells.create(newSellRecord)
        await Products.destroy({
            where : {product_id : product_id}
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
        res.status(200).send({message : `sold id ${product_id} and deleted from products and inventory quantity updated`})

        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
}

// delete one product from Products 

const deleteSell = async (req,res) => {
    try {
        const {id} = req.query
        await Sells.destroy({
        where : {product_id : id}
    })
    res.status(200).json({message : "sell record deleted"})
    } catch (error) {
        res.status(500).send(error)
    }
}




// export

module.exports = {
    getSellPageCount,
    getSellRecords,
    getSellPageCountByDate,
    getSellByDate,
    getSellRecord,
    addSell,
    deleteSell


}