import mongoose from "mongoose";

const creditSchema = new mongoose.Schema({
    seller: String,

    name: String,
    year: Number,
    available: Number,
    price: Number,
    sold: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("CarbonCredit", creditSchema);