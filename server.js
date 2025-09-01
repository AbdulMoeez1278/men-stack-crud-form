const express = require("express"); // include express module
// const mongoose = require("mongoose"); // include mongoose module
const { MongoClient, ObjectId } = require("mongodb"); // import mongoClient module

// initialize express as an app
const app = express();

// creating middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // This middleware is used to parse incoming form data

// using template engine
app.set("view engine", "ejs");
app.set("views", "./views");

// mongoDB Connection
const dbName = "crud-form";
const collectionName = "forms";
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url); // class that allows for making Connections to MongoDB

// create a connection with database
const connection = async () => {
  const connect = await client.connect();
  return await connect.db(dbName);
};

// intialized port and hostname
const port = 3000;
const hostname = "127.0.0.1";

// GET API Route
app.get("/", async (req, res) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const result = await collection.find().toArray();
  const personResult = "";
  const curdStatus = "insert";

  res.render("home", { result, curdStatus, personResult });
});

// POST API Route
app.post("/insertRecords", async (req, res) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const result = await collection.insertOne(req.body);
  const curdStatus = "insert";

  if (result) {
    res.redirect("/", result, curdStatus);
    // res.redirect("/success");
  } else {
    res
      .status(500)
      .send({ error: "Failed to save data", details: error.message });
  }
});

// Update API Routes - update using GET & POST API Route
app.get("/update/:id", async (req, res) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const curdStatus = "update";
  const result = await collection.find().toArray();
  const personResult = await collection.findOne({
    _id: new ObjectId(req.params.id),
  });

  // console the id to check if it is working properly or not
  console.log("Received ID for Update:", req.params.id);

  if (result) {
    res.render("home", { result, curdStatus, personResult });
  } else {
    res.status(400).send({
      status: "error",
      message: "Update failed. Please try again or contact support.",
    });
  }
});

app.post("/update/:id", async (req, res) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const filter = { _id: new ObjectId(req.params.id) };
  const updateData = {
    $set: {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      city: req.body.city,
    },
  };
  const result = await collection.updateOne(filter, updateData);

  // console the updated id's to check if these working properly or not
  console.log(filter, updateData);

  if (result) {
    res.redirect("/");
    // res.redirect("/update/" + req.params._id);
  } else {
    res.status(400).send({
      status: "error",
      message: "Update failed. Please try again or contact support.",
    });
  }
});

// DELETE API Route for single delete task - using POST API Route
app.post("/delete/:id", async (req, res) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const result = await collection.deleteOne({
    _id: new ObjectId(req.params.id),
  });

  // console the single id to check if it is working properly or not
  console.log("ID Deleted:", req.params.id);

  if (result) {
    res.redirect("/");
  } else {
    res.status(400).send({
      status: "error",
      message:
        "Unable to delete the entry. It may not exist or something went wrong. Please try again.",
    });
  }
});

// multi-delete items using checkboxes
app.post("/multi-delete", async (req, res) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  let selectedTasks = undefined;

  // console the id's to check if it is working properly or not
  console.log("Multiple Id's Deleted", req.body.selectedTasks);

  // check the condition if it is array or not - if array then we traverse them to a new object id
  if (Array.isArray(req.body.selectedTasks)) {
    selectedTasks = req.body.selectedTasks.map((id) => new ObjectId(id));
  } else {
    selectedTasks = [new ObjectId(req.body.selectedTasks)];
  }

  // for deleting multiple tasks from db or ui
  const result = await collection.deleteMany({ _id: { $in: selectedTasks } });
  if (result) {
    res.redirect("/");
  } else {
    res.status(400).send({
      status: "error",
      message:
        "Unable to delete the entry. It may not exist or something went wrong. Please try again.",
    });
  }
});

// server listening
app.listen(port, hostname, () => {
  console.log(`Server is listening on ${hostname}:${port}`);
});
