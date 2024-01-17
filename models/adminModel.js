const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize,DataTypes) => {

    const Admin = sequelize.define('Admin',{
        adminId : {
            type : DataTypes.INTEGER,
            allowNull : false,
            unique: true,
            primaryKey : true,
            autoIncrement: true
        },
        admin_name : {
            type : DataTypes.STRING,
            allowNull : false
        },
        email : {
            type : DataTypes.STRING,
            allowNull : false
        },
        pass_word : {
            type : DataTypes.STRING,
            allowNull : false
        }
    },        
        {timestamps : false},
    )

    return Admin
}