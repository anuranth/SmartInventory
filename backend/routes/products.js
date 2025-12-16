import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// 📦 GET all products
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { product_id: "desc" },
      include: { category: true, stocks: true },
    });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ➕ ADD new product
router.post("/", async (req, res) => {
  try {
    const { product_name, expiry_date, categoryId, price } = req.body;

    if (!product_name || !categoryId || !price) {
      return res.status(400).json({
        error: "product_name, categoryId, and price are required",
      });
    }

    // Handle Expiry: If null/empty, default to a far future date (Non-perishable)
    // or use new Date() if you prefer. Ideally, change Schema to DateTime?
    const validExpiry = expiry_date ? new Date(expiry_date) : new Date("2099-12-31");

    const newProduct = await prisma.product.create({
      data: {
        product_name,
        expiry_date: validExpiry,
        price: Number(price),
        // FIX: Use 'connect' to link the category relation explicitly
        category: {
          connect: { category_id: Number(categoryId) }
        }
      },
    });

    res.json(newProduct);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// ✏️ UPDATE product
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { product_name, expiry_date, categoryId, price } = req.body;

    const existing = await prisma.product.findUnique({ where: { product_id: id } });
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const dataToUpdate = {
      ...(product_name && { product_name }),
      ...(expiry_date && { expiry_date: new Date(expiry_date) }),
      ...(price && { price: Number(price) }),
    };

    // Only add category connection if categoryId is provided
    if (categoryId) {
      dataToUpdate.category = {
        connect: { category_id: Number(categoryId) }
      };
    }

    const updated = await prisma.product.update({
      where: { product_id: id },
      data: dataToUpdate,
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 🗑️ DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.product.findUnique({ where: { product_id: id } });
    if (!existing) return res.status(404).json({ error: "Product not found" });

    // Transaction delete to clean up related data first
    await prisma.$transaction([
      prisma.stock.deleteMany({ where: { productId: id } }),
      prisma.sales.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { product_id: id } }),
    ]);

    res.json({ message: "Product and related data deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;