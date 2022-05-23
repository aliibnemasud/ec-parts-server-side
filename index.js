const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        // Load tools
        app.get('/tools', async (req, res)=>{            
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);           
        })
    }

    finally{

    }    
}

run().catch(console.dir);









app.listen(port, () => {
    console.log('Manufacturer is listing to port', port);
})