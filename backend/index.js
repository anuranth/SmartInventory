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

app.get("/api/sales", async (req, res) => {
  try {
    const sales = await prisma.sales.findMany({
      orderBy: { sale_id: "desc" },
      include: {
        product: {
          include: {
            category: true,
            stocks: true,
          },
        },
      },
    });

    res.json(sales);
  } catch (err) {
    console.error("Error fetching sales:", err);
    res.status(500).json({ error: "Failed to fetch sales" });
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
  console.log("\n=== /api/sales REQUEST RECEIVED ===");

  try {
    // Log incoming request body
    console.log("📩 Incoming Body:", req.body);

    const { productId, quantity, date, price } = req.body;

    if (!productId || !quantity || !date || !price) {
      console.log("❌ Missing fields");
      return res.status(400).json({
        error: "productId, quantity, date, and price are required",
      });
    }

    console.log("➡️ Validating product:", productId);

    // Fetch product + stock
    const product = await prisma.product.findUnique({
      where: { product_id: Number(productId) },
      include: { stocks: true },
    });

    console.log("📦 Product fetched:", product);

    if (!product) {
      console.log("❌ Product not found");
      return res.status(404).json({ error: "Product not found" });
    }

    const totalStock = product.stocks.reduce(
      (sum, entry) => sum + entry.quantity,
      0
    );

    console.log("📊 Total stock available:", totalStock);

    if (Number(quantity) > totalStock) {
      console.log("❌ Not enough stock");
      return res.status(400).json({
        error: `Not enough stock. Available: ${totalStock}`,
      });
    }

    console.log("📝 Recording sale with:", {
      productId: Number(productId),
      quantity: Number(quantity),
      date: new Date(date),
      price: Number(price),
    });

    // Create sale
    const newSale = await prisma.sales.create({
      data: {
        productId: Number(productId),
        quantity: Number(quantity),
        date: new Date(date),
        price: Number(price),
      },
    });

    console.log("✅ Sale created:", newSale);

    console.log("🔻 Deducting stock with:", {
      productId: Number(productId),
      quantity: -Number(quantity),
    });

    // Deduct stock
    const stockUpdate = await prisma.stock.create({
      data: {
        productId: Number(productId), // LOG WILL PROVE IF THIS IS WRONG FIELD NAME
        quantity: -Number(quantity),
        date: new Date(),
      },
    });

    console.log("📉 Stock deducted:", stockUpdate);

    res.json(newSale);
  } catch (err) {
    console.error("\n🔥 ERROR in /api/sales:", err);

    // Log Prisma errors clearly
    if (err.code) console.error("🔍 Prisma Error Code:", err.code);
    if (err.meta) console.error("📌 Prisma Error Meta:", err.meta);

    res.status(500).json({ error: "Failed to record sale" });
  }
});

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

// Signup route
app.post("/api/signup", async (req, res) => {
  console.log("signup");
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "username & password required",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Username already taken",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "admin",
      },
    });

    const token = jwt.sign(
      { username: newUser.username, role: newUser.role },
      JWT_Token,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Signup successful",
      token,
      user_id: newUser.user_id,
      username: newUser.username,
      role: newUser.role,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      error: "Failed to signup",
    });
  }
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
