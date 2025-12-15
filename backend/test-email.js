const nodemailer = require('nodemailer');

// 👇 AYOS NA ITO (May quotes na)
const YOUR_EMAIL = 'cityjoblink.direct@gmail.com'; 
const YOUR_APP_PASSWORD = 'vveqjqeilknzvocm'; // Walang spaces

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: YOUR_EMAIL,
    pass: YOUR_APP_PASSWORD,
  },
});

async function sendTestEmail() {
  console.log("⏳ Testing Email Sending...");
  console.log(`FROM: ${YOUR_EMAIL}`);
  
  try {
    const info = await transporter.sendMail({
      from: `"Test Script" <${YOUR_EMAIL}>`,
      to: YOUR_EMAIL, // Send sa sarili mo
      subject: "Test Email from Node.js",
      text: "Kung nababasa mo ito, GUMAGANA ang email credentials mo!",
    });

    console.log("✅ SUCCESS! Email sent: " + info.response);
  } catch (error) {
    console.error("❌ FAILED! Error details:");
    console.error(error);
  }
}

sendTestEmail();