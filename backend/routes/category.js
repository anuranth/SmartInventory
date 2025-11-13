// backend/routes/categoryRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// ✅ GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ✅ POST create new category
router.post("/", async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const category = await prisma.category.create({
      data: { category_name },
    });

    res.status(201).json(category);
  } catch (err) {
    if (err.code === "P2002") {
      res.status(400).json({ error: "Category already exists" });
    } else {
      console.error("Error creating category:", err);
      res.status(500).json({ error: "Failed to create category" });
    }
  }
});

export default router;
