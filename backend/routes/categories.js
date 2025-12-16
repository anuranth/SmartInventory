import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// 🏷️ GET categories
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { category_id: "asc" } });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ➕ ADD category
router.post("/", async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name) return res.status(400).json({ error: "Category name required" });

    const newCat = await prisma.category.create({
      data: { category_name },
    });

    res.json(newCat);
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "Failed to add category" });
  }
});

export default router;
