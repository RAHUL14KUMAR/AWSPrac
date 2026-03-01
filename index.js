require('dotenv').config();
const express = require('express');
const connectDB = require('./Database/db').connectDB;
const app = express();

app.get('/', (req, res) => {
  res.send("AWS Node App Running 🚀");
});
connectDB();
app.listen(3000, () => {
  console.log("Server started on port 3000");
});