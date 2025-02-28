const express = require("express");
const router = express.Router();
const { getSeller,deleteSeller,updateSeller,registerSeller } = require("../controllers/sellerController"); // Ensure this is correctly imported

router.get("/getseller/:id", getSeller);
router.delete("/deleteSeller/:id", deleteSeller); // Ensure this function is defined in sellerController.js
router.put("/updateSeller/:id", updateSeller);
router.post("/registerSeller", registerSeller);


module.exports = router; // Export the router
