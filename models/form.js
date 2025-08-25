const mongoose = require("mongoose");

// creatig a schema
const formSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  city: String,
});

// creating a model related to the schema
module.exports = mongoose.model("form", formSchema);
