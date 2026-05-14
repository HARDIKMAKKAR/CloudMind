const mongoose = require("mongoose");

const containerSchema = new mongoose.Schema({

  containerId: String,

  port: Number,

  status: {
    type: String,
    default: 'running'
  }

});

const ServiceSchema = new mongoose.Schema({

  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
},

  serviceId: String,

  name: String,

  repoUrl: String,

  port: Number,

  status: {
    type: String,
    default: 'running'
  },

  replicas: {
    type: Number,
    default: 1
  },

  containers: [containerSchema],

  error: String,

  type: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports =
  mongoose.model("Service", ServiceSchema);