const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const salt = 10;


const app = express();
const port = process.env.PORT || 5000;


const db = mysql.createPool({
    host : process.env.MYSQL_HOST, 
    port : process.env.MYSQL_PORT, 
    user: process.env.MYSQL_USER, 
    password : process.env.MYSQL_PASSWORD, 
    database : process.env.MYSQL_DATABASE
})


// middleware
app.use(cors());
app.use(express.json());

// JWT verification section 

function verifyJWT(req, res, next) {
    
    const accessToken = req.query.accessToken;
    if (!accessToken) {
        return res.status(401);
    }
    jwt.verify(accessToken, process.env.ACCESS_TOKEN
        , (err, decoded) => {
            if (err) {
                return res.status(403);
            }
            req.decoded = decoded;
            next();
        })
}

// -------------------------------------------

app.post('/createAdmin', async (req, res) => {
    const {name,email,password} = req.body;
    const currentDate = new Date()
    const data = {email : email, date : currentDate}
    const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN,{
        expiresIn : '1d'
    })
    const query = `SELECT * FROM admins WHERE email = "${email}"`

    db.query(query,(err,result)=>{
        if (err) {
            console.log(err)
        } else if (result.length > 0) {
            res.status(400).send({})   
        } else {
            
            bcrypt.hash(password, salt, (err,hash)=> {
                if(err){
                    console.log(err)
                } else {
                    const query1 = `INSERT INTO admins (
                        admin_name,
                        email,
                        pass_word
                    )
                    VALUES ('${name}','${email}','${hash}')`;
                    db.query(query1,(err,result)=>{
                        if (err) {
                            res.send(err)
                        } else {
                            res.status(200).send({name,email,accessToken})
                        }     
                    }) 
                }        
                    
            }) 
        } 
    })   
})

app.get('/login', (req, res) => {
    const email = req.query.email ;
    const currentDate = new Date()
    const password = req.query.password;
    const data = {email : email, date : currentDate}

    const query = `SELECT * FROM users 
    WHERE email = '${email}'`;
    db.query(query,(err,result)=>{
        if (result.length > 0) {
            const hash = result[0].pass_word
            const userName = result[0].userName
            const accessLevel = result[0].accessLevel
            bcrypt.compare(password, hash, (err, result) => {              
                if(!result){
                    res.status(401).send({})
                } else {
                    const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN,{
                        expiresIn : '1d'
                    })
                    res.status(200).send({userName,email,accessLevel,accessToken})  
                }
            }); 
        } 
        else  { 
            res.status(403).send({})
        }   
    })     
})








// app.get('/cart', verifyJWT, (req, res) => {
//     const decoded = req.decoded.email
//     const query = `SELECT o.productId, productName, image, o.quantity, price, o.quantity * price AS totalPrice  
//     FROM orders o 
//     JOIN products p 
//         ON o.productId = p.productId
//         WHERE email = '${decoded}'`;

//     db.query(query,(err,result)=>{
//         if (result.length > 0) {
//             res.status(200).send(result)
//         } else {
//             res.status(500).send("Internal server error")            
//         }
      
//     })    
// })


// app.post('/order', verifyJWT, (req, res) => {
//     const {orders,date,orderId,cost} = req.body;
//     const decoded = req.decoded.email
//     const query = `INSERT INTO orders (
//                      orderId,
//                      email,
//                      order_date,
//                      total_price,
//                      orders
//                  ) 
//                  VALUES (${orderId},'${decoded}','${date}',${cost},'${orders}')`;
//         db.query(query,(err,result)=>{
//                         if (err) {
//                             res.status(500).send("Internal server error")
//                         } else {
//                             res.status(200).send("Successfully added")    
//                         }     
//                     }) 


//     // const query = `SELECT orderId FROM orders WHERE email = '${decoded}' AND productId = ${productId}`;


