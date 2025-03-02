const express = require("express");
const router = express.Router();

const { loginCustomer } = require('../controllers/CustomerLogin');

router.post('/login-customer', loginCustomer);

module.exports = router;


