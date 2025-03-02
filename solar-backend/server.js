 
const express = require('express');
const cors = require('cors');
const sellerRoutes = require('./routes/sellerRoutes');
const customerRoutes = require('./routes/customerRoutes');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', sellerRoutes);
app.use('/api', customerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/customer', customerRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
