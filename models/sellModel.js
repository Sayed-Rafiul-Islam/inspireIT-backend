const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize,DataTypes) => {

    const SellRecord = sequelize.define('sell_record',{
        selling_id : {
            type : DataTypes.INTEGER,
            allowNull : false,
            unique: true,
            primaryKey : true,
            autoIncrement: true
        },
        customer_name : {
            type : DataTypes.STRING,
            allowNull : false
        },
        contact_no : {
            type : DataTypes.STRING,
            allowNull : false
        },
        address : {
            type : DataTypes.STRING,
            allowNull : false
        },
        product_id : {
            type : DataTypes.STRING,
            allowNull : false,
            unique: true
        },
        product_name : {
            type : DataTypes.STRING,
            allowNull : false
        },
        configuration : {
            type : DataTypes.STRING,
            allowNull : false
        },
        buying_price : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        selling_price : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        due : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        selling_date : {
            type : DataTypes.DATE,
            allowNull : false
        },
    },        
        {timestamps : false},
    )

    return SellRecord
}