const express = require('express');
const router = express.Router();
const {googleLoginCustomer} = require('../../controllers/Auth/GoogleAuth')



router.post('/google-login-Customer',googleLoginCustomer);

module.exports = router;