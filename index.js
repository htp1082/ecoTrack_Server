const express = require('express')
const app = express();
const cors = require('cors')
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middlewear
app.use(cors());
app.use(express.json())

// security env

const user =process.env.DB_User;
const password = process.env.DB_Password

app.get('/', (req, res) => {
  res.send('EcoTrack Server is running')
})


const uri = `mongodb+srv://${user}:${password}@cluster0.yvfnrmq.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const ecoTrackDB = client.db("ecoTrackDB");
    const ecoTackColl = ecoTrackDB.collection("ecoTrack");
    const tipColl =ecoTrackDB.collection('ecoTips')


    // ===========> challege section <============== //

    app.get('/challenges/latestChallenge', async (req, res) => {
      const cursor = ecoTackColl.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })

     app.get('/challenges/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) };
      const result = await ecoTackColl.findOne(query)
      res.send(result)
    })


    app.get('/challenges', async (req, res) => {
      const cursor = ecoTackColl.find();
      const result = await cursor.toArray()
      res.send(result);
    })

   
    app.post('/challenges', async (req, res) => {
      const id = req.body;
      const result = await ecoTackColl.insertOne(id);
      res.send(result)
    })

    app.delete('/challenges/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await ecoTackColl.deleteOne(query);
      res.send(result)
    })


    // ===========> tips section <============ //


    // tips challenge

    app.get('/tips/latestTips',async(req,res)=>{
      const latesTipsCursor = tipColl.find().limit(5);
      const result = await latesTipsCursor.toArray();
      res.send(result);
    })

    //  all tips read
    app.get('/tips',async(req,res)=>{
            console.log('get tips')

      const cursorTips =  tipColl.find();
      const result = await cursorTips.toArray();
      res.send(result);
    })

    // one tips read
    app.get('/tips/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await tipColl.findOne(query);
      res.send(result);
    })


    app.post('/tips',async(req,res)=>{
      const id = req.body;
      const result =await tipColl.insertOne(id)
      res.send(result)
    })

    app.patch('/tips/:id',async(req,res)=>{
      const id = req.params.id;
      const tipsUpdate = req.body;
      const query ={_id: new ObjectId(id)}
      const update ={
        $set: tipsUpdate
      }
      const result = await tipColl.updateOne(query,update)
      res.send(result)
    })

    app.delete('/tips/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await tipColl.deleteOne(query);
      res.send(result);

    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})