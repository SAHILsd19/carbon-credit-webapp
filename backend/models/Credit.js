import mongoose from "mongoose";

const CreditSchema = new mongoose.Schema({
    seller: String,
    sellerEmail: String,
    name: String,
    year: Number,
    available: Number,
    price: Number,
    sold: { type: Boolean, default: false },
    tokenId: { type: Number, default: null },
    minted: { type: Boolean, default: false }
});

export default mongoose.model("Credit", CreditSchema);