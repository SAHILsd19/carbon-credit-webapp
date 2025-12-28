import mongoose from "mongoose";

const ccrSchema = new mongoose.Schema({
    creditId: { type: mongoose.Schema.Types.ObjectId, ref: "CarbonCredit", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    quantity: { type: Number, required: true }, // tons purchased
    pricePerTon: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    transactionHash: { type: String }, // will be used later for blockchain
    status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "COMPLETED" },

    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("CCR", ccrSchema);