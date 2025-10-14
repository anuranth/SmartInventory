// index.js
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = 5000;

app.use(cors());
app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.send("Smart Inventory API (Prisma + SQLite) is running!");
});

// List items
app.get("/api/items", async (req, res) => {
  try {
    const items = await prisma.item.findMany({ orderBy: { id: "desc" } });
    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Add item
app.post("/api/items", async (req, res) => {
  try {
    const { name, quantity, price } = req.body;
    if (!name || quantity == null || price == null) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newItem = await prisma.item.create({
      data: { name, quantity: Number(quantity), price: Number(price) },
    });
    res.json(newItem);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

// Delete item
app.delete("/api/items/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.item.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Item not found" });
    await prisma.item.delete({ where: { id } });
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// Update item (partial update) - e.g., change quantity/price/name
app.put("/api/items/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, quantity, price } = req.body;
    const existing = await prisma.item.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Item not found" });

    const updated = await prisma.item.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(quantity !== undefined ? { quantity: Number(quantity) } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
      },
    });
    res.json(updated);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

/*
  POST /api/sell
  Body: { items: [{ id, qty }] }
  Performs a transactional decrement of stock; returns sale summary or error when insufficient stock.
*/
app.post("/api/sell", async (req, res) => {
  const saleItems = req.body.items;
  if (!Array.isArray(saleItems) || saleItems.length === 0) {
    return res.status(400).json({ error: "items array required" });
  }

  try {
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedItems = [];

      for (const it of saleItems) {
        const id = Number(it.id);
        const qtyToSell = Number(it.qty);
        if (!id || qtyToSell <= 0) {
          throw new Error("Invalid item id or qty");
        }

        const item = await tx.item.findUnique({ where: { id } });
        if (!item) throw new Error(`Item ${id} not found`);
        if (item.quantity < qtyToSell) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }

        const newQty = item.quantity - qtyToSell;
        const updated = await tx.item.update({
          where: { id },
          data: { quantity: newQty },
        });

        updatedItems.push({
          id: updated.id,
          name: updated.name,
          soldQty: qtyToSell,
          remainingQty: newQty,
          unitPrice: item.price,
          total: qtyToSell * item.price,
        });
      }

      return updatedItems;
    });

    // result contains array of updated items with sale details
    res.json({ success: true, sold: result, totalAmount: result.reduce((s, r) => s + r.total, 0) });
  } catch (err) {
    console.error("Error processing sale:", err);
    // If error message from thrown Error use it, else generic
    res.status(400).json({ error: err.message || "Failed to process sale" });
  }
});

// Start
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
