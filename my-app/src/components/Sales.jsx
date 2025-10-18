import { useEffect, useState } from "react";
import jsPDF from "jspdf";

const API = "http://localhost:5000/api/items";
const SELL_API = "http://localhost:5000/api/sell";

export default function Sales() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchItems = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addToCart = (item, qty = 1) => {
    if (qty <= 0) return;
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + qty} : c));
    } else {
      setCart([...cart, { id: item.id, name: item.name, qty, price: item.price }]);
    }
  };

  const updateCartQty = (id, qty) => {
    if (qty <= 0) {
      setCart(cart.filter(c => c.id !== id));
    } else {
      setCart(cart.map(c => c.id === id ? {...c, qty} : c));
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(c => c.id !== id));
  const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

  // --- Generate PDF ---
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Smart Inventory Bill", 14, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 28);

    let y = 40;
    doc.text("Items:", 14, y);
    y += 6;

    cart.forEach((c, idx) => {
      doc.text(
        `${idx+1}. ${c.name} - ${c.qty} × ₹${c.price} = ₹${(c.qty*c.price).toLocaleString()}`,
        14,
        y
      );
      y += 6;
    });

    doc.text(`Total: ₹${total.toLocaleString()}`, 14, y + 6);
    doc.save(`Bill_${new Date().getTime()}.pdf`);
  };

  const checkout = async () => {
    if (cart.length === 0) return setMessage({ type:"error", text:"Cart is empty" });
    setLoading(true);
    setMessage(null);
    try {
      const body = { items: cart.map(c => ({ id: c.id, qty: c.qty })) };
      const res = await fetch(SELL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sale failed");

      setCart([]);
      setMessage({ type: "success", text: `Sale completed. Total ₹${data.totalAmount.toLocaleString()}` });
      fetchItems(); // refresh stock

      // Generate PDF bill
      generatePDF();

    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Checkout failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sales / Billing</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Items */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Available Items</h2>
          <div className="space-y-3 max-h-80 overflow-auto">
            {items.length === 0 ? <p className="text-gray-500">No items</p> :
              items.map(item => (
                <div key={item.id} className="flex items-center justify-between border p-2 rounded">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">Stock: {item.quantity} — ₹{item.price.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToCart(item, 1)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      disabled={item.quantity <= 0}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Right: Cart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Cart</h2>

          {cart.length === 0 ? <p className="text-gray-500">Cart is empty</p> : (
            <div className="space-y-2">
              {cart.map(c => (
                <div key={c.id} className="flex items-center justify-between border p-2 rounded">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-gray-500">₹{c.price.toLocaleString()} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={c.qty}
                      min={1}
                      className="w-20 border rounded p-1"
                      onChange={(e) => updateCartQty(c.id, Number(e.target.value))}
                    />
                    <div className="w-28 text-right font-semibold">₹{(c.qty * c.price).toLocaleString()}</div>
                    <button onClick={() => removeFromCart(c.id)} className="text-red-600">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t pt-3 flex justify-between items-center">
            <div className="text-lg font-bold">Total: ₹{total.toLocaleString()}</div>
            <button
              onClick={checkout}
              disabled={loading || cart.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {loading ? "Processing..." : "Checkout & Print"}
            </button>
          </div>

          {message && (
            <div className={`mt-3 p-2 rounded ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
