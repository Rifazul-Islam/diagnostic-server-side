const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = process.env.PORT || 5000;

// middler Ware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rwemj7d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const userInformationCollection = client
      .db("diagnosticDB")
      .collection("users");
    const bannerInfoCollection = client
      .db("diagnosticDB")
      .collection("banners");
    const recommendationCollection = client
      .db("diagnosticDB")
      .collection("recommendation");
    const testsCollection = client.db("diagnosticDB").collection("tests");
    const allAppointmentCollection = client
      .db("diagnosticDB")
      .collection("appointments");

    // payment GetWay Use

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // Appointment post Method
    app.get("/appointments/:email", async (req, res) => {
      const userEmail = req.params.email;

      const query = { userEmail: userEmail };
      const result = await allAppointmentCollection.find(query).toArray();
      res.send(result);
    });

    // Appointment post Method
    app.delete("/appointments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAppointmentCollection.deleteOne(query);
      res.send(result);
    });

    // Appointment post Method
    app.post("/appointments", async (req, res) => {
      const appoint = req.body;
      const result = await allAppointmentCollection.insertOne(appoint);
      res.send(result);
    });

    // get a test Data
    app.get("/tests", async (req, res) => {
      const result = await testsCollection.find().toArray();
      res.send(result);
    });

    // all test pagination data get
    app.get("/tests/pagination", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const result = await testsCollection
        .find()
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    // get a test data specific Id
    app.get("/tests/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await testsCollection.findOne(query);
      res.send(result);
    });

    // post a new Tests
    app.post("/tests", async (req, res) => {
      const tests = req.body;
      const result = await testsCollection.insertOne(tests);
      res.send(result);
    });

    // get put Method Use
    app.put("/test/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          image: update?.image,
          testName: update?.testName,
          price: update?.price,
          date: update?.date,
          description: update?.description,
          slotsStart: update?.slotsStart,
          slotsEnd: update?.slotsEnd,
        },
      };

      const result = await testsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Total Test Number Get
    app.get("/testCount", async (req, res) => {
      const count = await testsCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // delete Method Use
    app.delete("/tests/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await testsCollection.deleteOne(query);
      res.send(result);
    });

    // get recommendation data
    app.get("/recommendation", async (req, res) => {
      const result = await recommendationCollection.find().toArray();
      res.send(result);
    });

    //Banner Get Method
    app.get("/banner", async (req, res) => {
      const result = await bannerInfoCollection.findOne({ status: true });
      res.send(result);
    });

    //Banner Get Method
    app.get("/banners", async (req, res) => {
      const result = await bannerInfoCollection.find().toArray();
      res.send(result);
    });

    // Banner Data Get Id Thro
    app.patch("/banner/:id", async (req, res) => {
      const results = await bannerInfoCollection.updateMany(
        {},
        { $set: { status: false } }
      );

      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await bannerInfoCollection.updateOne(query, {
        $set: { status: true },
      });

      res.send(result);
    });

    //Banner Post Method
    app.post("/banners", async (req, res) => {
      const banners = req.body;
      const result = await bannerInfoCollection.insertOne(banners);
      res.send(result);
    });

    // Banner Delete System Implement
    app.delete("/banners/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bannerInfoCollection.deleteOne(query);
      res.send(result);
    });

    // user data get System
    app.get("/users", async (req, res) => {
      const result = await userInformationCollection.find().toArray();
      res.send(result);
    });

    // user data get System
    app.get("/users/specific/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userInformationCollection.findOne(query);
      res.send(result);
    });

    // Users Data Get  Email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const users = await userInformationCollection.find(query).toArray();

      res.send(users);
    });

    // user admin role check

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userInformationCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }

      res.send({ admin });
    });

    // users Post
    app.post("/users", async (req, res) => {
      const userInfo = req.body;
      const result = await userInformationCollection.insertOne(userInfo);
      res.send(result);
    });

    // put method Emplement

    app.put("/user/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: update?.name,
          email: update?.email,
          bloodGroup: update?.bloodGroup,
          district: update?.district,
          upazila: update?.upazila,
          image: update?.image,
          role: update?.role,
        },
      };

      const result = await userInformationCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Diagnostic running Now");
});

app.listen(port, () => {
  console.log(`server Side run ${port}`);
});
