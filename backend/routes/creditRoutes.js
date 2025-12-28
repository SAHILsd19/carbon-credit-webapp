import express from "express";
import Credit from "../models/Credit.js";

const router = express.Router();
router.put("/saveToken/:id", async(req, res) => {
    try {
        await Credit.findByIdAndUpdate(req.params.id, {
            tokenId: req.body.tokenId,
            minted: true
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json(err);
    }
});







router.put("/updateToken/:id", async(req, res) => {
    try {
        const { tokenId } = req.body;
        await Credit.findByIdAndUpdate(req.params.id, {
            tokenId: tokenId,
            minted: true
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




/* =========================================================
   ➤ CREATE NEW CREDIT (Vendor Add)
   ========================================================= */
router.post("/", async(req, res) => {
    try {
        const { name, price, available, year, seller, sellerEmail } = req.body;

        const newCredit = new Credit({
            name,
            price: Number(price),
            available: Number(available),
            year: Number(year),
            seller,
            sellerEmail,
            sold: false // MUST BE BOOLEAN ✔
        });

        const saved = await newCredit.save();
        res.status(201).json(saved);
    } catch (error) {
        console.error("Error creating credit:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/* =========================================================
   ➤ GET ALL CREDITS (Marketplace – Company Side)
   ========================================================= */
router.get("/", async(req, res) => {
    try {
        const credits = await Credit.find().sort({ createdAt: -1 });
        res.json(credits);
    } catch (error) {
        console.error("Error fetching credits:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/* =========================================================
   ➤ GET CREDITS BY VENDOR EMAIL (Vendor Dashboard)
   ========================================================= */
router.get("/vendor/:email", async(req, res) => {
    try {
        const email = req.params.email;
        const credits = await Credit.find({ sellerEmail: email }).sort({ createdAt: -1 });
        res.json(credits);
    } catch (error) {
        console.error("Error fetching vendor credits:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/* =========================================================
   ➤ MARK SOLD (When full token purchased)
   ========================================================= */
router.put("/markSold/:id", async(req, res) => {
    try {
        const updated = await Credit.findByIdAndUpdate(
            req.params.id, { sold: true }, { new: true }
        );
        res.json(updated);
    } catch (error) {
        console.error("Error marking sold:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/* =========================================================
   ➤ DELETE CREDIT
   ========================================================= */
router.delete("/:id", async(req, res) => {
    try {
        await Credit.findByIdAndDelete(req.params.id);
        res.json({ message: "Credit removed" });
    } catch (error) {
        console.error("Error deleting credit:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;