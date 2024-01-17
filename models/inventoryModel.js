// const { db } = require("../db/db-config")

// module.exports = {
//     query10Items : (req) => {
//         const page = req.query.page
//         const query = `SELECT *
//         FROM inventory ORDER BY import_date DESC LIMIT ?, 10`;
//         const result = db
//         .promise().
//         query(query,[page*10])  
//         .then(([result]) => result )
//         .catch((err) => console.log(err))
//         return result
//     }   
// } 

const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize,DataTypes) => {

    const Inventory = sequelize.define('inventory', {
        product_name : {
            type : DataTypes.STRING,
            allowNull : false,
            
        },
        configuration : {
            type : DataTypes.STRING,
            allowNull : false,
            
        },
        source_name : {
            type : DataTypes.STRING,
            allowNull : false,
            
        },
        unit_price : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        quantity : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        import_date : {
            type : DataTypes.STRING,
            allowNull : false
        }
    },
    {timestamps : false},
    )

    return Inventory
}