import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema({
    email: { type: String, required: true }, // which company performed verification
    projectId: String,
    creditAmount: Number,
    cct: [Number],
    score: Number,
    confidence: Number,
    anomalyScore: Number,
    status: String,
    generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Verification", VerificationSchema);