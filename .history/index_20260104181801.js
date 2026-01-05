const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 9000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { messaging } = require('firebase-admin');

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ofja8we.mongodb.net/?retryWrites=true&w=majority&tls=true`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server started successfully ✅');
});

async function run() {
  try {
    // ✅ Connect to MongoDB Atlas
    // await client.connect();
    console.log('MongoDB connected successfully ✅');

    const db = client.db('StudymateDB');
    const userProfileColl = db.collection('create-user-profile');
    const userColl=db.collection('userColl')
    const myConnection = db.collection('partnerRequest');
        

     app.post('/user', async (req, res) => {
      try {
        const userInfo= req.body;
        const query={email:userInfo.email}
         const alereadyExit=await userColl.findOne(query)
         if(alereadyExit)
         {
           return res.send({success:true,message:'already '})
         }
        const result = await userProfileColl.insertOne(userInfo);
        res.send(result);
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });
    // Create user profile
    app.post('/createProfile', async (req, res) => {
      try {
        const createProfile = req.body;
        const result = await userProfileColl.insertOne(createProfile);
        res.send(result);
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // Get partner by ID
    app.get('/partner/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userProfileColl.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // Get all user profiles
    app.get('/userProfile', async (req, res) => {
      const {experienceSort,limit,search,skip}= req.query; 
      console.log('experience',limit,search,skip)
         const query={}
         if(search)
         {
            query.$or=[
              {name:{$regex:search,$options:'i'}},
              {subject:{$regex:search,$options:'i'}},
              {studyMode:{$regex:search,$options:'i'}},
            ]
         }
      const result = await userProfileColl.find(query).limit(Number(limit)|| 0).skip(Number(skip)||0).toArray();
      const Totalcount=await userProfileColl.countDocuments()
          console.log('result',result)
      if (experienceSort) {
        const clickedLevel = experienceSort; // jeta button theke pathano hocche

        // clicked level sob samne, baki original order maintain
        result.sort((a, b) => {
          if (a.experienceLevel === clickedLevel && b.experienceLevel !== clickedLevel) return -1;
          if (b.experienceLevel === clickedLevel && a.experienceLevel !== clickedLevel) return 1;
          return 0; // baki order maintain
        });
      }

      res.send({result,Totalcount});
    });


     app.delete('/userProfile/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await  userProfileColl.deleteOne(query);
      res.send(result);
    });


    // Send partner request
    app.post('/myConnection', async (req, res) => {
      try {
        const { partnerId, request_Email } = req.body;

        const query = { _id: new ObjectId(partnerId) };
        const alreadyRequested = await myConnection.findOne({ partnerId, request_Email });

        if (alreadyRequested) {
          return res.send({ message: 'You have already sent a request' });
        }

        const update = { $inc: { patnerCount: 1 } };
        const updateCount = await userProfileColl.updateOne(query, update);
        const result = await myConnection.insertOne(req.body);

        res.send({
          success: true,
          message: 'Partner Request Sent Successfully!',
          requestData: result,
          updateCount,
        });j
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // Delete a connection
    app.delete('/myConnection/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myConnection.deleteOne(query);
      res.send(result);
    });

    // Get connections by email
    app.get('/myConnection', async (req, res) => {
      const email = req.query.email;
      const query={}
      if(email)
      {
         query.request_Email=email
      }
      const result = await myConnection.find(query).toArray();
      console.log('result',result)
      res.send(result);
    });

    // Update connection
    app.patch('/myConnection/:id', async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const query = { _id: new ObjectId(id) };
      const update = { $set: updateData };
      const result = await myConnection.updateOne(query, update);
      res.send(result);
    });
        //  search profile
    // app.get('/search', async (req, res) => {
    //   const search_text = req.query.search;
    //   let query = {}
    //   if (search_text) {
    //     query = { subject: { $regex: search_text, $options: 'i' } }
    //   }

    //   const result = await userProfileColl.find(query).toArray()
    //   res.send(result)
    // })


    // Top 6 study profiles by rating
    app.get('/topStudyProfile', async (req, res) => {
      const result = await userProfileColl.find().sort({ rating: -1 }).limit(6).toArray();
      res.send(result);
    });


    // // ✅ Ping MongoDB to confirm successful connection
    // await client.db('admin').command({ ping: 1 });
    console.log('Pinged MongoDB successfully ✅');
  } finally {

  }
}

run().catch(console.dir)

// ✅ Start Express server
app.listen(port, () => {
  console.log(`Server running on port ${port} 🚀`);
});

