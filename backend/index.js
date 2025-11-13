// const jwt = require("jsonwebtoken");
import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const app = express();
const prisma = new PrismaClient();
const port = 5000;

app.use(cors());
app.use(express.json());

const JWT_Token = process.env.JWT_SECRET_TOKEN;

// Root route
app.get("/", (req, res) => {
  res.send("✅ Smart Inventory API (Prisma + SQLite) is running!");
});

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
    const { product_name, expiry_date, categoryId, price } = req.body;

    if (!product_name || !expiry_date || !categoryId || !price) {
      return res.status(400).json({
        error: "product_name, expiry_date, and categoryId are required",
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        product_name,
        expiry_date: new Date(expiry_date),
        categoryId: Number(categoryId),
        price: Number(price),
      },
    });

    res.json(newProduct);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.post("/api/sales", async (req, res) => {
  console.log("sales endpoint");
  try {
    const { product_name, quantity, date, price } = req.body;
    console.log(product_name, date, quantity);

    if (!product_name || !date || !quantity || !price) {
      return res.status(400).json({
        error: "product_name, expiry_date, and categoryId are required",
      });
    }

    const newSale = await prisma.sales.create({
      data: {
        date: new Date(date),
        productId: product_name,
        quantity: Number(quantity),
        price: Number(price),
      },
    });

    res.status(200).json(newSale);

  } catch (err) {
    console.error("Error adding product:", err);
    console.log("Error")
    res.status(500).json({ error: "Failed to add Sales" });
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

import categoryRoutes from "./routes/category.js";
app.use("/api/categories", categoryRoutes);

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
      return res
        .status(400)
        .json({ error: "Valid productId and quantity required" });
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
    if (!category_name)
      return res.status(400).json({ error: "category_name required" });

    const newCat = await prisma.category.create({
      data: { category_name },
    });

    res.json(newCat);
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "Failed to add category" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username & password required" });

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user)
    return res.status(401).json({ error: "Invalid username or password" });

  // Compare hashed password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch)
    return res.status(401).json({ error: "Invalid username or password" });

  const token = jwt.sign({ username, role: user.role }, JWT_Token, {
    expiresIn: "1h",
  });
  console.log(token);

  return res.json({
    token,
    username,
    role: user.role,
    user_id: user.user_id,
    username: user.username,
  });
});

app.get("/api/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.json({ valid: false });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_Token, (err, decoded) => {
    if (err) return res.json({ valid: false });
    res.json({ valid: true, user: decoded });
  });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
