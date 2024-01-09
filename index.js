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
        return res.status(401).send();
    }
    jwt.verify(accessToken, process.env.ACCESS_TOKEN
        , (err, decoded) => {
            if (err) {
                return res.status(403).send();
            }
            req.decoded = decoded;
            next();
        })
}

// -------------------------------------------
app.get('/varify',verifyJWT, (req, res) => {
    const email = req.decoded.email
    res.status(200).send({email : email})   
})

app.post('/createAdmin', async (req, res) => {
    const {name,email,password} = req.body;
    const currentDate = new Date()
    const data = {email : email, date : currentDate}
    const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN,{
        expiresIn : '1h'
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

    const query = `SELECT * FROM admins 
    WHERE email = '${email}'`;
    db.query(query,(err,result)=>{
        if (result.length > 0) {
            const hash = result[0].pass_word
            const name = result[0].admin_name
            bcrypt.compare(password, hash, (err, result) => {              
                if(!result){
                    res.status(401).send({})
                } else {
                    const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN,{
                        expiresIn : '1h'
                    })
                    res.status(200).send({name,email,accessToken})  
                }
            }); 
        } 
        else  { 
            res.status(403).send({})
        }   
    })     
})

app.get('/inventory', (req, res) => {
    
    const page = req.query.page
    const query = `SELECT *
    FROM inventory ORDER BY import_date DESC LIMIT ?, 10`;
    db.query(query,[page*10],(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  {
            res.status(200).send(result)
        }   
    })     
})
app.get('/productIds', (req, res) => {
    const {product_name,configuration,source_name,unit_price,page,import_date} = req.query
    const query = `SELECT product_id FROM products 
    WHERE
    product_name = '${product_name}' AND
    configuration = '${configuration}' AND
    source_name = '${source_name}' AND 
    unit_price = ${unit_price} AND
    import_date = '${import_date}' LIMIT ${page*10}, 10`;
    db.query(query,(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  { 
            res.status(200).json(result)
        }   
    })     
})
app.get('/inventoryPageCount', (req, res) => {

    const query = `SELECT * FROM inventory`;
    db.query(query,(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  { 
            const pageCount = result.length / 10
            res.status(200).json(pageCount)
        }   
    })     
})

app.get('/inventoryItem', (req, res) => {

    const id = req.query.id
    const query = `SELECT * FROM inventory WHERE id = ${id}`;
    db.query(query,(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  { 
            res.status(200).json(result[0])
        }   
    })     
})
app.get('/productsPageCount', (req, res) => {

    const {product_name,configuration,source_name,unit_price} = req.query
    const query = `SELECT * FROM products 
    WHERE
    product_name = '${product_name}' AND
    configuration = '${configuration}' AND
    source_name = '${source_name}' AND 
    unit_price = ${unit_price}`;

    db.query(query,(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  { 
            res.status(200).json(Math.ceil(result.length/10))
        }   
    })    
})

