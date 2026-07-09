import mongoose from "mongoose";

const uri = 'mongodb+srv://kumarmohit58560_db_user:invoice123@invoice.xuzvfpd.mongodb.net/?appName=invoice';

console.log("Attempting to connect to MongoDB...");
mongoose.connect(uri)
    .then(() => {
        console.log("✅ DB Connected Successfully!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ DB Connection Error:");
        console.error(err);
        process.exit(1);
    });
