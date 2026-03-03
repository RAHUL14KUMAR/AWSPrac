require('dotenv').config();
const express = require('express');
const connectDB = require('./Database/db').connectDB;
const pool = require('./Database/db').pool;
const multer = require('multer');
const { S3Client, PutObjectCommand,GetObjectCommand } = require('@aws-sdk/client-s3');

// we used the getSignedUrl for the url from aws so that we can able to upload the photo to s3 using that url. means photo is getting upload on the behalf of aws root user
const { getSignedUrl }= require( "@aws-sdk/s3-request-presigner");

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

// on the behalf of root user we are seeeing the upload files data
async function getObjectUrl(key){
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return url;
}
async function putObject(file){
    const KEY=Date.now() + "-" + file.originalname
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: KEY,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3.send(command);

    // this is public url so that everyone on the internet can access the file but my s3 bucket is private now so we need to use the getObjectUrl function to get the signed url for the file which is private and we can access it using that url for a limited time.
    // return `https://${BUCKET_NAME}.s3.${REGION_NAME}.amazonaws.com/${command.input.Key}`;

    return KEY;
}

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const KEY = await putObject(req.file);
    const url = await getObjectUrl(KEY);

    console.log("Uploaded file URL:", url);

    res.json({
      message: "File uploaded to S3 successfully",
      KEY:KEY,
      url: url
    });

  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

connectDB();
app.listen(3000, () => {
  console.log("Server started on port 3000");
});