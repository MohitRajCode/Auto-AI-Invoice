const express = require("express");
const router = express.Router();
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const {
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
} = require("../controllers/invoiceController");

// All routes are protected
router.use(ClerkExpressRequireAuth());

router.route("/")
    .get(getInvoices)
    .post(createInvoice);

router.route("/:id")
    .get(getInvoice)
    .put(updateInvoice)
    .delete(deleteInvoice);

module.exports = router;
