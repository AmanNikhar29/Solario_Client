const express = require("express");
const router = express.Router();
const { getCustomer,deleteCustomer,updateCustomer,registerCustomer } = require("../controllers/customerController"); // Ensure this is correctly imported
const {loginCustomer} = require("../controllers/CustomerLogin");

router.get("/getCustomer/:id", getCustomer);
router.delete("/deleteCustomer/:id", deleteCustomer); // Ensure this function is defined in CustomerController.js
router.put("/updateCustomer/:id", updateCustomer);
router.post("/registerCustomer", registerCustomer);
router.post("/login-Customer",loginCustomer);


module.exports = router; // Export the router
