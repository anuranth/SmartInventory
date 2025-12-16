import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";

const PRODUCTS_API = "http://localhost:5000/api/products";
const SALES_API = "http://localhost:5000/api/sales";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [salesForm, setSalesForm] = useState({
    productId: "",
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    price: "",
  });
  const [products, setProducts] = useState([]);

  const loadSales = async () => {
    try {
      let salesRes = await fetch(SALES_API);
      if (!salesRes.ok) return setSales([]);
      const data = await salesRes.json();
      setSales(data);
    } catch (e) {
      console.error("Error loading: ", e);
    }
  };
  const loadProducts = async () => {
    try {
      let res = await fetch(PRODUCTS_API);
      if (!res.ok) return setProducts([]);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  useEffect(() => {
    loadSales();
    loadProducts();
  }, []);

  const addSale = async () => {
    const { productId, date, quantity, price } = salesForm;

    if (!productId || !date || !quantity || !price) {
      return alert("Please fill in all fields");
    }

    const res = await fetch(SALES_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: Number(productId),
        date,
        quantity: Number(quantity),
        price: Number(price),
      }),
    });

    if (res.ok) {
      // reset sales form
      setSalesForm({
        productId: "",
        date: "",
        quantity: "",
        price: "",
      });
      loadSales();

      alert("Successfully added sale");

      // loadSales(); // or refresh
    } else {
      alert("Failed to add sale");
    }
  };

  // const addToCart = (item, qty = 1) => {
  //   if (qty <= 0) return;
  //   const existing = cart.find((c) => c.id === item.id);
  //   if (existing) {
  //     setCart(
  //       cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + qty } : c))
  //     );
  //   } else {
  //     setCart([
  //       ...cart,
  //       { id: item.id, name: item.name, qty, price: item.price },
  //     ]);
  //   }
  // };

  // const updateCartQty = (id, qty) => {
  //   if (qty <= 0) {
  //     setCart(cart.filter((c) => c.id !== id));
  //   } else {
  //     setCart(cart.map((c) => (c.id === id ? { ...c, qty } : c)));
  //   }
  // };

  // const removeFromCart = (id) => setCart(cart.filter((c) => c.id !== id));
  // const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

  // --- Generate PDF ---

  // const generatePDF = () => {
  //   const doc = new jsPDF();
  //   doc.setFontSize(18);
  //   doc.text("Smart Inventory Bill", 14, 20);
  //   doc.setFontSize(12);
  //   doc.text(`Date: ${new Date().toLocaleString()}`, 14, 28);

  //   let y = 40;
  //   doc.text("Items:", 14, y);
  //   y += 6;

  //   cart.forEach((c, idx) => {
  //     doc.text(
  //       `${idx + 1}. ${c.name} - ${c.qty} × ₹${c.price} = ₹${(
  //         c.qty * c.price
  //       ).toLocaleString()}`,
  //       14,
  //       y
  //     );
  //     y += 6;
  //   });

  //   doc.text(`Total: ₹${total.toLocaleString()}`, 14, y + 6);
  //   doc.save(`Bill_${new Date().getTime()}.pdf`);
  // };

  // const checkout = async () => {
  //   if (cart.length === 0)
  //     return setMessage({ type: "error", text: "Cart is empty" });
  //   setLoading(true);
  //   setMessage(null);
  //   try {
  //     const body = { items: cart.map((c) => ({ id: c.id, qty: c.qty })) };
  //     const res = await fetch(SELL_API, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(body),
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.error || "Sale failed");

  //     setCart([]);
  //     setMessage({
  //       type: "success",
  //       text: `Sale completed. Total ₹${data.totalAmount.toLocaleString()}`,
  //     });
  //     fetchItems(); // refresh stock

  //     // Generate PDF bill
  //     generatePDF();
  //   } catch (err) {
  //     console.error(err);
  //     setMessage({ type: "error", text: err.message || "Checkout failed" });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sales</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-3">
          ➕ Add New Sale
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {/* PRODUCT DROPDOWN */}
          <select
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            value={salesForm.productId}
            onChange={(e) =>
              setSalesForm({ ...salesForm, productId: e.target.value })
            }
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_name}
              </option>
            ))}
          </select>

          {/* DATE */}
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            type="datetime-local"
            value={salesForm.date}
            onChange={(e) =>
              setSalesForm({ ...salesForm, date: e.target.value })
            }
          />

          {/* QUANTITY */}
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            type="number"
            placeholder="Quantity"
            value={salesForm.quantity}
            onChange={(e) =>
              setSalesForm({ ...salesForm, quantity: e.target.value })
            }
          />

          {/* PRICE */}
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            type="number"
            placeholder="Price"
            value={salesForm.price}
            onChange={(e) =>
              setSalesForm({ ...salesForm, price: e.target.value })
            }
          />

          {/* BUTTON */}
          <button
            onClick={addSale}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusCircle size={18} /> Add
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
            <h2 className="text-lg font-semibold text-white">
              📦 Sales Overview
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-100 border-b text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Quantity</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Stock Count</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center text-gray-500 py-6 italic bg-gray-50"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  sales.map((p, i) => (
                    <tr
                      key={p.sale_id}
                      className={`border-b hover:bg-blue-50 transition ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-3 font-medium text-gray-800">
                        {p.product.product_name}
                      </td>

                      <td className="p-3">
                        {p.product.category?.category_name || "-"}
                      </td>

                      {/* NEW: Quantity */}
                      <td className="p-3 font-semibold text-gray-800">
                        {p.quantity}
                      </td>

                      {/* NEW: Price */}
                      <td className="p-3 font-semibold text-gray-800">
                        ₹{p.price}
                      </td>

                      <td className="p-3 font-semibold text-blue-700">
                        {p.product.stocks?.reduce(
                          (sum, s) => sum + s.quantity,
                          0
                        ) || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
