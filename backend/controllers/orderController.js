export const createOrder = async(req, res) => {
    try {
        const { buyer, project, quantity, total } = req.body;

        console.log("New Order:", req.body); // debug only

        return res.json({
            success: true,
            message: "Order recorded successfully",
            order: { buyer, project, quantity, total },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Order failed" });
    }
};