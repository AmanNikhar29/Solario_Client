const express = require("express");
const router = express.Router();
const { getProduct,deleteProduct,updateProduct,AddProduct } = require("../controllers/Products/Products"); // Ensure this is correctly imported


router.get("/getProduct/:id", getProduct);
router.delete("/deleteProduct/:id", deleteProduct); // Ensure this function is defined in CustomerController.js
router.put("/updateProduct/:id", updateProduct);
router.post("/AddProduct", AddProduct);



module.exports = router; // Export the router
