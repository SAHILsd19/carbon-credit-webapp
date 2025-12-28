import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
    creditId: String,
    creditName: String,
    sellerEmail: String,
    sellerName: String,
    buyerEmail: String,
    buyerName: String,
    year: Number,
    price: Number,
    tons: Number,
    totalAmount: Number, // <-- added
    pdfPath: String, // <-- added
    date: Date
});

export default mongoose.model("Purchase", PurchaseSchema);