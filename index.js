require('dotenv').config();
const express = require('express');
const connectDB = require('./Database/db').connectDB;
const pool = require('./Database/db').pool;
const multer = require('multer');
const { S3Client, PutObjectCommand,GetObjectCommand } = require('@aws-sdk/client-s3');

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

// Route to create users table
app.get("/create-table", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100)
      )
    `);
    res.send("Table created successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/users", (req, res) => {
  const { name, email } = req.body;
  pool.query(
    "INSERT INTO users (name, email) VALUES ($1, $2)",
    [name, email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "User created" });
    }
  );
});

app.get("/users", (req, res) => {
  pool.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result.rows);
  });
});



// upload controller develops here
const storage = multer.memoryStorage();
const upload = multer({ storage });

const BUCKET_NAME = process.env.AWS_BUCKET || "";
const REGION_NAME = process.env.AWS_REGION || "";
const s3 = new S3Client({
  region: REGION_NAME,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  }
})
async function putObject(fName,cType){
    const command=new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${fName}`,
        ContentType: cType,
    })

    const url = await getSignedUrl(s3,command);
    return url;
}

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const url = await putObject(`${req.file.originalname}`,"image/jpeg");
    console.log("URL for uploading the photo is: ", url);
    res.json({ message: "File uploaded to S3" });
  } catch (error) {
    res.status(500).json(error);
  }
});



connectDB();
app.listen(3000, () => {
  console.log("Server started on port 3000");
});