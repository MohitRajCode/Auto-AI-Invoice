// routes/invoiceRouter.js
import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoiceController.js";

import { clerkMiddleware } from "@clerk/express";

const invoiceRouter = express.Router();

// 🔐 Clerk automatically injects req.auth.userId
invoiceRouter.use(clerkMiddleware());

// All routes protected
invoiceRouter.get("/", getInvoices);
invoiceRouter.get("/:id", getInvoiceById);
invoiceRouter.post("/", createInvoice);
invoiceRouter.put("/:id", updateInvoice);
invoiceRouter.delete("/:id", deleteInvoice);

export default invoiceRouter;
