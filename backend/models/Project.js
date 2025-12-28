// backend/models/Project.js
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true }, // EcoForest Solutions
    vendorType: { type: String, required: true }, // Verified Vendor / Gold Standard etc
    category: { type: String, required: true }, // Reforestation, Renewable Energy, etc
    standard: { type: String, required: true }, // Verra, CAR, etc
    description: { type: String, required: true },
    vintageYear: { type: Number, required: true },
    availableTons: { type: Number, required: true },
    pricePerTon: { type: Number, required: true },
    location: { type: String, default: "Global" }
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);