const express=require('express');
const app=express();
const cors=require('cors')
require('dotenv').config();
const port=process.env.PORT || 9000


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const myConnection=db.collection('partnerRequest')
        // createProfile
    app.post('/createProfile',async(req,res)=>{
        const createProfile=req.body;
        const result=await userProfileColl.insertOne(createProfile)
        res.send(result)
    })
    app.get('/partner/:id',async(req,res)=>{
        const id=req.params.id
        const query={ _id: new ObjectId(id)}
        const result=await userProfileColl.findOne(query)
        res.send(result)
    })
  //    display userProfile
    app.get('/userProfile',async(req,res)=>{
        const result=await userProfileColl.find().toArray()
       res.send(result)
    })
      //  myconnection user
      app.post('/myConnection',async(req,res)=>{
        try {
            const partnerRequest=req.body;
         const {partnerId,request_Email}=partnerRequest;
         const  query={_id: new ObjectId(partnerId)}
          const alredayRequested=await myConnection.findOne({partnerId,request_Email})
          
          if(alredayRequested)
          {
             return res.send({message:'you have alreday request'})
          }
           const update={$inc:{patnerCount:+ 1}}
          const updateCount=await userProfileColl.updateOne(query,update)
           const result=await myConnection.insertOne(partnerRequest)
          
         
         return res.send({
          success: true,
        message: "Partner Request Sent Successfully!",
          requsetData:result,updateCount})
         
        } catch (error) {
           return res.status(500).send({ success: false, message: error.message });
        }
        
      })

      // myconnection delete 

     
     
    app.get('/myConnection',async(req,res)=>{
      const  email=req.query.email;
      const  query={request_Email:email}
      const  result=await myConnection.find(query).toArray();
      
      res.send(result);
    })
    
    app.get('/topStudyProfile',async(req,res)=>{
        const result=await userProfileColl.find().sort({rating:-1}).limit(6).toArray()
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

