import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import creditRoutes from "./routes/creditRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import events from "events";
import authRoutes from "./routes/authRoutes.js";
import vendorCredits from "./routes/vendorCredits.js";
import path from "path";
import verifyRoute from "./routes/VerifyRoute.js";
import anomalyRoute from "./routes/anomalyRoute.js";




events.EventEmitter.defaultMaxListeners = 20;

dotenv.config(); // <-- required

const app = express();
app.use(cors()); // <-- required
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/credits/vendor", vendorCredits);
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api", verifyRoute);
app.use("/api/anomaly", anomalyRoute);

mongoose
    .connect(process.env.MONGO_URI, { dbName: "carbon_market" })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("DB Error:", err));

app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));