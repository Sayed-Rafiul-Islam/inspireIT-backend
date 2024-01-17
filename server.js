const express = require('express');
require('dotenv').config()
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}))

// Route Imports

const varification = require('./routes/varification')
const inventoryRouter = require('./routes/inventoryRouter')
const productRouter = require('./routes/productRouter')
const sellRouter = require('./routes/sellRouter')
const monthlyRouter = require('./routes/monthlyRouter')
const adminRouter = require('./routes/adminRouter')

// Routes 

app.use('/api',varification)
app.use('/api', inventoryRouter)
app.use('/api', productRouter) 
app.use('/api', sellRouter) 
app.use('/api', monthlyRouter) 
app.use('/api', adminRouter) 

app.get('/', (req, res) => {
    res.send('running ')
})
app.listen(port, () => {
    console.log(`Server is running at port : ${port}` )
})




