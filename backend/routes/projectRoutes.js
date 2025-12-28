// backend/routes/projectRoutes.js
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// GET /api/projects  – list all projects
router.get("/", async(req, res) => {
    try {
        const projects = await Project.find({});
        res.json(projects);
    } catch (err) {
        console.error("Error fetching projects:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/projects/seed – insert sample data (run once)
router.post("/seed", async(req, res) => {
    try {
        await Project.deleteMany({}); // clear existing

        const sample = [{
                name: "EcoForest Solutions",
                vendorType: "Verified Vendor",
                category: "Reforestation",
                standard: "Verra",
                description: "Amazon Rainforest Conservation Project",
                vintageYear: 2023,
                availableTons: 5000,
                pricePerTon: 24.5,
                location: "Brazil"
            },
            {
                name: "WindPower Co",
                vendorType: "Gold Standard",
                category: "Renewable Energy",
                standard: "Gold Standard",
                description: "Offshore Wind Farm Initiative",
                vintageYear: 2024,
                availableTons: 8200,
                pricePerTon: 18.75,
                location: "Denmark"
            },
            {
                name: "CarbonTech Inc",
                vendorType: "CAR Certified",
                category: "Carbon Capture",
                standard: "CAR",
                description: "Direct Air Capture Facility",
                vintageYear: 2023,
                availableTons: 2500,
                pricePerTon: 89.0,
                location: "USA"
            },
            {
                name: "AgriCarbon Ltd",
                vendorType: "Verra Verified",
                category: "Agriculture",
                standard: "Verra",
                description: "Regenerative Agriculture Program",
                vintageYear: 2022,
                availableTons: 12000,
                pricePerTon: 15.25,
                location: "India"
            }
        ];

        const created = await Project.insertMany(sample);
        res.json({ message: "Seeded projects", count: created.length });
    } catch (err) {
        console.error("Error seeding projects:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;