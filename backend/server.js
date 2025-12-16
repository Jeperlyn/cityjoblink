const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const multer = require('multer'); // 👈 NEW: Import Multer
const fs = require('fs'); // Para sa file system operations
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Para ma-access ang files sa 'uploads' folder
app.use('/uploads', express.static('uploads')); 

// ==========================================
// 1. DATABASE CONFIGURATION (PostgreSQL)
// ==========================================
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// 🔥 STARTUP CONNECTION TEST 🔥
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ FATAL ERROR: Database Connection Failed!");
        console.error("👉 Reason:", err.message);
        console.error("👉 Check your .env file and PostgreSQL service.");
    } else {
        console.log("✅ DATABASE CONNECTED SUCCESSFULLY (CityJobLink Schema)");
        release();
    }
});

// ==========================================
// 2. EMAIL CONFIGURATION (Nodemailer)
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ==========================================
// 3. MULTER CONFIGURATION (File Uploads)
// ==========================================

// Storage setup: Saves files to the 'uploads' folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Tiyakin na mayroon kang folder na 'uploads' sa root ng backend mo
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Gumawa ng unique filename (UserID-timestamp.ext)
        const emailPart = req.body.email ? req.body.email.split('@')[0] : 'temp';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${emailPart}-${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Max 10MB file size
});


// ==========================================
// 4. ROUTES
// ==========================================

// Helper Route
app.get('/', (req, res) => {
    res.json({ message: "CityJobLink Backend is Live!" });
});

// REGISTER ROUTE (Seeker & Employer)
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

        await client.query('BEGIN'); // Start Transaction

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

        // Insert Profile Data
        if (role === 'Seeker') {
            const monthMap = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06', Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' };
            const bdayString = `${bdayYear}-${monthMap[bdayMonth] || '01'}-${bdayDay}`;

            await client.query(`
                INSERT INTO clients (users_id, first_name, middle_name, last_name, suffix, date_of_birth, sex, qcitizen_id, contact_number, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            `, [newUserId, firstName, middleName, lastName, suffix, bdayString, gender, qcId, contactNumber]);

        } else if (role === 'Employer') {
            // ✅ CORRECTION: Inayos ang INSERT query para kasama ang ADDRESS, CONTACT_NUMBER, WEBSITE
            await client.query(`
                INSERT INTO companies (
                    users_id, company_name, email_address, 
                    contact_number, website, address, created_at, updated_at
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            `, [
                newUserId, 
                companyName, 
                email, 
                contactNumber,       
                companyWebsite,      
                companyAddress       
            ]);
        }

        await client.query('COMMIT'); // Commit Transaction
        console.log("✅ User Registered Successfully");

        // Send Email 
        const mailOptions = {
            from: `"CityJobLink" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verification OTP',
            html: `<h3>Your Verification Code is: <b>${otp}</b></h3><p>This code expires in 5 minutes.</p>`
        };
        transporter.sendMail(mailOptions).catch(err => console.error("⚠️ Email Error (Check .env):", err.message));

        res.json({ status: "success", message: "Registration successful! OTP Sent." });

    } catch (err) {
        await client.query('ROLLBACK'); // Rollback Transaction if error occurs
        console.error("❌ REGISTER ERROR:", err.message);
        res.status(500).json({ status: "error", message: "Server Error: " + err.message });
    } finally {
        client.release(); // Release the client connection
    }
});


// 🚀 NEW ROUTE: HANDLE RESUME UPLOAD 🚀
app.post('/api/upload/resume', upload.single('resumeFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No file uploaded.' });
        }

        // Tiyakin na kasama ang 'email' sa FormData mula sa frontend
        const { email } = req.body; 
        
        // 1. I-save ang file path sa 'clients' table
        const clientUpdate = await pool.query(
            // Dapat tama ang 'resume_path' column name sa database!
            `UPDATE clients SET resume_path = $1 
             WHERE users_id = (SELECT id FROM users WHERE email = $2)
             RETURNING users_id`, 
            [req.file.path, email]
        );

        if (clientUpdate.rowCount === 0) {
             // Kung hindi makita ang user, burahin ang file (cleanup)
             fs.unlinkSync(req.file.path); 
             return res.status(404).json({ status: 'error', message: 'User not found or not a Seeker.' });
        }
        
        // 2. Ibalik ang path sa frontend (para alam nito kung saan hahanapin ang file)
        res.json({ 
            status: 'success', 
            message: 'Resume uploaded and path saved!', 
            filePath: req.file.path // Ex: uploads/email-123456-resume.pdf
        });

    } catch (err) {
        // Kung may error, burahin ang file kung na-save
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("❌ UPLOAD ERROR:", err.message);
        res.status(500).json({ status: "error", message: "Server Error: " + err.message });
    }
});


// LOGIN ROUTE
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. KUNIN ANG USER MULA SA DATABASE
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        const user = result.rows[0]; 

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) return res.status(401).json({ status: "error", message: "Incorrect password" });
        if (!user.is_verified) return res.status(403).json({ status: "error", message: "Please verify email first" });

        // 2. PROFILE DATA RETRIEVAL (Fixes "Not provided" issue)
        let profileData = {};
        let displayName = user.username;

        if (user.role === 'Seeker') {
            const p = await pool.query(
                // ✅ DAPAT KASAMA ANG resume_path DITO
                "SELECT first_name, middle_name, last_name, suffix, date_of_birth, sex, qcitizen_id, contact_number, resume_path FROM clients WHERE users_id = $1", 
                [user.id]
            );
            if (p.rows.length) {
                const client = p.rows[0];
                displayName = client.first_name;
                profileData = {
                    fullName: `${client.first_name} ${client.middle_name ? client.middle_name + ' ' : ''}${client.last_name}`,
                    qcId: client.qcitizen_id || 'N/A',
                    birthday: client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'Not provided', 
                    gender: client.sex || 'Not specified',
                    contactNumber: client.contact_number || 'Not provided',
                    resumePath: client.resume_path, // ✅ Resume Path added to user object
                };
            }
        } else if (user.role === 'Employer') {
            const p = await pool.query(
                "SELECT company_name, contact_number, website, address FROM companies WHERE users_id = $1", 
                [user.id]
            );
            if (p.rows.length) {
                const company = p.rows[0];
                displayName = company.company_name;
                profileData = {
                    companyName: company.company_name,
                    contactNumber: company.contact_number || 'Not provided',
                    website: company.website || 'Not provided',
                    address: company.address || 'Not provided', 
                };
            }
        }

        // 3. RETURN RESPONSE
        res.json({ 
            status: "success", 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role, 
                name: displayName, 
                ...profileData,
                isVerified: user.is_verified,
            } 
        });

    } catch (err) {
        console.error("❌ LOGIN ERROR:", err.message);
        res.status(500).json({ status: "error", message: "Server Error: " + err.message });
    }
});

// VERIFY OTP ROUTE
app.post('/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

        const user = result.rows[0];
        if (user.otp_secret !== otp) return res.status(400).json({ error: "Invalid OTP" });
        
        // Optional: Check if OTP is expired
        if (user.otp_expiry && new Date() > new Date(user.otp_expiry)) {
             return res.status(400).json({ error: "OTP has expired" });
        }


        await pool.query("UPDATE users SET is_verified = TRUE, otp_secret = NULL, otp_expiry = NULL, status = 'active' WHERE id = $1", [user.id]);
        res.json({ status: "success", message: "Verified! You can now log in." });
    } catch (err) {
        console.error("VERIFICATION ERROR:", err.message);
        res.status(500).json({ error: "Verification Error" });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});