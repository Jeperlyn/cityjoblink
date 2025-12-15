const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg'); // Direct PG import
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. DATABASE CONFIGURATION (Single Source)
// ==========================================
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// 🔥 STARTUP CONNECTION TEST 🔥
// Ito ang magsasabi sayo kung okay ang connection pagka-start pa lang.
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ FATAL ERROR: Database Connection Failed!");
        console.error("👉 Reason:", err.message);
        console.error("👉 Check your .env file and PostgreSQL service.");
    } else {
        console.log("✅ DATABASE CONNECTED SUCCESSFULLY (ELMIS Schema)");
        release(); // Release the client immediately
    }
});

// ==========================================
// 2. EMAIL CONFIGURATION
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==========================================
// 3. ROUTES
// ==========================================

// Helper
app.get('/', (req, res) => {
  res.json({ message: "CityJobLink Backend is Live!" });
});

// REGISTER ROUTE (ELMIS Integrated)
app.post('/api/register', async (req, res) => {
  const client = await pool.connect(); 

  try {
    const { 
      email, password, role, 
      firstName, middleName, lastName, suffix, 
      bdayMonth, bdayDay, bdayYear, gender, 
      qcId, 
      companyName, industry, companyAddress, companyWebsite, contactNumber 
    } = req.body;

    console.log(`📝 Attempting Register: ${email} (${role})`);

    await client.query('BEGIN');

    // Check Duplicate
    const userCheck = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(401).json({ status: "error", message: "Email already exists!" });
    }

    // Insert User
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60000); 

    const insertUserQuery = `
      INSERT INTO users (
        username, email, password, role, status, active, 
        otp_secret, otp_expiry, is_verified, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 'pending', 1, $5, $6, FALSE, NOW(), NOW())
      RETURNING id
    `;

    const userResult = await client.query(insertUserQuery, [email, email, hashedPassword, role, otp, otpExpiry]);
    const newUserId = userResult.rows[0].id;

    // Insert Profile
    if (role === 'Seeker') {
        const monthMap = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06', Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' };
        const bdayString = `${bdayYear}-${monthMap[bdayMonth] || '01'}-${bdayDay}`;

        await client.query(`
            INSERT INTO clients (users_id, first_name, middle_name, last_name, suffix, date_of_birth, sex, qcitizen_id, contact_number, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        `, [newUserId, firstName, middleName, lastName, suffix, bdayString, gender, qcId, contactNumber]);

    } else if (role === 'Employer') {
        await client.query(`
            INSERT INTO companies (users_id, company_name, email_address, contact_number, website, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `, [newUserId, companyName, email, contactNumber, companyWebsite]);
    }

    await client.query('COMMIT');
    console.log("✅ User Registered Successfully");

    // Send Email
    const mailOptions = {
        from: `"CityJobLink" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verification OTP',
        html: `<h3>Your OTP is: <b>${otp}</b></h3>`
    };
    transporter.sendMail(mailOptions).catch(err => console.error("⚠️ Email Error:", err.message));

    res.json({ status: "success", message: "Registration successful!" });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ REGISTER ERROR:", err.message);
    res.status(500).json({ status: "error", message: "Server Error: " + err.message });
  } finally {
    client.release();
  }
});

// LOGIN ROUTE
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (result.rows.length === 0) return res.status(404).json({ status: "error", message: "User not found" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) return res.status(401).json({ status: "error", message: "Incorrect password" });
    if (!user.is_verified) return res.status(403).json({ status: "error", message: "Please verify email first" });

    // Get Name
    let displayName = user.username;
    if (user.role === 'Seeker') {
        const p = await pool.query("SELECT first_name FROM clients WHERE users_id = $1", [user.id]);
        if (p.rows.length) displayName = p.rows[0].first_name;
    } else if (user.role === 'Employer') {
        const p = await pool.query("SELECT company_name FROM companies WHERE users_id = $1", [user.id]);
        if (p.rows.length) displayName = p.rows[0].company_name;
    }

    res.json({ status: "success", user: { id: user.id, email: user.email, role: user.role, name: displayName } });

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
});

// VERIFY OTP
app.post('/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

        const user = result.rows[0];
        if (user.otp_secret !== otp) return res.status(400).json({ error: "Invalid OTP" });

        await pool.query("UPDATE users SET is_verified = TRUE, otp_secret = NULL WHERE id = $1", [user.id]);
        res.json({ status: "success", message: "Verified!" });
    } catch (err) {
        res.status(500).json({ error: "Verification Error" });
    }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});