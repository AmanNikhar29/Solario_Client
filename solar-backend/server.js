require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const customerRoutes = require('./routes/AuthRouter/customerRoutes');
const customerLogin = require('./routes/AuthRouter/CustomerLogin');
const forgotPasswordRoutes = require('./routes/AuthRouter/ForgotPassRoutes')
const db = require('./config/db'); 
const app = express();
const auth = require('./routes/AuthRouter/GoogleRT');
const Order = require('./routes/AuthRouter/Ord');
const report = require('./routes/AuthRouter/Repo');
const Update = require('./routes/AuthRouter/Up');
const SendReport = require('./routes/AuthRouter/Send/ReSend');


const cartRouter = require('./routes/AuthRouter/CartRouter');

// Add this with your other routes

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Test database connection
db.getConnection()
  .then((connection) => {
    console.log('Database connected successfully!');
    connection.release(); // Release the connection
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

  app.use('/api', customerRoutes);
app.use('/api/register', customerRoutes);
app.use('/api/login', customerRoutes);
app.use('/api/forgotPassword',forgotPasswordRoutes);
app.use('/api/login',auth);
app.use('/api/cart', cartRouter);
app.use('/api/report',report);
app.use('/api/Order',Order)
app.use('/api/sendReport',SendReport);
app.use('/api/update',Update)

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