//     // db.query(query,(err,result)=>{
//     //     if (result.length === 1) {
//     //         const updateQuery = `UPDATE orders SET quantity = quantity + 1 AND order_date = '${order_date}' WHERE orderId = '${result[0].orderId}'`
//     //         db.query(updateQuery,(err,result)=>{
//     //             if (err) {
//     //                 res.status(404).send("Not Found");
//     //             } else {
//     //                 res.status(200).send("Successfully Updated")
//     //             }
//     //         })
            
//     //     } else {
//     //         const insertQuery = `INSERT INTO orders (
//     //             orderId,
//     //             productId,
//     //             email,
//     //             quantity,
//     //             order_date
//     //         ) 
//     //         VALUES (${orderId},${productId},'${decoded}',${quantity},'${order_date}')`;
            
//     //         db.query(insertQuery,(err,result)=>{
//     //             if (err) {
//     //                 res.status(500).send("Internal server error")
//     //             } else {
//     //                 res.status(200).send("Successfully added")    
//     //             }     
//     //         }) 
            
//     //     }
      
//     // })    
// })

// app.get('/products', (req, res) => {
//     const page = req.query.page
//     const query = `SELECT * FROM products LIMIT ?, 10`;
//     db.query(query,[page*10],(err,result)=>{
//         if (err) {
//             console.log(err)
//         } 
//         else  { 
//             res.json(result)
//         }   
//     })     
// })
// app.get('/pageCount', (req, res) => {

//     const query = `SELECT * FROM products`;
//     db.query(query,(err,result)=>{
//         if (err) {
//             console.log(err)
//         } 
//         else  { 
//             const pageCount = result.length / 10
//             res.json(pageCount)
//         }   
//     })     
// })


// app.get('/users', (req, res) => {
//     const email = req.query.email ;
//     const currentDate = new Date()
//     const password = req.query.password;

//     const data = {email : email, date : currentDate}

//     const query = `SELECT * FROM users 
//     WHERE email = '${email}'`;
//     db.query(query,(err,result)=>{
//         if (result.length > 0) {
//             const hash = result[0].pass_word
//             bcrypt.compare(password, hash, (err, result) => {              
//                 if(!result){
//                     res.json({message: "Incorrect Password", result : result, accessToken : null},)
//                 } else {
//                     const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN,{
//                         expiresIn : '1d'
//                     })
//                     res.json({message: "Successfully logged in", result : result, accessToken : accessToken})  
//                 }
//             }); 
//         } 
//         else  { 
//             res.json({message: "No account with this email", result : false, accessToken : null})
//         }   
//     })     
// })


// app.post('/addUser', async (req, res) => {
//     const query = `INSERT INTO users (
//         user_name,
//         email,
//         pass_word
//     ) 
//     VALUES (?,?,?)`;
//     const {userName,email,password} = req.body;
//     const currentDate = new Date()
//     const data = {email : email, date : currentDate}

//     const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN,{
//         expiresIn : '1d'
//     })
//     bcrypt.hash(password, salt, (err,hash)=> {
//         if(err){
//             console.log(err)
//         }
//         const data = [
//             userName,
//             email,
//             hash
//         ]
        
//         db.query(query,data,(err,result)=>{
//             if (err) {
//                 res.json({message : "User already exists with this email",accessToken : null})
//             } else {
//                 res.json({message : "User created successfully",accessToken : accessToken})    
//             }     
//         })     
//     })   
// })

// app.delete('/product',verifyJWT, (req, res) => {
//     const productId = req.query.productId 
//     const decoded = req.decoded.email 

//     const query = `DELETE FROM orders WHERE email = '${decoded}' AND productId = '${productId}'`;
//     db.query(query,(err,result)=>{
//         if (err) {
//             res.status(500).send("Internal server error")     
//         } 
//         else  { 
//             res.status(200).send("Item Removed")
//         }   
//     })     
// })




app.get('/', (req, res) => {
    res.send('running ')
})
app.listen(port, () => {
    console.log('crud is running')
})




