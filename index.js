require('dotenv').config();
const express = require('express');
const connectDB = require('./Database/db').connectDB;
const pool = require('./Database/db').pool;

const app = express();
app.use(express.json());

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

app.post("/users", (req, res) => {
  const { name, email } = req.body;
  db.query(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "User created" });
    }
  );
});

connectDB();
app.listen(3000, () => {
  console.log("Server started on port 3000");
});