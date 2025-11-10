const express=require('express');
const app=express();
const cors=require('cors')
require('dotenv').config();
const port=process.env.PORT || 9000

const { MongoClient, ServerApiVersion, Collection } = require('mongodb');
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}
@cluster0.ofja8we.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(express.json())
app.use(cors())

app.get('/',(req,res)=>{
    res.send('server start studymate')
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db=client.db('StudymateDB')
    const userProfileColl=db.collection('create-user-profile')

    app.post('/user-Profile',async(req,res)=>{
        const createProfile=req.body;
        const result=await userProfileColl.insertOne(createProfile)
        res.send(result)
    })

    app.get('/userProfile',async(req,res)=>{
        const result=await userProfileColl.find().toArray()
       res.send(result)
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
}
console.log(process.env.DB_USERNAME, process.env.DB_PASSWORD);

run().catch(console.log(console.dir))
app.listen(port,()=>{
    console.log('server start here studymate ',port)
})