const db = require('../../config/db');
const jwt = require('jsonwebtoken');


const googleLoginCustomer = async (req, res) => {
  try {
    const { email, name, google_id, image } = req.body;

    // Check if seller exists
    let [customer] = await db.query(
      'SELECT * FROM customer WHERE email = ?',
      [email]
    );

    if (customer.length === 0) {
      // Create new seller if doesn't exist
      const [result] = await db.query(
        'INSERT INTO customer (email, name, google_id, image) VALUES (?, ?, ?, ?)',
        [email, name, google_id, image, 1]
      );
      
      customer = await db.query(
        'SELECT * FROM customer WHERE id = ?',
        [result.insertId]
      );
    } else {
      // Update google_id if seller exists but logged in with Google for first time
      if (!customer[0].google_id) {
        await db.query(
          'UPDATE customer SET google_id = ? WHERE id = ?',
          [google_id, customer[0].id]
        );
      }
    }

    const customerData = customer[0];

    // Create JWT token
    const token = jwt.sign(
      { id: customerData.id, email: customerData.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove sensitive data before sending response
    delete customerData.password;
    delete customerData.google_id;

    res.json({
      message: 'Google login successful',
      token,
      customer: customerData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {googleLoginCustomer}