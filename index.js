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
    try {
        await client.connect();
        const toolsCollection = client.db('ecparts').collection('tools');
        const ordersCollection = client.db('ecparts').collection('order');
        const usersCollection = client.db('ecparts').collection('users');
        const reviewsCollection = client.db('ecparts').collection('reviews');

        // Load all tools
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })

        // add new tools/product

        app.post('/tools', async (req, res) => {
            const tool = req.body;            
            const result = await toolsCollection.insertOne(tool);                    
            res.send(result);
        })

        // Load dynamic route for tools
        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toolsCollection.findOne(query);
            res.send(result)
        })

        // Order api - working
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        // Load Orders - individual
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // Delete Data

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        })

        // register user to the database
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const option = { upsert: true };
            const updateUser = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateUser, option);
            res.send(result);
        })

        // Load Users
        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = usersCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        })
        
        // Load single user by id
        app.get('/users/:id', async (req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

        // Load single user by email
        app.get('/users/:email', async (req, res)=>{
            const email = req.email;
            const query = {email:email};
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

        // Delete User

        app.delete('/users/:id', async (req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        // Make Admin
        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateUser = {
                $set: {role: 'admin'},
            };
            const result = await usersCollection.updateOne(filter, updateUser);
            res.send(result);
        })

        // Load all review
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })

        // add new review

        app.post('/review', async (req, res) => {
            const review = req.body;            
            const result = await reviewsCollection.insertOne(review);                    
            res.send(result);
        })

        


        // Last bracket of try
    }



    finally {
        // close
    }
}

run().catch(console.dir);









app.listen(port, () => {
    console.log('Manufacturer is listing to port', port);
})