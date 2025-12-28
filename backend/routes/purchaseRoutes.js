import express from "express";
import Credit from "../models/Credit.js";
import Purchase from "../models/Purchase.js";
import generateInvoice from "../utils/generateInvoice.js";
import sendInvoiceEmail from "../utils/sendInvoiceEmail.js";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../blockchain/contractConfig.js";
import dotenv from "dotenv";
dotenv.config();
console.log("PRIVATE KEY VALUE:", process.env.WALLET_PRIVATE_KEY);
const key = process.env.WALLET_PRIVATE_KEY;
console.log("LENGTH:", key ? key.length : 0);

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

const router = express.Router();

/* 🟢 COMPANY PURCHASE HISTORY */
router.get("/history/company/:email", async(req, res) => {
    try {
        const purchases = await Purchase.find({ buyerEmail: req.params.email });
        res.json(purchases);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

/* 🟢 VENDOR SOLD HISTORY */
router.get("/history/sold/:email", async(req, res) => {
    try {
        const purchases = await Purchase.find({ sellerEmail: req.params.email });
        res.json(purchases);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
router.post("/prepare", async(req, res) => {
    const { creditId } = req.body;
    const credit = await Credit.findById(creditId);
    if (!credit) return res.json({ success: false, message: "Invalid credit" });

    res.json({
        success: true,
        tons: credit.available,
        price: credit.price,
        totalAmount: credit.price * credit.available
    });
});


/* 🟢 BUY — MINT NFT — INVOICE — SAVE TO DB */
router.post("/", async(req, res) => {
    try {
        const { creditId, buyerName, buyerEmail, transactionHash, tons } = req.body;
        const credit = await Credit.findById(creditId);
        if (!credit) return res.status(404).json({ success: false, message: "Credit not found" });

        const totalAmount = credit.price * tons;

        // 🧾 Generate invoice PDF
        const pdfPath = await generateInvoice({
            creditName: credit.name,
            buyerName,
            buyerEmail,
            sellerName: credit.seller,
            sellerEmail: credit.sellerEmail,
            year: credit.year,
            tons,
            price: credit.price,
            totalAmount,
            blockHash: transactionHash
        });

        // 💾 Save purchase to DB
        await Purchase.create({
            creditId,
            creditName: credit.name,
            sellerEmail: credit.sellerEmail,
            sellerName: credit.seller,
            buyerEmail,
            buyerName,
            year: credit.year,
            price: credit.price,
            tons,
            totalAmount,
            pdfPath,
            transactionHash,
            date: new Date()
        });

        // 🔄 Reduce available tons
        credit.available = credit.available - tons;
        if (credit.available <= 0) credit.sold = true;
        await credit.save();

        // 📧 Send invoice email — this was missing!
        await sendInvoiceEmail({
            to: buyerEmail,
            buyerName,
            pdfPath,
            totalAmount,
            creditName: credit.name,
            blockHash: transactionHash
        });

        res.json({ success: true, message: "Purchase stored & invoice emailed successfully" });

    } catch (err) {
        console.log("Purchase Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



router.get("/history/user/:email", async(req, res) => {
    try {
        const email = req.params.email;

        const purchases = await Purchase.find({ buyerEmail: email }).sort({ date: -1 });

        return res.json(purchases);
    } catch (error) {
        console.error("Portfolio API Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;