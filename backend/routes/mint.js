router.post("/mint", async(req, res) => {
    try {
        const { creditId, name, price, totalTons, sellerEmail } = req.body;

        const tx = await contract.mintCredit(
            totalTons,
            price,
            Math.floor(Date.now() / 1000) + 31536000,
            sellerEmail,
            `https://carbonmeta.io/metadata/${creditId}.json`
        );
        const receipt = await tx.wait();

        const event = receipt.logs
            .map(l => contract.interface.parseLog(l))
            .find(e => e.name === "TokenMinted");

        const tokenId = Number(event.args[0]);

        await Credit.findByIdAndUpdate(creditId, {
            tokenId,
            totalTons,
            availableTons: totalTons,
            price
        });

        res.json({ success: true, tokenId });
    } catch (err) {
        res.status(500).json({ error: "Minting error", details: err.message });
    }
});