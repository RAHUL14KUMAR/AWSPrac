const {Client}=require('pg');

const pool = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});
async function connectDB() {
  try {
    await pool.connect();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1); // stop app if DB fails
  }
}


module.exports={ pool, connectDB };
