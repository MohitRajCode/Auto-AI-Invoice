require("dotenv").config();
const express = require("express");

const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const invoiceRoutes = require("./routes/invoiceRoutes");
const businessProfileRoutes = require("./routes/businessProfileRoutes");

connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
// Increased limit for Data URLs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/invoice", invoiceRoutes);
app.use("/api/businessProfile", businessProfileRoutes);
app.use("/api/ai", require("./routes/aiRoutes"));

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: err.message });
});

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
