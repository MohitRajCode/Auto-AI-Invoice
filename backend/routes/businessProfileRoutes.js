const express = require("express");
const router = express.Router();
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const { getProfile, updateProfile } = require("../controllers/businessProfileController");

// All routes are protected
router.use(ClerkExpressRequireAuth());

router.get("/me", getProfile);
router.post("/", updateProfile); // Matches standard POST for creation/update or we can do PUT
// Frontend calls? 
// Frontend `CreateInvoice.jsx` calls GET /api/businessProfile/me
// I haven't seen the `BusinessProfile` frontend page code but likely it POSTs or PUTs to /api/businessProfile
// I'll support POST to root as generic "update/create"

module.exports = router;
