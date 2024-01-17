const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize,DataTypes) => {

    const MonthlyRecord = sequelize.define('monthly_record',{
        monthly_record_id : {
            type : DataTypes.INTEGER,
            allowNull : false,
            unique: true,
            primaryKey : true,
            autoIncrement: true
        },
        bought : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        sold : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        employee : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        additionals : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        due : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        profit : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        record_date : {
            type : DataTypes.STRING,
            allowNull : false
        },
    },        
        {timestamps : false},
    )

    return MonthlyRecord
}