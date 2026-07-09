import mongoose from "mongoose";
import dotenv from "dotenv";
import Invoice from "../models/invoiceModel.js";

dotenv.config();

// Direct shard URI from .env
const uri = process.env.MONGO_URI;

const mockInvoiceData = {
  invoiceNumber: "",
  issueDate: "",
  dueDate: "",
  fromBusinessName: "",
  fromEmail: "",
  fromAddress: "",
  fromPhone: "",
  client: {
    name: "Mohit",
    email: "",
    address: "",
    phone: ""
  },
  items: [
    {
      id: "1",
      description: "apple",
      qty: 1,
      unitPrice: 1
    }
  ],
  taxPercent: 18,
  notes: ""
};

async function testInsert() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(uri);
    console.log("Connected!");

    const body = mockInvoiceData;
    const items = body.items;
    const taxPercent = Number(body.taxPercent ?? 18);

    // Compute totals (like invoiceController.js computeTotals)
    const subtotal = items.reduce((s, it) => s + (Number(it.qty || 0) * Number(it.unitPrice || 0)), 0);
    const tax = (subtotal * taxPercent) / 100;
    const total = subtotal + tax;

    const doc = new Invoice({
      _id: new mongoose.Types.ObjectId(),
      owner: "user_test123", // Dummy Clerk owner ID
      invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
      issueDate: body.issueDate || new Date().toISOString().slice(0, 10),
      dueDate: body.dueDate || "",
      fromBusinessName: body.fromBusinessName || "",
      fromEmail: body.fromEmail || "",
      fromAddress: body.fromAddress || "",
      fromPhone: body.fromPhone || "",
      client: body.client || {},
      items,
      subtotal,
      tax,
      total,
      currency: "INR",
      status: "draft",
      taxPercent,
      notes: body.notes || "",
    });

    console.log("Saving document...");
    const saved = await doc.save();
    console.log("SAVE SUCCESS!", saved);
  } catch (err) {
    console.error("SAVE FAILED:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testInsert();
