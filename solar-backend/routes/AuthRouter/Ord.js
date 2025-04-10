// orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/Auth/Order');

// Create new order and clear cart
router.post('/', orderController.createOrder);

module.exports = router;