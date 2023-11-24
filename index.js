const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000 ;

// middler Ware 

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rwemj7d.mongodb.net/?retryWrites=true&w=majority`;

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
    const userInformationCollection = client.db("diagnosticDB").collection("users")   
    const bannerInfoCollection = client.db("diagnosticDB").collection("banners")   
   

//Banner Post Method
app.get("/banners", async(req,res)=>{
  const result = await bannerInfoCollection.find().toArray();
  res.send(result)
})

//Banner Post Method
app.post("/banners", async(req,res)=>{
  const banners = req.body;
  const result = await bannerInfoCollection.insertOne(banners)
  res.send(result)
})



// Users Data Get 
app.get("/users/:email", async(req, res)=>{
  const email = req.params.email;
  const query = {email:email}
   const users = await userInformationCollection.find(query).toArray();
   
   res.send(users)
})


// user admin role check

app.get("/users/admin/:email", async(req,res)=>{
  const email = req.params.email;
  const query = {email : email};
  const user = await userInformationCollection.findOne(query);
  let admin = false;
  if(user){
    admin = user?.role === 'admin'
  }
  console.log({ admin });
  res.send({ admin })

})

  // users Post
 app.post("/users",async(req,res)=>{
    const userInfo = req.body;
    const result = await userInformationCollection.insertOne(userInfo);
    res.send(result)
 })
   


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);











app.get("/", (req,res)=>{
    res.send("Check Donistice Notion")
})

app.listen( port, ()=>{
    console.log(`server Side run ${port}`);
})