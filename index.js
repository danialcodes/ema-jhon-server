require('dotenv').config();
const express = require("express");
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.set('json spaces', 2);
const admin = process.env.DB_USER;
const password = process.env.DB_PASS;



const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${admin}:${password}@cluster0.zrm8o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("Connected Successfully");
        const database = client.db("ema-jhon");
        const collection = database.collection("products");
        const orders = database.collection("orders");

        app.get("/products", async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            console.log("Getting Products form Database");
            const query = {};
            const cursor = collection.find(query);
            const count = await cursor.count();
            const allProducts = await cursor.toArray();
            let start = 0;
            let end = count;
            if (count) {
                start = size * (page - 1);
                end = size * (page);
                console.log(start, end);
            }

            const products = allProducts.slice(start, end);
            res.json({ count, start, end, products });
            // console.log(products);
            console.log(`Products data sent to client from ${start} to ${end}`);
        })


        app.post("/products/bykeys", async (req, res) => {
            const keys = req.body;
            const query = {
                key: {
                    $in: keys
                }
            };
            const products = await collection.find(query).toArray();
            res.json(products);


        })

        // Order API
        app.post("/orders",async (req,res)=>{
            const order = req.body;
            console.log(orders);
            const result = await orders.insertOne(order);
            res.json(result);
        })

    } finally {
        //   await client.close();
        //   console.log("Connection Closed");
    }
}






run().catch(console.dir);




app.get("/", (req, res) => {
    res.send("Welcome");
})

app.listen(port, () => {
    console.log("Server Running at port", port);
})