const express = require('express');
const router = express.Router();
const {updateInventory} = require('../../controllers/Auth/Update')

router.post('/update',updateInventory);

module.exports = router;