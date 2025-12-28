import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", async(req, res) => {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.json({ success: false, message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });

    res.json({
        success: true,
        message: "Signup successful",
        user: { name: user.name, email: user.email, role: user.role },
    });
});

export default router;