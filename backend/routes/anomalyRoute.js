import express from "express";
import { spawn } from "child_process";

const router = express.Router();

router.post("/detect", (req, res) => {
    console.log("📥 Request received at /api/anomaly/detect");
    console.log("➡ Payload:", req.body);

    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    const py = spawn(pythonCmd, ["./ml/anomaly_predict.py"]);

    let output = "";
    let errorLog = "";

    // Send JSON payload to Python
    py.stdin.write(JSON.stringify(req.body));
    py.stdin.end();

    // Collect model output
    py.stdout.on("data", (d) => (output += d.toString()));

    // Filter harmless ML warnings
    py.stderr.on("data", (d) => {
        const text = d.toString();

        const ignoreList = [
            "oneDNN",
            "TensorFlow",
            "CPU instructions",
            "UserWarning",
            "DeprecationWarning",
            "FutureWarning"
        ];

        if (ignoreList.some((msg) => text.includes(msg))) {
            console.log("⚠ Ignored ML warning:", text.trim());
            return;
        }

        errorLog += text;
    });

    // Handle process close
    py.on("close", () => {
        if (errorLog) {
            console.error("🐍 Python REAL error:", errorLog);
            return res.status(500).json({ pythonError: errorLog });
        }

        try {
            console.log("📤 Python OUTPUT:", output);
            return res.json(JSON.parse(output));
        } catch (e) {
            console.error("❌ JSON Parse Error — raw output from Python:", output);
            return res.status(500).json({
                error: "Invalid JSON returned from Python ML script",
                raw: output
            });
        }
    });

    // Handle spawn failure
    py.on("error", (err) => {
        console.error("❌ Python spawn failed:", err);
        return res.status(500).json({ spawnError: err.message });
    });
});

export default router;