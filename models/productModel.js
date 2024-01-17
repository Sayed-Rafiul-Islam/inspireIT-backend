const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize,DataTypes) => {

    const Product = sequelize.define('product',{
        product_id : {
            type : DataTypes.STRING,
            allowNull : false,
            unique: true,
            primaryKey : true
        },
        product_name : {
            type : DataTypes.STRING,
            allowNull : false
        },
        configuration : {
            type : DataTypes.STRING,
            allowNull : false
        },
        source_name : {
            type : DataTypes.STRING,
            allowNull : false
        },
        unit_price : {
            type : DataTypes.STRING,
            allowNull : false
        },
        import_date : {
            type : DataTypes.STRING,
            allowNull : false
        },
    },        
        {timestamps : false},
    )

    return Product
}