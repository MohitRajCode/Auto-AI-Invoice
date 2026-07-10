import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { clerkMiddleware } from "@clerk/express";
import businessProfileRouter from './routes/businessProfileRouter.js';
import invoiceRouter from './routes/invoiceRouter.js';
import aiInvoiceRouter from './routes/aiInvoiceRouter.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Allow both localhost (dev) and Render (prod) origins
// Allow multiple frontend URLs from Render environment variable
const allowedOrigins = [
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map(origin => origin.trim())
    : []),
  "https://auto-ai-invoice-1.onrender.com/3",
  "https://auto-ai-invoice.vercel.app/",
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Clerk middleware
app.use(clerkMiddleware());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Database Connection
connectDB();

// Static uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API Routes
app.use("/api/businessProfile", businessProfileRouter);
app.use("/api/invoice", invoiceRouter);
app.use("/api/ai", aiInvoiceRouter);

// ─── Serve Vite built frontend (production) ─────────────────────────────────
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
    // Serve static assets (JS, CSS, images)
    app.use(express.static(frontendDist));

    // SPA fallback — send index.html for any non-API route
   app.use((req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
});

    console.log('Serving frontend from:', frontendDist);
} else {
    // Dev-only health check
    app.get('/', (req, res) => {
        res.send('API Working with Clerk Auth (frontend not built)');
    });
}

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`);
});
