const db = require('../models')
const { createJwt } = require('../utils/varifyJWT')
const { encode } = require('../utils/cypher')
const bcrypt = require('bcrypt');

// Create Main Model

const Admins = db.admins

// main work 

// login

const login = async (req,res) => {
    try {
        const {email,password} = req.body
        const currentDate = new Date()
        const data = {email : email, date : currentDate}


        const isAdmin = await Admins.findOne({
                where : { email : email}
            })
        if (!isAdmin) {
            res.status(404).send({message : "No account with this email"})
        } else {
            bcrypt.compare(password,isAdmin.pass_word,async (err,result)=>{
                if (result) {
                    const token = await createJwt(data)
                    res.status(200).send({accessToken : token})
                } else {
                    res.status(400).send({message : "Password did not match"})
                }

            })
            
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

// Create new Admin


const createAdmin = async (req,res) => {
    try {
        const {name,email,password} = req.body;
        const currentDate = new Date()
        const data = {email : email, date : currentDate}
        const token = await createJwt(data)
        const pass_word = await encode(password)

        const isAdmin = await Admins.findOne({
            where : { email : email}
        })

        if (isAdmin) {
            res.status(400).send({message : "Account already exists with this email"})
        } else {
            await Admins.create({
                admin_name : name,
                email,
                pass_word
            })
            res.status(200).send({accessToken : token})
        }

        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
}

// export

module.exports = {
    createAdmin,
    login
}