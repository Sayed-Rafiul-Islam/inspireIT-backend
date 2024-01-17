const {Sequelize, DataTypes} = require("sequelize")

const sequelize = new Sequelize({
        host : process.env.MYSQL_HOST,
        username : process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        dialect: "mysql",
        logging: false,
        port: process.env.MYSQL_PORT,
    })


sequelize.authenticate()
.then(() => {
    console.log("connected")
})
.catch( (err) => {
    console.log("Error : " + err)
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.products = require("./productModel.js")(sequelize,DataTypes)
db.inventories = require("./inventoryModel.js")(sequelize,DataTypes)
db.sell_records = require("./sellModel.js")(sequelize,DataTypes)
db.monthly_records = require("./monthlyModel.js")(sequelize,DataTypes)
db.admins = require("./adminModel.js")(sequelize,DataTypes)

db.sequelize.sync({ force : false})
.then(() => {
    console.log('yes re-sync done')
})


module.exports = db