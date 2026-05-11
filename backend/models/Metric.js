const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema({

  serviceId: String,

  cpu: Number,

  memory: Number,

  latency: Number,

  timestamp: {
    type: Date,
    default: Date.now
  }

});

module.exports =
  mongoose.model(
    "Metric",
    metricSchema
  );