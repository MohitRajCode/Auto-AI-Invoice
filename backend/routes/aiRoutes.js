const express = require("express");
const router = express.Router();
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const { generateInvoice } = require("../controllers/aiController");

// Protect route
router.post("/generate", ClerkExpressRequireAuth(), generateInvoice);

module.exports = router;
