const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({

  projectName: String,

  message: String,

  level: {
    type: String,
    default: "info"
  },

  timestamp: {
    type: Date,
    default: Date.now
  }

});

module.exports =
  mongoose.model("Log", LogSchema);
  