require('dotenv').config();
const { Pool } = require('pg');

console.log("🔍 Testing Connection with these settings:");
console.log("User:", process.env.DB_USER);
console.log("Host:", process.env.DB_HOST);
console.log("Database:", process.env.DB_NAME);
console.log("Port:", process.env.DB_PORT);
console.log("Password:", process.env.DB_PASSWORD ? "**** (Hidden)" : "(Empty!)");

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

(async () => {
  try {
    console.log("\n⏳ Connecting...");
    const client = await pool.connect();
    console.log("✅ SUCCESS! Connected to Database.");
    
    const res = await client.query('SELECT NOW()');
    console.log("🕒 Database Time:", res.rows[0].now);
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ CONNECTION FAILED!");
    console.error("Error Code:", err.code);
    console.error("Message:", err.message);
    
    if (err.code === '28P01') console.log("👉 HINT: Mali ang password user.");
    if (err.code === '3D000') console.log("👉 HINT: Walang database na ganito ang pangalan.");
    if (err.code === 'ECONNREFUSED') console.log("👉 HINT: Hindi naka-on ang PostgreSQL server o mali ang PORT (5432).");
    
    process.exit(1);
  }
})();