app.post('/addProduct', async (req, res) => {
    const {product_id,product_name,configuration,source_name,unit_price,import_date} = req.body;
            const insertQuery = `INSERT INTO products (
            product_id,
            product_name,
            configuration,
            source_name,
            unit_price,
            import_date
        ) 
        VALUES ('${product_id}','${product_name}','${configuration}','${source_name}',${unit_price},'${import_date}')`
        db.query(insertQuery,(err,result)=>{
                if (err) {
                    console.log(err)
                    res.status(400).send({message : "duplicate product id"})
                } else {
                    const searchQuery = `SELECT * FROM inventory
                        WHERE 
                            product_name = '${product_name}' AND 
                            configuration = '${configuration}' AND
                            source_name = '${source_name}' AND
                            unit_price = ${unit_price} AND 
                            import_date = '${import_date}'`
                    db.query(searchQuery,(err,result)=>{
                        if (err) {
                            console.log(err)
                        } 
                        else if (result.length > 0) {
                            const updateQuery = `UPDATE inventory SET quantity = quantity + 1
                            WHERE 
                            product_name = '${product_name}' AND 
                            configuration = '${configuration}' AND
                            source_name = '${source_name}' AND
                            unit_price = ${unit_price} AND 
                            import_date = '${import_date}'`
                    db.query(updateQuery,(err,result)=>{
                        res.status(201).send("Inventory Updated and product inserted")
                            })
                        }
                        else {
                            const query = `INSERT INTO inventory (
                                product_name,
                                configuration,
                                source_name,
                                unit_price,
                                quantity,
                                import_date
                            ) 
                            VALUES ('${product_name}','${configuration}','${source_name}',${unit_price}, 1,'${import_date}')`
                            db.query(query,(err,result)=>{
                                if (err) {
                                    console.log(err)
                                } else {
                                    res.status(200).send({message : "Product added to inventory and products"})    
                                }     
                            })
                        }

                        
                    })  
                }     
            })
      
})
app.get('/products', (req, res) => {
    const {id} = req.query
    const query = `SELECT * FROM products 
    WHERE
    product_id = '${id}'`;
    db.query(query,(err,result)=>{
        if (err) {
            console.log(err)
        } else if (result.length === 0) {
            res.status(404).send(result)
        }
        else { 
            res.status(200).json(result[0])
        }   
    })     
})

app.get('/sellPageCount', (req, res) => {

    const query = `SELECT * FROM sell_records`;
    db.query(query,(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  { 
            const pageCount = result.length / 10
            res.json(pageCount)
        }   
    })     
})
app.get('/sellRecords', (req, res) => {
    const {page,search} = req.query

    if (search === '') {
        const query = `SELECT * FROM sell_records ORDER BY selling_date DESC LIMIT ?, 10`;
        db.query(query,[page*10],(err,result)=>{
            if (err) {
                console.log(err)
            } 
            else  { 
                res.status(200).json(result)
            }   
        })  
    } else {
        const query = `SELECT * FROM sell_records 
        WHERE product_id = '${search}' OR
              customer_name LIKE '%${search}%' OR
              contact_no LIKE '%${search}%'
        LIMIT ?, 10`;
        db.query(query,[page*10],(err,result)=>{
            if (err) {
                console.log(err)
            } else if (result.length === 0) {
                res.status(404).send([])
            }
            else  { 
                res.status(200).json(result)
            }   
        }) 
    }
       
})
app.get('/sellRecordsByDatePageCount', (req, res) => {
    const {from,to} = req.query
    const query = `SELECT * FROM sell_records
    WHERE selling_date >= '${from}' AND selling_date <= '${to}'`;
    db.query(query,(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  { 
            const pageCount = result.length / 10
            res.status(200).json(pageCount)
        }   
    })     
})
app.get('/sellRecord', (req, res) => {
    const {id} = req.query

    const query = `SELECT * FROM sell_records WHERE product_id = '${id}'`;
    db.query(query,(err,result)=>{
        if (err) {
            console.log(err)
        } else if (result.length === 0) {
            res.status(404).send([])
        }
        else  { 
            res.status(200).json(result[0])
        }   
    })        
})

