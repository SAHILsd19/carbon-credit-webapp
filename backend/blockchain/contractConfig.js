import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Read ABI JSON safely
const abiPath = path.join(__dirname, "CarbonCreditToken.json");
const CarbonCreditABI = JSON.parse(fs.readFileSync(abiPath, "utf-8"));

export const CONTRACT_ABI = CarbonCreditABI.abi;
// ⬇️ put your deployed contract address here

export const CONTRACT_ADDRESS = "0x93cBe15AFB13d3c95F67A5e10D17475dFbc17A8B";