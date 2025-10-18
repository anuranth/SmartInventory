// index.js
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = 5000;

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("✅ Smart Inventory API (Prisma + SQLite) is running!");
});

//
// 📦 Get all products (with category + stock info)
//
app.get("/api/products", async (req, res) => {
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

//
// ➕ Add new product
//
app.post("/api/products", async (req, res) => {
  try {
    const { product_name, expiry_date, categoryId } = req.body;

    if (!product_name || !expiry_date || !categoryId) {
      return res
        .status(400)
        .json({ error: "product_name, expiry_date, and categoryId are required" });
    }

    const newProduct = await prisma.product.create({
      data: {
        product_name,
        expiry_date: new Date(expiry_date),
        categoryId: Number(categoryId),
      },
    });

    res.json(newProduct);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

//
// 🗑️ Delete a product
//
app.delete("/api/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.product.findUnique({
      where: { product_id: id },
    });

    if (!existing) return res.status(404).json({ error: "Product not found" });

    await prisma.product.delete({ where: { product_id: id } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

//
// ✏️ Update product details
//
app.put("/api/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { product_name, expiry_date, categoryId } = req.body;

    const existing = await prisma.product.findUnique({
      where: { product_id: id },
    });
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const updated = await prisma.product.update({
      where: { product_id: id },
      data: {
        ...(product_name && { product_name }),
        ...(expiry_date && { expiry_date: new Date(expiry_date) }),
        ...(categoryId && { categoryId: Number(categoryId) }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

//
// 🧾 Add stock entry (for a product)
//
app.post("/api/stock", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Valid productId and quantity required" });
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

//
// 🏷️ Get all categories
//
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { category_id: "asc" },
    });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

//
// ➕ Add a category
//
app.post("/api/categories", async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name) return res.status(400).json({ error: "category_name required" });

    const newCat = await prisma.category.create({
      data: { category_name },
    });

    res.json(newCat);
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "Failed to add category" });
  }
});

//
// 🚀 Start the server
//
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
