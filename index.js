require('dotenv').config();
const express = require('express');
const pool = require('./Database/db');
const app = express();

app.get('/', (req, res) => {
  res.send("AWS Node App Running 🚀");
});

// Test DB route
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server started"));