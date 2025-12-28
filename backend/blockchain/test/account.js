const { ethers } = require("hardhat");

describe("Print Wallet Address", function() {
    it("Should print the first signer address", async function() {
        const [signer] = await ethers.getSigners();
        console.log("Signer Address:", signer.address);
    });
});