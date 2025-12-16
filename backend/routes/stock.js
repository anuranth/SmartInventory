import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// 📦 ADD Stock (Refill)
router.post("/", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Valid productId and positive quantity required" });
    }

    const product = await prisma.product.findUnique({
      where: { product_id: Number(productId) },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const newStock = await prisma.stock.create({
      data: {
        productId: Number(productId),
        quantity: Number(quantity),
        date: new Date(),
      },
    });

    res.json({
      message: `✅ Added ${quantity} units to ${product.product_name}`,
      stock: newStock,
    });
  } catch (err) {
    console.error("Error adding stock:", err);
    res.status(500).json({ error: "Failed to add stock" });
  }
});

export default router;