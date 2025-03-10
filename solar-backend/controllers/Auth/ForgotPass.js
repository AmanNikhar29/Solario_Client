const nodemailer = require('nodemailer'); // For sending emails
require('dotenv').config(); // Load environment variables
const db = require('../../config/db'); // Import the db module for database connection

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // Check if the email exists in the database
    const [user] = await db.execute('SELECT * FROM Customer WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'Email not found.' });
    }

    // Generate a 6-digit OTP
    const otp = generateOTP();

    // Save the OTP and its expiration time in the database
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    await db.execute(
      'UPDATE Customer SET otp = ?, otp_expiration = ? WHERE email = ?',
      [otp, otpExpiration, email]
    );

    // Send the OTP to the user's email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send OTP email.' });
      }
      res.json({ message: 'OTP sent successfully! Check your email.' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Verify OTP Controller
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  // Validate email and OTP
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  try {
    // Check if the OTP matches and is not expired
    const [user] = await db.execute(
      'SELECT * FROM Customer WHERE email = ? AND otp = ? AND otp_expiration > NOW()',
      [email, otp]
    );

    if (user.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // If OTP is valid, allow the user to reset their password
    res.json({ message: 'OTP verified successfully! You can now reset your password.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required." });
  }

  try {
    // Update the password in the database
    await db.execute(
      'UPDATE Customer SET password = ? WHERE email = ?',
      [newPassword, email]
    );

    res.json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
module.exports = { forgotPassword, verifyOTP, resetPassword };