const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Note = require("./models/Note");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// 🔗 PUT YOUR MONGODB ATLAS URL HERE
mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// GET all notes
app.get("/notes", async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

// ADD note
app.post("/notes", async (req, res) => {
  const note = new Note(req.body);
  await note.save();
  res.json(note);
});

// UPDATE note
app.put("/notes/:id", async (req, res) => {
  await Note.findByIdAndUpdate(req.params.id, req.body);
  res.send("Updated");
});

// DELETE note
app.delete("/notes/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});

app.listen(3000, () => console.log("Server running on port 3000"));