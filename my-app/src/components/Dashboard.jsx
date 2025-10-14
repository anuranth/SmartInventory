import { useEffect, useState } from "react";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", price: "" });
  const [message, setMessage] = useState(null);

  const API = "http://localhost:5000/api/items";
  const SELL_API = "http://localhost:5000/api/sell";

  // Fetch existing items
  const fetchItems = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Add new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.quantity || !newItem.price) return;
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItem.name,
          quantity: Number(newItem.quantity),
          price: Number(newItem.price),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setItems([data, ...items]);
        setNewItem({ name: "", quantity: "", price: "" });
        setMessage({ type: "success", text: `Added ${data.name}` });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to add item" });
    }
  };

  // Sell item (reduce stock)
  const handleSell = async (item) => {
    if (!item.sellQty || item.sellQty <= 0) return alert("Enter quantity to sell");
    try {
      const res = await fetch(SELL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: item.id, qty: Number(item.sellQty) }]
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setItems(items.map((i) => (i.id === item.id ? { ...i, quantity: data.sold[0].remainingQty, sellQty: 0 } : i)));
        setMessage({ type: "success", text: `Sold ${item.sellQty} ${item.name}` });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to sell item" });
    }
  };
  

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Inventory Dashboard</h1>

      {/* ➕ Add Stock Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add / Restock Item</h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Item Name"
            className="border p-2 rounded"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            className="border p-2 rounded"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price"
            className="border p-2 rounded"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            required
          />
          <button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">Add Stock</button>
        </form>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 🧾 Stock Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Current Inventory</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Sell</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{item.id}</td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">₹{item.price}</td>
                <td className="p-3 flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={item.quantity}
                    placeholder="Qty"
                    value={item.sellQty || ""}
                    onChange={(e) =>
                      setItems(items.map((i) =>
                        i.id === item.id ? { ...i, sellQty: e.target.value } : i
                      ))
                    }
                    className="border p-1 w-20 rounded"
                  />
                  <button
                    className="bg-green-600 text-white px-2 rounded hover:bg-green-700"
                    onClick={() => handleSell(item)}
                    disabled={item.quantity <= 0}
                  >
                    Sell
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
