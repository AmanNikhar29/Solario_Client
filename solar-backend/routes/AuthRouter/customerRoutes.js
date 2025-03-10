const express = require("express");
const router = express.Router();
const { getCustomer, deleteCustomer, updateCustomer, registerCustomer } = require('../../controllers/Auth/customerController');
const { loginCustomer } = require('../../controllers/Auth/CustomerLogin')



router.post("/registerCustomer", registerCustomer);

// Other routes
router.get("/getCustomer/:id", getCustomer);
router.delete("/deleteCustomer/:id", deleteCustomer);
router.put("/updateCustomer/:id", updateCustomer);
router.post("/login-Customer", loginCustomer);

module.exports = router;