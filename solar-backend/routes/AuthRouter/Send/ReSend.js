const express = require('express');
const router = express.Router();
const { sendRequirementReport } = require('../../../controllers/Auth/Send/ReportSend');

// Updated to standard API path convention
router.post('/send-requirement-report', sendRequirementReport);

module.exports = router;