require('dotenv').config();
const express = require('express');
const connectDB = require('./Database/db').connectDB;
const app = express();

app.get('/', (req, res) => {
  res.send("AWS Node App Running 🚀");
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

connectDB();
app.listen(3000, () => {
  console.log("Server started on port 3000");
});