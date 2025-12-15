const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db');
const nodemailer = require('nodemailer'); // Isang beses lang dapat ito!
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- ROUTES ---

// 1. Check Server
app.get('/', (req, res) => {
  res.json({ message: "CityJobLink Backend is Running! 🚀" });
});

// 2. Check Database
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ status: "success", message: "Database Connected!", time: result.rows[0].now });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database Connection Failed" });
  }
});

// 3. REGISTER ROUTE (Step 1: Save User)
app.post('/api/register', async (req, res) => {
  try {
    const { 
      email, password, role, firstName, middleName, lastName, suffix, 
      bdayMonth, bdayDay, bdayYear, gender, qcId, qcIdFileName,
      companyName, industry, companyAddress, companyWebsite, contactNumber 
    } = req.body;

    // Check if email exists
    const userCheck = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(401).json({ status: "error", message: "Email already exists!" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert User (Initial status: is_verified = FALSE)
    const newUser = await db.query(
      `INSERT INTO users (
         email, password, role, 
         first_name, middle_name, last_name, suffix, 
         bday_month, bday_day, bday_year, gender, 
         qc_id_number, qc_id_filename,
         company_name, industry, company_address, company_website, contact_number,
         is_verified
       ) VALUES (
         $1, $2, $3, 
         $4, $5, $6, $7, 
         $8, $9, $10, $11, 
         $12, $13,
         $14, $15, $16, $17, $18,
         FALSE
       ) RETURNING *`,
      [
        email, hashedPassword, role, 
        firstName, middleName, lastName, suffix,
        bdayMonth, bdayDay, bdayYear, gender, 
        qcId, qcIdFileName,
        companyName, industry, companyAddress, companyWebsite, contactNumber
      ]
    );

    res.json({ status: "success", message: "User registered successfully." });

  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
});

// 4. SEND OTP ROUTE (Step 2: Generate & Email Code)
app.post('/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    // Expiry: 5 minutes from now
    const expiry = new Date(Date.now() + 5 * 60000); 

    try {
        // Update User with OTP
        await db.query(
            'UPDATE users SET otp_secret = $1, otp_expiry = $2 WHERE email = $3',
            [otp, expiry, email]
        );

        // Send Email
        const mailOptions = {
            from: `"CityJobLink Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'CityJobLink Verification Code',
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px;">
                <h2 style="color: #007bff;">Verification Code</h2>
                <p>Please use the following OTP to verify your account:</p>
                <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
                <p>This code expires in 5 minutes.</p>
              </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        res.json({ status: "success", message: 'OTP sent.' });

    } catch (err) {
        console.error("OTP SEND ERROR:", err.message);
        res.status(500).json({ status: "error", message: 'Failed to send OTP.' });
    }
});

// 5. VERIFY OTP ROUTE (Step 3: Validate Code)
app.post('/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const result = await db.query('SELECT id, otp_secret, otp_expiry FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) return res.status(404).json({ error: 'User not found.' });
        
        // Validation Checks
        if (user.otp_secret !== otp) {
            return res.status(400).json({ error: 'Invalid OTP code.' });
        }
        if (new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({ error: 'OTP expired.' });
        }

        // Success: Clear OTP and Set Verified
        await db.query('UPDATE users SET is_verified = TRUE, otp_secret = NULL, otp_expiry = NULL WHERE id = $1', [user.id]);

        res.json({ status: "success", message: 'Verified successfully.' });

    } catch (err) {
        console.error("OTP VERIFY ERROR:", err.message);
        res.status(500).json({ error: 'Server verification error.' });
    }
});

// 6. LOGIN ROUTE
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userQuery = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    const user = userQuery.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Incorrect password." });
    }

    if (!user.is_verified) {
         return res.status(403).json({ status: "error", message: "Please verify your email first." });
    }

    delete user.password;
    delete user.otp_secret;
    delete user.otp_expiry;

    res.json({ status: "success", user });

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});