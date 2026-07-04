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

const user = process.env.DB_User;
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
    const tipColl = ecoTrackDB.collection('ecoTips');
    const eventColl = ecoTrackDB.collection('ecoEvent');
    const userChallengeColl = ecoTrackDB.collection('userChallenge')

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

  // my challenge api
app.get('/myActivity/:email', async (req, res) => {
  try {
    const email = req.params.email;

    const joinedChallenges = await userChallengeColl
      .find({ userId: email })
      .toArray();

    const myActivities = [];

    for (const item of joinedChallenges) {

      if (!ObjectId.isValid(item.challengeId)) {
        continue;
      }

      const challenge = await ecoTackColl.findOne({
        _id: new ObjectId(item.challengeId)
      });

      if (!challenge) continue;

      myActivities.push({
        ...challenge,
        progress: item.progress,
        status: item.status,
        joinDate: item.joinDate
      });
    }

    res.send(myActivities);

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});


// get the all challenge
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

    app.patch('/challenges/:id', async (req, res) => {
      const id = req.params.id;
      const challengeUpdate = req.body;
      const query = {
        _id: new ObjectId(id)
      }
      const update = {
        $set: challengeUpdate
      }
      const result = await ecoTackColl.updateOne(query, update);
      res.send(result)
    })

    // find the  join email or id
    app.get('/join/:email/:id', async (req, res) => {
      const id = req.params.id;
      const email = req.params.email;

      const userData = {
        userId: email,
        challengeId: id
      }
      const result = await userChallengeColl.findOne(userData)
      res.send(result);
    })

    app.patch('/challenges/join/:id', async (req, res) => {
      console.log("PATCH HIT");
      // id server gese
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      // oi idear doc search korse
      const challengeUpdate = await ecoTackColl.findOne(query);
      // pawar por participant 1 kore barse
      const updateChallenge = {
        $set: {
          participants: challengeUpdate.participants + 1
        }
      }

      // erpor seta update kore dise
      const updateResult = await ecoTackColl.updateOne(query, updateChallenge)

      // user data save
      const userData = {
        userId: req.body.userId,
        challengeId: id,
        status: 'not started',
        progress: 0,
        joinDate: new Date()
      }

      const finalResult = await userChallengeColl.insertOne(userData);
      res.send(updateResult, finalResult)
    })

    // delete funtion
    app.delete('/challenges/:id',async(req,res)=>{
       const id = req.params.id;
       const query ={_id: new ObjectId(id)};
       const result = await ecoTackColl.deleteOne(query)
       res.send(result)
    })


    app.get('/tips/latestTips', async (req, res) => {
      const latesTipsCursor = tipColl.find().limit(5);
      const result = await latesTipsCursor.toArray();
      res.send(result);
    })

    // one tips read
    app.get('/tips/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tipColl.findOne(query);
      res.send(result);
    })


    //  all tips read
    app.get('/tips', async (req, res) => {
      const cursorTips = tipColl.find();
      const result = await cursorTips.toArray();
      res.send(result);
    })



    // post 
    app.post('/tips', async (req, res) => {
      const id = req.body;
      const result = await tipColl.insertOne(id)
      res.send(result)
    })

    // update
    app.patch('/tips/:id', async (req, res) => {
      const id = req.params.id;
      const tipsUpdate = req.body;
      const query = { _id: new ObjectId(id) }
      const update = {
        $set: tipsUpdate
      }
      const result = await tipColl.updateOne(query, update)
      res.send(result)
    })

    // delete
    app.delete('/tips/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tipColl.deleteOne(query);
      res.send(result);

    })


    // ========> event <============//

    // get latest event
    app.get('/event/latestEvent', async (req, res) => {
      const eventCursor = eventColl.find().limit(4);
      const result = await eventCursor.toArray();
      res.send(result);
    })

    // get a single event by id

    app.get('/event/:id', async (req, res) => {
      const eventId = req.params.id;
      const query = { _id: new ObjectId(eventId) };
      const result = await eventColl.findOne(query);
      res.send(result);
    })

    // get all event

    app.get('/event', async (req, res) => {
      const cursor = eventColl.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // post event 

    app.post('/event', async (req, res) => {
      const id = req.body;
      const result = await eventColl.insertOne(id);
      res.send(result);
    })

    // get a update event

    app.patch('/event/:id', async (req, res) => {
      const id = req.params.id;
      const eventUpdate = req.body;
      const query = { _id: new ObjectId(id) };
      const upate = {
        $set: eventUpdate
      }

      const result = await eventColl.updateOne(query, upate);
      res.send(result);

    })

    // delete a event

    app.delete('/event/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventColl.deleteOne(query);
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