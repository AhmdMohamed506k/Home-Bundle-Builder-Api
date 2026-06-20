import 'dotenv/config'
import './src/utils/Redis/RedisClient.js';
import express from 'express';
import ConnectionDB from './DB/ConnectionDB.js';
import CategoryRouter from './src/modules/Category/Category.routes.js';
import ProductRouter from './src/modules/Product/Product.routes.js';
import CartRouter from './src/modules/Cart/Cart.routes.js';
import cors from "cors"

const app = express();
const port = process.env.Port || 3000;


app.use(express.json())


app.use(cors({origin : "*"}));


// ======DBConnection========
ConnectionDB()
// ==========================



// ================Routers==================
app.use("/api/v1/categories",CategoryRouter)

app.use("/api/v1/Products",ProductRouter)

app.use("/api/v1/Cart", CartRouter)
// ========================================






app.get('/', (req, res) => {res.send('Welcome at Take-Home Bundle Builder API !');});

app.use((err, req, res, next) => {

    const statusCode = err.cause || err.statusCode || 500;
    
    console.error(err.stack); 
    
    res.status(statusCode).json({ 
        success: false, 
        message: err.message || "Internal Server Error" 
    });
});




app.listen(port, () => {
    console.log(`Server running on port ${process.env.Port}`);
});