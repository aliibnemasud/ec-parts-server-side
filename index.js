const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { get } = require('express/lib/response');
const query = require('express/lib/middleware/query');


require('dotenv').config()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send("Manufacturer Website Server is Running...")
})

//  Mogodb Connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecparts.fhkxc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect();        
        const toolsCollection = client.db('ecparts').collection('tools');
        const ordersCollection = client.db('ecparts').collection('order');

        // Load all tools
        app.get('/tools', async (req, res)=>{            
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);           
        })

        // Load dynamic route for tools
        app.get('/tools/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await toolsCollection.findOne(query);
            res.send(result)
        })

        // Order api - working
        app.post('/orders', async(req, res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);                     
        })
        
        // Load Orders

        app.get('/orders', async (req, res)=>{            
            const query = {};
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);           
        })


    }

    finally{

    }    
}

run().catch(console.dir);









app.listen(port, () => {
    console.log('Manufacturer is listing to port', port);
})