app.get('/sellRecordsByDate', (req, res) => {
    const {page,from,to} = req.query
    if (from === '' || to === '') {
        const query = `SELECT * FROM sell_records ORDER BY selling_date DESC LIMIT ?, 10`;
    db.query(query,[page*10],(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  { 
            res.status(200).json(result)
        }   
    }) 
    } else {
        const query = `SELECT * FROM sell_records
    WHERE selling_date >= '${from}' AND selling_date <= '${to}'
    ORDER BY selling_date DESC LIMIT ?, 10`;
    db.query(query,[page*10],(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  { 
            res.status(200).json(result)
        }   
    }) 
    }    
})
app.post('/addSell', async (req, res) => {
    const {product_id,product_name,configuration,unit_price,customer_name,contact_no,address,selling_price,due,source_name} = req.body;
    const date = new Date().toISOString().split("T")[0]

    const query = `INSERT INTO sell_records (
                            product_id,
                            product_name,
                            configuration,
                            customer_name,
                            contact_no,
                            address,
                            buying_price,  
                            selling_price,  
                            due,
                            selling_date
                         )
                         VALUES (
            '${product_id}',
            '${product_name}',
            '${configuration}',
            '${customer_name}',
            '${contact_no}',
            '${address}',
             ${unit_price},
             ${selling_price},
             ${due},
            '${date}'
            )`;
    db.query(query,(err,result)=>{
            if (err) {
                console.log(err)
                res.status(500).send(err)
            } else {
                const deleteQuery = `DELETE FROM products WHERE product_id = '${product_id}'`;
                const updateQuery = `UPDATE inventory SET quantity = quantity - 1
                WHERE 
                product_name = '${product_name}' AND 
                configuration = '${configuration}' AND
                source_name = '${source_name}' AND
                unit_price = ${unit_price}`
                db.query(deleteQuery)
                db.query(updateQuery)
                res.status(200).send({message : "Sell record Inserted"})
            }
        })   
})
app.post('/addMonthly', async (req, res) => {
    const {sold,
        bought,
        due,
        employee,
        additionals,
        profit,
        record_date
    } = req.body;

    const query = `INSERT INTO monthly_records (
                                bought,
                                sold,
                                employee,
                                additionals,
                                due,
                                profit,
                                record_date
                         )
                         VALUES (
            ${bought},
            ${sold},
            ${employee},
            ${additionals},
            ${due},
            ${profit},
            '${record_date}'
            )`;
    db.query(query,(err,result)=>{
            if (err) {
                console.log(err)
                res.status(500).send(err)
            } else {
                res.status(200).send({message : "Record Added"})
            }
        })    
})
app.get('/monthlyRecords', (req, res) => {
    const {record_date} = req.query
    const query = `SELECT * FROM monthly_records WHERE record_date = '${record_date}'`;
    db.query(query,(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  { 
            res.status(200).json(result)
        }   
    })     
})
app.delete('/product', (req, res) => {
    const {id,product_name,configuration,source_name,unit_price} = req.query
    const deleteQuery = `DELETE FROM products WHERE product_id = '${id}'`;
    db.query(deleteQuery,(err,result)=>{
        if (err) {
            res.status(500).send("Internal server error")     
        } 
        else  { 
            const updateQuery = `UPDATE inventory SET quantity = quantity - 1
                WHERE 
                product_name = '${product_name}' AND 
                configuration = '${configuration}' AND
                source_name = '${source_name}' AND
                unit_price = ${unit_price}`
                db.query(updateQuery,(err,result)=>{
                    res.status(200).send("Item Removed")
                })
                
        }   
    })     
})
app.delete('/inventory', (req, res) => {
    const {id} = req.query
    const deleteQuery = `DELETE FROM inventory WHERE id = '${id}'`;
    db.query(deleteQuery,(err,result)=>{
        if (err) {
            res.status(500).send("Internal server error")     
        } 
        else  { 
            res.status(200).send("Item Removed")   
        }   
    })     
})
app.delete('/monthlyRecord', (req, res) => {
    const {id} = req.query
    const deleteQuery = `DELETE FROM monthly_records WHERE monthly_record_id = ${id}`;
    db.query(deleteQuery,(err,result)=>{
        if (err) {
            res.status(500).send("Internal server error")     
        } 
        else  { 
            res.status(200).send("Item Removed")   
        }   
    })     
})
app.delete('/sellRecords', (req, res) => {
    const {id} = req.query
    const deleteQuery = `DELETE FROM sell_records WHERE product_id = '${id}'`;
    db.query(deleteQuery,(err,result)=>{
        if (err) {
            res.status(500).send("Internal server error")     
        } 
        else  { 
            res.status(200).send("Item Removed")   
        }   
    })     
})


app.get('/', (req, res) => {
    res.send('running ')
})
app.listen(port, () => {
    console.log('crud is running')
})




