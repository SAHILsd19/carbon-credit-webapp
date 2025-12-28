import express from "express";
import Verification from "../models/Verification.js";

const router = express.Router();

router.post("/verify-cct", async(req, res) => {
    try {
        const { email, projectId, creditAmount, cct, period } = req.body;

        // ⛔ email required
        if (!email) {
            return res.status(400).json({ success: false, message: "Email missing" });
        }

        const arr = cct.map(Number);
        if (!arr || arr.length < 2) {
            return res.status(400).json({ success: false, message: "Not enough CCT values" });
        }

        // 📌 Statistical scoring logic (no ML)
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const std = Math.sqrt(arr.map(x => (x - mean) ** 2).reduce((a, b) => a + b) / arr.length);
        const spike = Math.max(...arr) - Math.min(...arr);

        let score = 100 - (std * 2 + spike * 1.5);
        score = Math.max(0, Math.min(100, Math.round(score)));

        const confidence = Math.round(score * 0.9);
        const status = score >= 65 ? "Verified" : "Rejected";
        const anomalyScore = Number((1 - score / 100).toFixed(4));

        const result = {
            email,
            score,
            confidence,
            anomalyScore,
            status,
            projectId,
            creditAmount,
            period,
            generatedAt: new Date(),
        };

        // 💾 Save to DB
        const record = await Verification.create({
            email,
            score,
            confidence,
            anomalyScore,
            status,
            projectId,
            creditAmount,
            rawCCT: arr,
            period,
            generatedAt: new Date(),
        });

        return res.json({ success: true, result, record });

    } catch (err) {
        console.error("VerifyRoute Error:", err);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
});

export default router;