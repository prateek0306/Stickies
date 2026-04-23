const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  text: String,
  color: String,
  x: Number,
  y: Number,
  z: Number,
  pinned: Boolean,
  date: String
});

module.exports = mongoose.model("Note", noteSchema);