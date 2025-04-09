// routes/requirementsRouter.js
const express = require('express');
const router = express.Router();
const {submitRequirements} = require('../../controllers/Auth/Report');

router.post('/submit', submitRequirements);

module.exports = router;
