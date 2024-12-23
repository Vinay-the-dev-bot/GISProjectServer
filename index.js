const express = require("express");
const { connection } = require("./db");
const app = express();
const dotenv = require("dotenv").config();
const { default: mongoose } = require("mongoose");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const drawingSchema = new mongoose.Schema({
  data: {
    type: Object,
    required: true
  },
  userEmail: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Drawing = mongoose.model("Drawing", drawingSchema);

app.get("/drawings", async (req, res) => {
  console.log(req.query);
  try {
    const { userEmail } = req.query;
    console.log("GET EMAIL", userEmail);
    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }

    const drawings = await Drawing.findOne({ userEmail });
    res.json(drawings);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving drawings" });
  }
});

app.post("/drawings", async (req, res) => {
  try {
    const { data, userEmail } = req.body;
    console.log({ data, userEmail });
    if (!data || !userEmail) {
      return res
        .status(400)
        .json({ message: "Data and userEmail are required" });
    }

    const existingDrawing = await Drawing.findOne({ userEmail });

    if (existingDrawing) {
      existingDrawing.data = data;

      await existingDrawing.save();
      const updatedDrawingResponse = {
        ...existingDrawing.toObject(),
        status: true
      };
      return res.status(200).json(updatedDrawingResponse);
    } else {
      const newDrawing = new Drawing({ data, userEmail, status: true });
      await newDrawing.save();
      const newDrawingResponse = { ...newDrawing.toObject(), status: true };
      return res.status(201).json(newDrawingResponse);
    }
  } catch (err) {
    consol.log("ERR", err);
    res.status(400).json({ status: false, message: "Error saving drawing" });
  }
});

app.delete("/drawings", async (req, res) => {
  try {
    const { userEmail } = req.body;
    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }

    await Drawing.deleteMany({ userEmail });
    res
      .status(200)
      .json({ message: "All drawings for the user have been deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting drawings" });
  }
});

app.get("/", (req, res) => {
  res.send("HOME");
});

app.listen(process.env.PORT, async () => {
  await connection;
  console.log("Connected to DB");
  console.log(`Listening at ${process.env.PORT}`);
});
