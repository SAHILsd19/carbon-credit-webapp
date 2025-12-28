import express from "express";
import Credit from "../models/CarbonCredit.js";

const router = express.Router();

// Get credits listed by vendor
router.get("/:email", async(req, res) => {
    try {
        const credits = await Credit.find({ sellerEmail: req.params.email })
            .sort({ createdAt: -1 });

        res.json(credits);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;