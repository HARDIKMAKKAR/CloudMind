const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({

  serviceId: String,

  name: String,

  repoUrl: String,

  port: Number,

  status: String,

  replicas: Number,

  error: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports =
  mongoose.model("Service", ServiceSchema);